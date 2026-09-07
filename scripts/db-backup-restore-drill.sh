#!/usr/bin/env bash
set -euo pipefail

if [[ "${RUN_DB_DRILL:-false}" != "true" ]]; then
	echo "Safety guard: set RUN_DB_DRILL=true to run the backup+restore drill."
	exit 1
fi

if ! command -v pg_dump >/dev/null 2>&1; then
	echo "Missing pg_dump in PATH."
	exit 1
fi

if ! command -v pg_restore >/dev/null 2>&1; then
	echo "Missing pg_restore in PATH."
	exit 1
fi

if ! command -v psql >/dev/null 2>&1; then
	echo "Missing psql in PATH."
	exit 1
fi

if [[ -z "${DATABASE_URL:-}" && -f ".env" ]]; then
	export DATABASE_URL="$(grep -E '^DATABASE_URL=' .env | head -n1 | cut -d= -f2-)"
fi

if [[ -n "${DATABASE_URL:-}" ]]; then
	# Support quoted values from .env files.
	DATABASE_URL="${DATABASE_URL%\"}"
	DATABASE_URL="${DATABASE_URL#\"}"
	DATABASE_URL="${DATABASE_URL%\'}"
	DATABASE_URL="${DATABASE_URL#\'}"
	export DATABASE_URL
fi

if [[ -z "${DATABASE_URL:-}" ]]; then
	echo "DATABASE_URL is required."
	exit 1
fi

TIMESTAMP="$(date -u +%Y%m%d%H%M%S)"
TMP_DIR="${TMPDIR:-/tmp}"
BACKUP_FILE="${TMP_DIR}/online_store_backup_drill_${TIMESTAMP}.dump"
RESTORE_DB_NAME="nextjsdb_restore_drill_${TIMESTAMP}"
RESTORE_DB_URL="$(node -e "const source = new URL(process.argv[1]); source.pathname = '/' + process.argv[2]; source.search = ''; console.log(source.toString());" "$DATABASE_URL" "$RESTORE_DB_NAME")"

cleanup() {
	psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -c "DROP DATABASE IF EXISTS \"${RESTORE_DB_NAME}\";" >/dev/null 2>&1 || true
}
trap cleanup EXIT

echo "[1/6] Creating source backup: ${BACKUP_FILE}"
pg_dump --format=custom --no-owner --no-privileges --dbname "$DATABASE_URL" --file "$BACKUP_FILE"

echo "[2/6] Recreating temporary restore database: ${RESTORE_DB_NAME}"
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -c "DROP DATABASE IF EXISTS \"${RESTORE_DB_NAME}\";"
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -c "CREATE DATABASE \"${RESTORE_DB_NAME}\";"

echo "[3/6] Restoring backup into temporary database"
pg_restore --no-owner --no-privileges --dbname "$RESTORE_DB_URL" "$BACKUP_FILE"

declare -a TABLES=(
	"\"user\""
	"\"Product\""
	"\"Order\""
	"\"OrderItem\""
	"\"Review\""
	"\"_prisma_migrations\""
)

echo "[4/6] Validating row counts"
FAILURES=0
for TABLE in "${TABLES[@]}"; do
	SOURCE_COUNT="$(psql "$DATABASE_URL" -At -c "SELECT COUNT(*) FROM ${TABLE};")"
	RESTORE_COUNT="$(psql "$RESTORE_DB_URL" -At -c "SELECT COUNT(*) FROM ${TABLE};")"

	printf "  - %s source=%s restore=%s\n" "$TABLE" "$SOURCE_COUNT" "$RESTORE_COUNT"
	if [[ "$SOURCE_COUNT" != "$RESTORE_COUNT" ]]; then
		FAILURES=$((FAILURES + 1))
	fi
done

echo "[5/6] Validating aggregate order total checksum"
SOURCE_TOTAL_SUM="$(psql "$DATABASE_URL" -At -c "SELECT COALESCE(SUM(\"total\"), 0)::text FROM \"Order\";")"
RESTORE_TOTAL_SUM="$(psql "$RESTORE_DB_URL" -At -c "SELECT COALESCE(SUM(\"total\"), 0)::text FROM \"Order\";")"
printf "  - \"Order\" total sum source=%s restore=%s\n" "$SOURCE_TOTAL_SUM" "$RESTORE_TOTAL_SUM"
if [[ "$SOURCE_TOTAL_SUM" != "$RESTORE_TOTAL_SUM" ]]; then
	FAILURES=$((FAILURES + 1))
fi

echo "[6/6] Cleanup: dropping temporary restore database"
cleanup
trap - EXIT

if [[ "$FAILURES" -ne 0 ]]; then
	echo "Backup+restore drill FAILED with ${FAILURES} mismatch(es)."
	exit 1
fi

echo "Backup+restore drill PASSED."
echo "Backup artifact kept at: ${BACKUP_FILE}"

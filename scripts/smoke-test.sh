#!/usr/bin/env bash
# Smoke test: verify critical endpoints on the live production services.
# Requires: NEXT_PUBLIC_APP_URL and ADMINJS_PUBLIC_URL set as CI/CD variables.
# Exits non-zero if any check fails. Set allow_failure: true in CI if you want
# the pipeline to continue regardless of smoke-test outcome.
set -euo pipefail

STOREFRONT="${NEXT_PUBLIC_APP_URL:-}"
ADMIN="${ADMINJS_PUBLIC_URL:-}"
WAIT_SECONDS="${SMOKE_WAIT_SECONDS:-90}"  # seconds to wait for deploys to propagate

if [ -z "$STOREFRONT" ]; then
  echo "ERROR: NEXT_PUBLIC_APP_URL is not set." >&2
  exit 1
fi
if [ -z "$ADMIN" ]; then
  echo "ERROR: ADMINJS_PUBLIC_URL is not set." >&2
  exit 1
fi

echo "Waiting ${WAIT_SECONDS}s for deployments to propagate..."
sleep "$WAIT_SECONDS"

FAILED=0

check() {
  local name="$1"
  local url="$2"
  local expected_pattern="$3"   # regex matched against HTTP status code
  local http_code
  http_code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 20 --retry 3 --retry-delay 5 "$url" || echo "000")
  if echo "$http_code" | grep -qE "$expected_pattern"; then
    echo "  PASS  $name  →  HTTP $http_code"
  else
    echo "  FAIL  $name  →  HTTP $http_code (expected $expected_pattern)  $url" >&2
    FAILED=1
  fi
}

echo ""
echo "=== Storefront: $STOREFRONT ==="

# Homepage — must return 200
check "Homepage"                          "$STOREFRONT/"                                         "^200$"

# Auth page — must render (200)
check "Sign-in page"                      "$STOREFRONT/sign-in"                                  "^200$"

# Cache revalidation endpoint — returns 401 without CRON_SECRET header
check "Cache revalidate (unauthenticated)" \
  "$STOREFRONT/api/cache/revalidate/windows?lookbackSeconds=60&limit=1"                          "^40[013]$"

# Stripe webhook — only accepts POST; GET should return 405 or 404
check "Stripe webhook (no POST)"          "$STOREFRONT/api/stripe/webhook"                       "^(405|404|400)$"

echo ""
echo "=== Admin panel: $ADMIN ==="

# Admin login page — must return 200
check "Admin login page"                  "$ADMIN"                                               "^200$"

echo ""
if [ "$FAILED" -eq 0 ]; then
  echo "All smoke checks passed."
else
  echo "One or more smoke checks failed. See output above." >&2
  exit 1
fi

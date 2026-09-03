#!/usr/bin/env bash
# Smoke test: verify critical endpoints on the live production services.
# Requires: NEXT_PUBLIC_APP_URL and ADMINJS_PUBLIC_URL set as CI/CD variables.
# Exits non-zero if a check still fails after its bounded retry window.
set -euo pipefail

STOREFRONT="${NEXT_PUBLIC_APP_URL:-}"
ADMIN="${ADMINJS_PUBLIC_URL:-}"
WAIT_SECONDS="${SMOKE_WAIT_SECONDS:-90}"  # seconds to wait for deploys to propagate
REQUEST_TIMEOUT_SECONDS="${SMOKE_REQUEST_TIMEOUT_SECONDS:-20}"
RETRY_DELAY_SECONDS="${SMOKE_RETRY_DELAY_SECONDS:-5}"
RETRY_WINDOW_SECONDS="${SMOKE_RETRY_WINDOW_SECONDS:-60}"
ADMIN_RETRY_WINDOW_SECONDS="${SMOKE_ADMIN_RETRY_WINDOW_SECONDS:-180}"

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
  local retry_window="${4:-$RETRY_WINDOW_SECONDS}"
  local http_code
  local deadline=$((SECONDS + retry_window))
  local attempt=1

  while true; do
    # -L follows redirects (for example, admin "/" -> "/admin/login").
    # An explicit loop is used instead of curl --retry because curl does not
    # retry timeouts unless --retry-all-errors is also supplied. Render's free
    # tier can take longer than one request timeout to wake after being idle.
    if ! http_code=$(curl -sS -L -o /dev/null -w "%{http_code}" \
      --connect-timeout 10 --max-time "$REQUEST_TIMEOUT_SECONDS" "$url"); then
      http_code="000"
    fi

    if echo "$http_code" | grep -qE "$expected_pattern"; then
      echo "  PASS  $name  →  HTTP $http_code (attempt $attempt)"
      return
    fi

    if [ "$SECONDS" -ge "$deadline" ]; then
      echo "  FAIL  $name  →  HTTP $http_code (expected $expected_pattern after ${retry_window}s)  $url" >&2
      FAILED=1
      return
    fi

    echo "  WAIT  $name  →  HTTP $http_code; retrying in ${RETRY_DELAY_SECONDS}s..."
    sleep "$RETRY_DELAY_SECONDS"
    attempt=$((attempt + 1))
  done
}

echo ""
echo "=== Storefront: $STOREFRONT ==="

# Homepage — must return 200
check "Homepage"                          "$STOREFRONT/"                                         "^200$"

# Better Auth session endpoint — validates that the auth runtime is reachable.
# Sign-in is presented as a modal in the storefront, so there is intentionally
# no standalone /sign-in page to smoke-test.
check "Auth session endpoint"              "$STOREFRONT/api/auth/get-session"                      "^200$"

# Cache revalidation endpoint — returns 401 without CRON_SECRET header
check "Cache revalidate (unauthenticated)" \
  "$STOREFRONT/api/cache/revalidate/windows?lookbackSeconds=60&limit=1"                          "^40[013]$"

# Stripe webhook — only accepts POST; GET should return 405 or 404
check "Stripe webhook (no POST)"          "$STOREFRONT/api/payments/stripe/webhook"              "^(405|404|400)$"

echo ""
echo "=== Admin panel: $ADMIN ==="

# Admin login page — must return 200
check "Admin login page"                  "$ADMIN"                                               "^200$" "$ADMIN_RETRY_WINDOW_SECONDS"

echo ""
if [ "$FAILED" -eq 0 ]; then
  echo "All smoke checks passed."
else
  echo "One or more smoke checks failed. See output above." >&2
  exit 1
fi

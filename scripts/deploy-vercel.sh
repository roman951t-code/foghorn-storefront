#!/usr/bin/env bash
# Trigger a Vercel production deployment via deploy hook.
# Set VERCEL_DEPLOY_HOOK_URL as a protected CI/CD variable in GitLab.
# Create the hook at: Vercel → Project → Settings → Git → Deploy Hooks
set -euo pipefail

: "${VERCEL_DEPLOY_HOOK_URL:?VERCEL_DEPLOY_HOOK_URL is not set. Add it as a protected CI/CD variable in GitLab.}"

echo "Triggering Vercel deployment..."
response_file=$(mktemp)
http_status=$(curl -s -o "$response_file" -w '%{http_code}' -X POST "$VERCEL_DEPLOY_HOOK_URL")
response=$(cat "$response_file")
rm -f "$response_file"

if [ "$http_status" -lt 200 ] || [ "$http_status" -ge 300 ]; then
  echo "Vercel deploy hook returned HTTP $http_status:"
  echo "$response"
  exit 1
fi

echo "$response"

# Extract the Vercel job URL from the response if present
job_id=$(echo "$response" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4 || true)
if [ -n "$job_id" ]; then
  echo "Vercel job ID: $job_id"
  echo "Monitor at: https://vercel.com/deployments/$job_id"
else
  echo "Deployment triggered. Monitor at: https://vercel.com/"
fi

echo ""
echo "Vercel builds and deploys asynchronously. The smoke-test job will verify"
echo "the live URL once this pipeline stage completes."
echo ""
echo "To wait for completion or inspect logs, use the Vercel dashboard or CLI:"
echo "  npx vercel@latest ls --token \$VERCEL_TOKEN"

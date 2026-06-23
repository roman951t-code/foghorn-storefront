#!/usr/bin/env bash
# Trigger a Render deployment via deploy hook.
# Set RENDER_DEPLOY_HOOK_URL as a protected CI/CD variable in GitLab.
# Create the hook at: Render → Service → Settings → Deploy Hook
set -euo pipefail

: "${RENDER_DEPLOY_HOOK_URL:?RENDER_DEPLOY_HOOK_URL is not set. Add it as a protected CI/CD variable in GitLab.}"

echo "Triggering Render deployment (AdminJS)..."
response=$(curl -sf -X POST "$RENDER_DEPLOY_HOOK_URL")
echo "$response"

deploy_id=$(echo "$response" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4 || true)
if [ -n "$deploy_id" ]; then
  echo "Render deploy ID: $deploy_id"
  echo "Monitor at: https://dashboard.render.com/"
else
  echo "Deployment triggered. Monitor at: https://dashboard.render.com/"
fi

echo ""
echo "Render deploys asynchronously. The smoke-test job will verify the"
echo "admin URL once this pipeline stage completes."

#!/bin/bash
set -e

APP_DIR="/root/NameMatrixTool2"
SERVICE_NAME="NameMatrixTool2"

echo "=== Deploy started: $(date) ==="

cd "$APP_DIR"

echo "→ Fetch latest code"
git fetch origin
git checkout main
git reset --hard origin/main

echo "→ Install dependencies"
npm install --production

echo "→ Restart systemd service"
systemctl restart "$SERVICE_NAME"

echo "→ Service status:"
systemctl --no-pager status "$SERVICE_NAME"

echo "=== Deploy finished successfully ==="


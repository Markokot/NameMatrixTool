#!/bin/bash
set -e

APP_DIR="/root/NameMatrixTool2"
SERVICE_NAME="NameMatrixTool2"
PORT=3000
LOG_FILE="$APP_DIR/deploy.log"

echo "=== Deploy started: $(date) ===" | tee -a $LOG_FILE

cd "$APP_DIR"

# 1️⃣ Останавливаем старый сервис и убиваем процессы на порту
echo "→ Stopping old service" | tee -a $LOG_FILE
systemctl stop "$SERVICE_NAME" || true
fuser -k $PORT/tcp || true

# 2️⃣ Обновляем код
echo "→ Fetching latest code" | tee -a $LOG_FILE
git fetch origin
git checkout main
git reset --hard origin/main

# 3️⃣ Устанавливаем все зависимости, включая devDependencies
echo "→ Installing dependencies" | tee -a $LOG_FILE
npm install

# 4️⃣ Сборка проекта
echo "→ Building project" | tee -a $LOG_FILE
npm run build

# 5️⃣ Перезапуск systemd
echo "→ Restarting service" | tee -a $LOG_FILE
systemctl daemon-reload
systemctl restart "$SERVICE_NAME"
systemctl status "$SERVICE_NAME" --no-pager | tee -a $LOG_FILE

echo "=== Deploy finished successfully: $(date) ===" | tee -a $LOG_FILE

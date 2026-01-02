#!/bin/bash
set -e

APP_DIR="/root/NameMatrixTool2"
SERVICE_NAME="NameMatrixTool2"
PORT=5000
LOG_FILE="$APP_DIR/deploy.log"

echo "=== Deploy started: $(date) ===" | tee -a $LOG_FILE

cd "$APP_DIR"

# 1️⃣ Останавливаем старый сервис и убиваем процессы на порту
echo "→ Stopping old service" | tee -a $LOG_FILE
systemctl stop "$SERVICE_NAME" || true
fuser -k $PORT/tcp || true

# 2️⃣ Сохраняем папку uploads, чтобы не потерять аватарки
if [ -d uploads ]; then
    echo "→ Backing up uploads folder" | tee -a $LOG_FILE
    cp -r uploads uploads_backup
fi

# 3️⃣ Обновляем код
echo "→ Fetching latest code" | tee -a $LOG_FILE
git fetch origin
git checkout main
git reset --hard origin/main

# 4️⃣ Устанавливаем все зависимости, включая devDependencies
echo "→ Installing dependencies" | tee -a $LOG_FILE
npm install

# 5️⃣ Сборка проекта
echo "→ Building project" | tee -a $LOG_FILE
npm run build

# 6️⃣ Восстанавливаем uploads, если была резервная копия
if [ -d uploads_backup ]; then
    echo "→ Restoring uploads folder" | tee -a $LOG_FILE
    rm -rf uploads
    mv uploads_backup uploads
fi

# 7️⃣ Перезапуск systemd
echo "→ Restarting service" | tee -a $LOG_FILE
systemctl daemon-reload
systemctl restart "$SERVICE_NAME"
systemctl status "$SERVICE_NAME" --no-pager | tee -a $LOG_FILE

echo "=== Deploy finished successfully: $(date) ===" | tee -a $LOG_FILE

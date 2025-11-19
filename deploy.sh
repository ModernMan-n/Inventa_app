#!/bin/bash
set -e

APP_DIR="/var/www/inventa"
BUILD_DIR="build"   # или "build" для CRA

cd "$APP_DIR"

echo "[DEPLOY] git pull..."
git pull origin main

echo "[DEPLOY] npm install..."
npm install --production=false

echo "[DEPLOY] npm run build..."
npm run build

echo "[DEPLOY] done."

#!/bin/bash

echo "================================================="
echo " Starting Backend and Frontend Development Servers"
echo "================================================="

echo ""
echo "[+] Starting Backend (FastAPI)..."
echo "    - Installing/Verifying dependencies in venv"
echo "    - Running uvicorn on http://127.0.0.1:8000"

# macOS에서 새 터미널 탭으로 Backend 실행
osascript -e 'tell application "Terminal" to do script "cd \"'$(pwd)'/backend\" && ./venv/bin/pip install -r requirements.txt && ./venv/bin/python -m uvicorn app.main:app --reload --port 8000"' &

sleep 2

echo ""
echo "[+] Starting Frontend (React + Vite)..."
echo "    - Running npm install and npm run dev"
echo "    - Access it at http://localhost:5173 (check console for exact URL)"

# macOS에서 새 터미널 탭으로 Frontend 실행
osascript -e 'tell application "Terminal" to do script "cd \"'$(pwd)'/frontend\" && echo \"Installing dependencies...\" && npm install && echo \"Starting Vite dev server...\" && npm run dev"' &

echo ""
echo "================================================="
echo " Servers are starting in separate Terminal tabs."
echo " You can close this window."
echo "================================================="
echo ""

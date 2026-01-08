@echo off
ECHO =================================================
ECHO  Starting Backend and Frontend Development Servers
ECHO =================================================

ECHO.
ECHO [+] Starting Backend (FastAPI)...
ECHO     - Installing/Verifying dependencies in venv
ECHO     - Running uvicorn on http://127.0.0.1:8000
START "Backend" cmd /k "cd backend && .\venv\Scripts\pip.exe install -r requirements.txt && .\venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8000"

ECHO.
ECHO [+] Starting Frontend (React + Vite)...
ECHO     - Running npm install and npm run dev
ECHO     - Access it at http://localhost:5173 (check console for exact URL)
START "Frontend" cmd /k "echo Moving to frontend directory... && cd frontend && echo Installing dependencies... && npm install && echo Starting Vite dev server... && npm run dev"

ECHO.
ECHO =================================================
ECHO  Servers are starting in separate windows.
ECHO  You can close this window.
ECHO =================================================


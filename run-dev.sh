#!/bin/bash

echo "================================================="
echo " Starting Backend and Frontend Development Servers"
echo "================================================="

# Trap Ctrl+C to kill all background processes
trap "echo ''; echo 'Shutting down servers...'; kill 0" EXIT

echo ""
echo "[+] Starting Backend (FastAPI)..."
echo "    - Running uvicorn on http://127.0.0.1:8000"
echo ""

# Start backend in background
cd backend
source venv/bin/activate
python -m uvicorn app.main:app --reload --port 8000 > ../backend.log 2>&1 &
BACKEND_PID=$!
cd ..

sleep 3

echo "[+] Starting Frontend (React + Vite)..."
echo "    - Running on http://localhost:5173"
echo ""

# Start frontend in background
cd frontend
npm run dev > ../frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..

sleep 2

echo "================================================="
echo " Both servers are running!"
echo "================================================="
echo ""
echo "  Backend:  http://localhost:8000"
echo "  Frontend: http://localhost:5173"
echo "  API Docs: http://localhost:8000/docs"
echo ""
echo "  Backend PID:  $BACKEND_PID"
echo "  Frontend PID: $FRONTEND_PID"
echo ""
echo "  Logs:"
echo "    - Backend:  tail -f backend.log"
echo "    - Frontend: tail -f frontend.log"
echo ""
echo "Press Ctrl+C to stop both servers"
echo "================================================="
echo ""

# Wait for background processes
wait

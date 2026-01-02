@echo off
echo 🚀 Starting AI Interviewer...

:: 1. Start Backend in a new window
start "Backend (Python)" cmd /k "call .venv\Scripts\activate && uvicorn backend.main:app --reload"

:: 2. Wait 5 seconds for backend to load
timeout /t 5

:: 3. Start Frontend in a new window
cd frontend-ui
start "Frontend (Astro)" cmd /k "npm run dev"

echo ✅ Both servers are running!
echo ---------------------------------------------------
echo Backend: http://127.0.0.1:8000
echo Frontend: http://localhost:4321
echo ---------------------------------------------------
pause
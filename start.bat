@echo off
title EchoTrace AI Orchestrator
color 0B

echo =======================================================
echo           ECHOTRACE AI START ORCHESTRATOR
echo =======================================================
echo.

:: Navigate to the directory where this script is located
cd /d "%~dp0"

:: Check if EchoTrace directory exists (in case we are in the workspace root)
if exist "EchoTrace\" (
    echo [INFO] Detected EchoTrace folder. Entering...
    cd EchoTrace
)

:: Ensure environment file is set up
if not exist ".env" (
    if exist ".env.example" (
        echo [INFO] Setting up .env file from .env.example...
        copy .env.example .env >nul
    ) else (
        echo [WARNING] .env.example not found. Make sure .env is configured.
    )
)

:: Start Qdrant Docker Container
echo [QDRANT] Starting Qdrant vector database via Docker...
docker compose up -d qdrant 2>nul
if %ERRORLEVEL% neq 0 (
    docker-compose up -d qdrant 2>nul
)

if %ERRORLEVEL% neq 0 (
    echo [WARNING] Failed to start Qdrant automatically. 
    echo Please make sure Docker Desktop is running.
    echo.
    echo We will still attempt to launch the Backend and Frontend...
    timeout /t 5 >nul
) else (
    echo [SUCCESS] Qdrant is running.
    echo.
)

:: Start Backend in a new window
echo [BACKEND] Launching Backend FastAPI service...
start "EchoTrace Backend (FastAPI)" cmd /k "title EchoTrace Backend && cd backend && (if not exist .venv (echo [INFO] Creating Python virtual environment... && python -m venv .venv && call .venv\Scripts\activate && echo [INFO] Installing requirements... && pip install -r requirements.txt) else (call .venv\Scripts\activate)) && echo [SUCCESS] Backend environment active. Starting Uvicorn... && uvicorn main:app --reload --port 8000"

:: Start Frontend in a new window
echo [FRONTEND] Launching Frontend Next.js app...
start "EchoTrace Frontend (Next.js)" cmd /k "title EchoTrace Frontend && cd frontend && (if not exist node_modules (echo [INFO] Installing frontend dependencies... && npm install) else (echo [INFO] Node modules detected. Running dev server...)) && npm run dev"

echo.
echo =======================================================
echo [SUCCESS] Orchestration complete!
echo.
echo  - Backend will run at:  http://localhost:8000
echo  - Interactive API docs: http://localhost:8000/docs
echo  - Frontend will run at: http://localhost:3000
echo =======================================================
echo.
echo This window can now be closed safely.
pause

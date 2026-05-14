@echo off
echo ================================================
echo Healthcare Queue Management System
echo ================================================
echo.

echo [1/3] Checking PostgreSQL...
psql -U postgres -c "SELECT version();" >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] PostgreSQL is not running or not installed!
    echo Please start PostgreSQL and try again.
    pause
    exit /b 1
)
echo [OK] PostgreSQL is running

echo.
echo [2/3] Creating database if not exists...
psql -U postgres -c "CREATE DATABASE queue_management;" 2>nul
if %errorlevel% equ 0 (
    echo [OK] Database created
) else (
    echo [OK] Database already exists
)

echo.
echo [3/3] Starting application...
echo.
echo Starting backend server...
start "Queue Management Backend" cmd /k "cd backend && set JAVA_HOME=C:\Program Files\Java\jdk-24 && mvnw.cmd spring-boot:run"

echo Waiting for backend to start...
timeout /t 10 /nobreak >nul

echo Starting frontend...
start "Queue Management Frontend" cmd /k "cd frontend && npm install && npm run dev"

echo.
echo ================================================
echo Application is starting!
echo ================================================
echo.
echo Backend: http://localhost:8080
echo Frontend: http://localhost:3000
echo.
echo Two new command windows will open.
echo Please wait for both servers to start completely.
echo.
echo Press any key to exit this window...
pause >nul

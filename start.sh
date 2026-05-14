#!/bin/bash

echo "================================================"
echo "Healthcare Queue Management System"
echo "================================================"
echo ""

# Check if PostgreSQL is running
echo "[1/3] Checking PostgreSQL..."
if ! pg_isready -q; then
    echo "[ERROR] PostgreSQL is not running!"
    echo "Please start PostgreSQL and try again."
    exit 1
fi
echo "[OK] PostgreSQL is running"

# Create database if not exists
echo ""
echo "[2/3] Creating database if not exists..."
psql -U postgres -c "CREATE DATABASE queue_management;" 2>/dev/null
if [ $? -eq 0 ]; then
    echo "[OK] Database created"
else
    echo "[OK] Database already exists"
fi

# Start backend
echo ""
echo "[3/3] Starting application..."
echo ""
echo "Starting backend server..."
cd backend
gnome-terminal --title="Queue Management Backend" -- bash -c "mvn spring-boot:run; exec bash" &
BACKEND_PID=$!

# Wait for backend
echo "Waiting for backend to start..."
sleep 10

# Start frontend
echo "Starting frontend..."
cd ../frontend
gnome-terminal --title="Queue Management Frontend" -- bash -c "npm install && npm run dev; exec bash" &
FRONTEND_PID=$!

echo ""
echo "================================================"
echo "Application is starting!"
echo "================================================"
echo ""
echo "Backend: http://localhost:8080"
echo "Frontend: http://localhost:3000"
echo ""
echo "Two new terminal windows have opened."
echo "Please wait for both servers to start completely."
echo ""
echo "Press Ctrl+C to exit this script."
echo "To stop the servers, close the terminal windows or press Ctrl+C in them."
echo ""

# Keep script running
wait

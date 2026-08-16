#!/bin/bash

# Resolve the absolute path of this workspace
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
BACKEND_DIR="$DIR/backend"
FRONTEND_DIR="$DIR/frontend"

# Execution commands
BACKEND_CMD="mvn spring-boot:run"
FRONTEND_CMD="npm run dev"

# Handle subcommands (e.g. ./run.sh reset-db)
if [ "$1" = "reset-db" ] || [ "$1" = "db:reset" ] || [ "$1" = "clean-db" ]; then
    bash "$DIR/scripts/reset_db.sh"
    exit 0
fi

# Helper to terminate processes occupying a specific port
kill_port() {
    local port=$1
    echo "Checking and clearing port $port..."
    if command -v fuser &> /dev/null; then
        fuser -k "$port/tcp" 2>/dev/null || true
    elif command -v lsof &> /dev/null; then
        local pid
        pid=$(lsof -t -i:"$port")
        if [ -n "$pid" ]; then
            kill -9 $pid 2>/dev/null || true
        fi
    fi
}

echo "========================================================"
echo "          Awais HR Enterprise SaaS Launcher"
echo "========================================================"

echo "Checking development tool requirements..."
if ! command -v mvn &> /dev/null; then
    echo "Error: Maven (mvn) is not installed."
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "Error: Node Package Manager (npm) is not installed."
    exit 1
fi

# Observability & Grafana Launcher (Disabled by default)
start_observability_platform() {
    echo "Notice: Docker and Grafana execution disabled per user configuration."
    return 0
}

start_observability_platform

# Clean ports first
kill_port 8080
kill_port 3000
kill_port 5173
echo "Ports cleared. Launching development environment..."
echo "--------------------------------------------------------"
echo "💻 Frontend Web App:          http://localhost:3000"
echo "⚙️ Backend API Engine:        http://localhost:8080"
echo "--------------------------------------------------------"

# Detect desktop environment terminal emulators
if command -v ptyxis &> /dev/null; then
    echo "Launching separate terminal windows using Ptyxis..."
    ptyxis -d "$BACKEND_DIR" -T "Awais HR - Backend (8080)" -- bash -c "$BACKEND_CMD; exec bash" &
    ptyxis -d "$FRONTEND_DIR" -T "Awais HR - Frontend (3000)" -- bash -c "$FRONTEND_CMD; exec bash" &
elif command -v gnome-terminal &> /dev/null; then
    echo "Launching separate terminal tabs using gnome-terminal..."
    gnome-terminal --title="Awais HR - Backend (8080)" --working-directory="$BACKEND_DIR" -- bash -c "$BACKEND_CMD; exec bash" &
    gnome-terminal --title="Awais HR - Frontend (3000)" --working-directory="$FRONTEND_DIR" -- bash -c "$FRONTEND_CMD; exec bash" &
elif command -v xfce4-terminal &> /dev/null; then
    echo "Launching separate terminal windows using xfce4-terminal..."
    xfce4-terminal --title="Awais HR - Backend" --working-directory="$BACKEND_DIR" -e "$BACKEND_CMD" &
    xfce4-terminal --title="Awais HR - Frontend" --working-directory="$FRONTEND_DIR" -e "$FRONTEND_CMD" &
elif command -v konsole &> /dev/null; then
    echo "Launching separate tabs using konsole..."
    konsole --workdir "$BACKEND_DIR" -e "$BACKEND_CMD" &
    konsole --workdir "$FRONTEND_DIR" -e "$FRONTEND_CMD" &
elif command -v x-terminal-emulator &> /dev/null; then
    echo "Launching separate windows using x-terminal-emulator..."
    x-terminal-emulator -e bash -c "cd '$BACKEND_DIR' && $BACKEND_CMD; exec bash" &
    x-terminal-emulator -e bash -c "cd '$FRONTEND_DIR' && $FRONTEND_CMD; exec bash" &
elif command -v xterm &> /dev/null; then
    echo "Launching separate windows using xterm..."
    xterm -title "Awais HR - Backend" -hold -e "cd $BACKEND_DIR && $BACKEND_CMD" &
    xterm -title "Awais HR - Frontend" -hold -e "cd $FRONTEND_DIR && $FRONTEND_CMD" &
else
    echo "No desktop terminal emulator detected. Running as background processes..."
    
    # Spawn background processes and redirect log outputs
    cd "$BACKEND_DIR" && $BACKEND_CMD > backend.log 2>&1 &
    BACKEND_PID=$!
    echo "Backend server started with PID $BACKEND_PID. Logs at: backend/backend.log"
    
    cd "$FRONTEND_DIR" && $FRONTEND_CMD > frontend.log 2>&1 &
    FRONTEND_PID=$!
    echo "Frontend server started with PID $FRONTEND_PID. Logs at: frontend/frontend.log"
    
    echo "--------------------------------------------------------"
    echo "To view backend logs:  tail -f backend/backend.log"
    echo "To view frontend logs: tail -f frontend/frontend.log"
    echo "Press Ctrl+C to terminate both servers."
    echo "--------------------------------------------------------"
    
    # Catch SIGINT (Ctrl+C) to terminate both servers cleanly
    trap "echo 'Stopping servers...'; kill $BACKEND_PID $FRONTEND_PID; exit" INT
    wait
fi

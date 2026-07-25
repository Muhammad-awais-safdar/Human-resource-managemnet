#!/bin/bash

# Resolve the absolute path of this workspace
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
BACKEND_DIR="$DIR/backend"
FRONTEND_DIR="$DIR/frontend"

# Handle subcommands (e.g. ./run.sh reset-db)
if [ "$1" = "reset-db" ] || [ "$1" = "db:reset" ] || [ "$1" = "clean-db" ]; then
    bash "$DIR/scripts/reset_db.sh"
    exit 0
fi

# Helper to terminate processes occupying a specific port
kill_port() {
    local port=$1
    echo "Clearing port $port..."
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

echo "Checking development tool requirements..."
if ! command -v mvn &> /dev/null; then
    echo "Error: Maven (mvn) is not installed."
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "Error: Node Package Manager (npm) is not installed."
    exit 1
fi

# Clean ports first
kill_port 8080
kill_port 5173
echo "Ports cleared. Launching development environment..."

# Detect desktop environment terminal emulators
if command -v gnome-terminal &> /dev/null; then
    echo "Launching separate terminal tabs using gnome-terminal..."
    gnome-terminal --title="Awais HR - Backend" --working-directory="$BACKEND_DIR" -- bash -c "mvn spring-boot:run; exec bash" &
    gnome-terminal --title="Awais HR - Frontend" --working-directory="$FRONTEND_DIR" -- bash -c "npm run dev; exec bash" &
elif command -v xfce4-terminal &> /dev/null; then
    echo "Launching separate terminal windows using xfce4-terminal..."
    xfce4-terminal --title="Awais HR - Backend" --working-directory="$BACKEND_DIR" -e "mvn spring-boot:run" &
    xfce4-terminal --title="Awais HR - Frontend" --working-directory="$FRONTEND_DIR" -e "npm run dev" &
elif command -v konsole &> /dev/null; then
    echo "Launching separate tabs using konsole..."
    konsole --workdir "$BACKEND_DIR" -e "mvn spring-boot:run" &
    konsole --workdir "$FRONTEND_DIR" -e "npm run dev" &
elif command -v xterm &> /dev/null; then
    echo "Launching separate windows using xterm..."
    xterm -title "Awais HR - Backend" -hold -e "cd $BACKEND_DIR && mvn spring-boot:run" &
    xterm -title "Awais HR - Frontend" -hold -e "cd $FRONTEND_DIR && npm run dev" &
else
    echo "No desktop terminal emulator detected. Running as background processes..."
    
    # Spawn background processes and redirect log outputs
    cd "$BACKEND_DIR" && mvn spring-boot:run > backend.log 2>&1 &
    BACKEND_PID=$!
    echo "Backend server started with PID $BACKEND_PID. Logs at: backend/backend.log"
    
    cd "$FRONTEND_DIR" && npm run dev > frontend.log 2>&1 &
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

#!/bin/bash

# Dedicated standalone monitoring stop script
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

echo "Stopping Awais HR Standalone Monitoring Stack..."
cd "$DIR"
docker compose down

echo "Monitoring stack stopped."

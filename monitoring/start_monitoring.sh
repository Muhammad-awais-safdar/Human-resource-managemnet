#!/bin/bash

# Dedicated standalone monitoring launcher script
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

echo "========================================================"
echo "          Awais HR Standalone Monitoring Stack Launcher"
echo "========================================================"

# Ensure shared Docker network exists
docker network create awais-hr-network 2>/dev/null || true

cd "$DIR"
docker compose up -d

echo "--------------------------------------------------------"
echo "📊 Grafana Dashboard:   http://localhost:3001 (admin/admin)"
echo "🔥 Prometheus Metrics:  http://localhost:9090"
echo "📜 Loki Log Engine:     http://localhost:3100"
echo "⏱️ Tempo Tracing:       http://localhost:3200"
echo "--------------------------------------------------------"

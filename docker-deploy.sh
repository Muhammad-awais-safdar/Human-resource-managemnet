#!/usr/bin/env bash

set -e

echo "=========================================================="
echo "🚀 Awais HR Enterprise SaaS — DevOps Container Deployer"
echo "=========================================================="

if [ ! -f .env ]; then
  echo "📋 Copying .env.docker.example to .env..."
  cp .env.docker.example .env
fi

echo "🔍 Validating Docker environment..."
docker compose config > /dev/null

echo "🔨 Building multi-stage production container images..."
docker compose build --parallel

echo "⚡ Starting enterprise platform containers (MySQL, Redis, Backend, Frontend)..."
docker compose up -d

echo "⏳ Waiting for health check readiness..."
until [ "$(docker inspect --format='{{.State.Health.Status}}' awais-hr-backend 2>/dev/null)" == "healthy" ]; do
    echo "   Backend container initializing... (checking actuator/health)"
    sleep 3
done

echo ""
echo "=========================================================="
echo "✅ Awais HR Enterprise SaaS is Live & Operational!"
echo "=========================================================="
echo "🌐 Frontend Web App: [http://localhost:3000]"
echo "⚡ Backend REST API: [http://localhost:8080/api/v1/actuator/health]"
echo "=========================================================="

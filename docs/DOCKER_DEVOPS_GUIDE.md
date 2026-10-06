# Awais HR — Enterprise DevOps Container Architecture Guide

## 1. Executive Summary

The **Awais HR SaaS Platform** leverages a production-grade **Docker & Docker Compose Container Architecture** engineered for security, high performance, layer-cached multi-stage builds, unprivileged process execution, and seamless container telemetry integration.

---

## 2. Container Security & Performance Optimizations

### A. Backend Container (`backend/Dockerfile`)
- **Multi-Stage Caching**: Caches Maven dependencies in `deps` stage via `mvn dependency:go-offline`.
- **Security Hardening**: Executes runtime inside Jammy JRE as an unprivileged system user (`appuser:appgroup` / UID 10001).
- **JVM Memory Tuning**: Configured with `-XX:+UseG1GC -XX:MaxRAMPercentage=75.0` to adapt dynamically to container cgroup memory limits.
- **Actuator Health Probe**: Container health tracked via `/api/v1/actuator/health`.

### B. Frontend Container (`frontend/Dockerfile`)
- **Standalone Tracing**: Built with Next.js `standalone` mode to strip unnecessary node_modules and optimize layer footprint.
- **Unprivileged Runtime**: Executes as `nextjs:nodejs` (UID 1001).
- **Built-in Healthcheck**: Automatic HTTP ping on port 3000.

### C. Primary Database Engine (`mysql`)
- **Collation**: Configured with `utf8mb4_unicode_ci` and `max_connections=300`.
- **Health Validation**: Uses `mysqladmin ping` for database readiness checking before backend boot.

### D. Multi-Tenant Cache Engine (`redis`)
- **Memory Cap**: Capped at `256mb` with LRU eviction (`allkeys-lru`).

---

## 3. Launch Instructions

```bash
# Option 1: Using the DevOps Deployer Script
./docker-deploy.sh

# Option 2: Direct Docker Compose
docker compose up -d --build
```

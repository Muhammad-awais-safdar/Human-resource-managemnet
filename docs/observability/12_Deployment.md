# 12 - Production Deployment Guide

## Deployment Environment Setup
1. Clone project repository to host machine.
2. Verify Docker and Docker Compose plugin are installed (`docker compose version`).
3. Set environment secrets (SMTP password, Slack Webhooks) in `.env`.
4. Launch stack:
   ```bash
   docker compose up -d --build
   ```

## Kubernetes Migration Path
To deploy on Kubernetes / EKS / GKE / AKS:
- Use Prometheus Operator (`kube-prometheus-stack`) Helm chart.
- Use Grafana Loki Helm chart (`loki-stack`).
- Use Grafana Tempo Operator.

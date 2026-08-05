# 07 - Spring Boot Actuator Endpoints

## Exposed Actuator Endpoints
Located under base path `/api/v1/actuator`:
- `/api/v1/actuator/health`: System health status (includes Kubernetes Liveness `/liveness` and Readiness `/readiness`)
- `/api/v1/actuator/prometheus`: Prometheus scrape endpoint format
- `/api/v1/actuator/metrics`: List of registered Micrometer meters
- `/api/v1/actuator/info`: Application version & build info
- `/api/v1/actuator/httpexchanges`: Recent HTTP request trace history
- `/api/v1/actuator/threaddump`: Real-time JVM thread dump
- `/api/v1/actuator/heapdump`: JVM memory heap dump generation

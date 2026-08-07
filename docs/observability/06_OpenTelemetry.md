# 06 - OpenTelemetry SDK & Propagation

## Context Propagation
The backend uses standard **W3C Trace Context** (`traceparent`, `tracestate`) and **B3 Multi-Header** propagation formats.

## Spring Boot Instrumentation
Spring Boot 3.3 Micrometer Tracing bridge automatically instruments:
- Incoming HTTP request servlets & filters
- Outbound REST Client / RestTemplate calls
- HikariCP JDBC DataSource executions & transactions
- Spring Data Redis cache queries

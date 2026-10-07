# ===================================================================
# AWAIS HR — OPTIMIZED ENTERPRISE BACKEND DOCKERFILE
# Multi-stage Layered Build for Fast Layer Caching & Security
# ===================================================================

# Stage 1: Dependency Caching Stage
FROM maven:3.9-eclipse-temurin-21-jammy AS deps
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Stage 2: Application Builder & Layer Extractor Stage
FROM maven:3.9-eclipse-temurin-21-jammy AS builder
WORKDIR /app
COPY --from=deps /root/.m2 /root/.m2
COPY pom.xml .
COPY src ./src
RUN mvn package -DskipTests -B \
    && cd target \
    && java -Djarmode=layertools -jar hr-0.0.1-SNAPSHOT.jar extract

# Stage 3: Production Hardened Runtime Stage
FROM eclipse-temurin:21-jre-jammy AS runner
WORKDIR /app

# Security: Dedicated unprivileged system user & group (UID 10001)
RUN groupadd -r appgroup && useradd -r -g appgroup -u 10001 appuser \
    && mkdir -p /tmp/app-logs && chown -R appuser:appgroup /app /tmp/app-logs

# Copy extracted layers (order optimized for Docker layer caching)
COPY --from=builder --chown=appuser:appgroup /app/target/dependencies/ ./
COPY --from=builder --chown=appuser:appgroup /app/target/spring-boot-loader/ ./
COPY --from=builder --chown=appuser:appgroup /app/target/snapshot-dependencies/ ./
COPY --from=builder --chown=appuser:appgroup /app/target/application/ ./

USER appuser:appgroup

EXPOSE 8080

# Production JVM Container Tuning
ENV JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -XX:+UseG1GC -XX:+ExitOnOutOfMemoryError -Djava.security.egd=file:/dev/./urandom"

HEALTHCHECK --interval=15s --timeout=5s --start-period=30s --retries=5 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/api/v1/actuator/health || exit 1

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS org.springframework.boot.loader.launch.JarLauncher"]

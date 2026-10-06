# ==========================================
# 1. Dependency Resolution & Caching Stage
# ==========================================
FROM maven:3.9-eclipse-temurin-21-jammy AS deps
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline -B

# ==========================================
# 2. Application Builder Stage
# ==========================================
FROM maven:3.9-eclipse-temurin-21-jammy AS builder
WORKDIR /app
COPY --from=deps /root/.m2 /root/.m2
COPY pom.xml .
COPY src ./src
RUN mvn package -DskipTests -B

# ==========================================
# 3. Production Runtime Stage (Security Hardened)
# ==========================================
FROM eclipse-temurin:21-jre-jammy AS runner
WORKDIR /app

# Senior DevOps Security: Create dedicated unprivileged system user & group
RUN groupadd -r appgroup && useradd -r -g appgroup -u 10001 appuser \
    && mkdir -p /tmp/app-logs && chown -R appuser:appgroup /app /tmp/app-logs

COPY --from=builder --chown=appuser:appgroup /app/target/hr-*.jar app.jar

USER appuser:appgroup

EXPOSE 8080

# Production JVM Performance & Memory Optimization Tuning
ENV JAVA_OPTS="-XX:+UseG1GC -XX:MaxRAMPercentage=75.0 -XX:+ExitOnOutOfMemoryError -Djava.security.egd=file:/dev/./urandom"

HEALTHCHECK --interval=15s --timeout=5s --start-period=40s --retries=5 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/api/v1/actuator/health || exit 1

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]

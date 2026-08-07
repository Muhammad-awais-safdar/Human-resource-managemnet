# Stage 1: Build Maven Jar Package
FROM maven:3.9-eclipse-temurin-21-jammy AS builder
WORKDIR /app

COPY pom.xml .
COPY src ./src

RUN mvn package -DskipTests

# Stage 2: Runtime Container
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app

# Copy built application jar from builder stage
COPY --from=builder /app/target/hr-*.jar app.jar

# Expose server port
EXPOSE 8080

# Run Spring Boot Application
ENTRYPOINT ["java", "-jar", "app.jar"]

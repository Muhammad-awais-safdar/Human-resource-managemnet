FROM eclipse-temurin:21-jre-jammy
WORKDIR /app

# Copy built application jar
COPY target/hr-*.jar app.jar

# Expose server port
EXPOSE 8080

# Run Spring Boot Application
ENTRYPOINT ["java", "-jar", "app.jar"]

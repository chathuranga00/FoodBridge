# =============================================================================
# FoodBridge Spring Boot 3 REST API - Production Dockerfile
# Multi-stage optimized build for Render / Cloud Containers
# =============================================================================

# -----------------------------------------------------------------------------
# Stage 1: Build Application
# -----------------------------------------------------------------------------
FROM eclipse-temurin:21-jdk-jammy AS builder

WORKDIR /build

# Copy Maven wrapper and POM first to leverage Docker layer caching
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./
RUN chmod +x mvnw && ./mvnw dependency:go-offline -B

# Copy application source code and compile
COPY src/ ./src/
RUN ./mvnw clean package -DskipTests -B

# -----------------------------------------------------------------------------
# Stage 2: Production Runtime
# -----------------------------------------------------------------------------
FROM eclipse-temurin:21-jre-jammy AS runner

# Create non-privileged user and group for hardened runtime
RUN groupadd -g 10001 appgroup && \
    useradd -u 10001 -g appgroup -s /bin/bash -m appuser

WORKDIR /app

# Copy the generated executable JAR from the builder stage
COPY --from=builder --chown=appuser:appgroup /build/target/foodbridge-backend-*.jar app.jar

# Switch to non-root user
USER appuser:appgroup

# Render dynamic port binding (default 8080)
ENV PORT=8080
EXPOSE 8080

# Hardened JVM options for container environments (auto-scales with Render RAM)
ENV JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -Djava.security.egd=file:/dev/./urandom"

# Healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=45s --retries=3 \
  CMD curl -f http://localhost:${PORT}/api/health || exit 1

ENTRYPOINT ["sh", "-c", "exec java $JAVA_OPTS -jar app.jar"]

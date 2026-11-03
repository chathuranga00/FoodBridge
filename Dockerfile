# =============================================================================
# FoodBridge Spring Boot 3 REST API - Root Dockerfile
# Enables direct Render deployment when Root Directory is repository root
# =============================================================================

FROM eclipse-temurin:21-jdk-jammy AS builder

WORKDIR /build

# Copy backend maven configuration
COPY backend/.mvn/ backend/.mvn/
COPY backend/mvnw backend/pom.xml ./backend/
WORKDIR /build/backend
RUN chmod +x mvnw && ./mvnw dependency:go-offline -B

# Copy backend source
COPY backend/src/ ./src/
RUN ./mvnw clean package -DskipTests -B

# -----------------------------------------------------------------------------
# Stage 2: Production Runtime
# -----------------------------------------------------------------------------
FROM eclipse-temurin:21-jre-jammy AS runner

RUN groupadd -g 10001 appgroup && \
    useradd -u 10001 -g appgroup -s /bin/bash -m appuser

WORKDIR /app

COPY --from=builder --chown=appuser:appgroup /build/backend/target/foodbridge-backend-*.jar app.jar

USER appuser:appgroup

ENV PORT=8080
EXPOSE 8080

ENV JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -Djava.security.egd=file:/dev/./urandom"

HEALTHCHECK --interval=30s --timeout=5s --start-period=45s --retries=3 \
  CMD curl -f http://localhost:${PORT}/api/health || exit 1

ENTRYPOINT ["sh", "-c", "exec java $JAVA_OPTS -jar app.jar"]

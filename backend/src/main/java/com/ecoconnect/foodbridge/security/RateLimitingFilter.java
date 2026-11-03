package com.ecoconnect.foodbridge.security;

import com.ecoconnect.foodbridge.exception.ErrorResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Security Rate Limiting Filter to protect sensitive authentication endpoints
 * against brute-force, password-spraying, and denial-of-service (DoS) attacks.
 *
 * Enforces a sliding-window rate limit per client IP on:
 * - /api/auth/login
 * - /api/auth/register
 * - /api/auth/refresh
 *
 * Returns HTTP 429 Too Many Requests with a Retry-After header and uniform JSON ErrorResponse.
 */
@Component
public class RateLimitingFilter extends OncePerRequestFilter {

    private static final long WINDOW_MS = 60_000L; // 1 minute sliding window

    // Thread-safe map: IP -> timestamps of requests within window
    private static final Map<String, Deque<Long>> requestLogByIp = new ConcurrentHashMap<>();

    private static volatile Integer testingOverrideLimit = null;

    private final boolean enabled;
    private final int configuredMaxRequests;
    private final ObjectMapper objectMapper = new ObjectMapper().registerModule(new JavaTimeModule());

    public RateLimitingFilter(
            @Value("${foodbridge.security.rate-limiting.enabled:true}") boolean enabled,
            @Value("${foodbridge.security.rate-limiting.max-requests-per-minute:60}") int configuredMaxRequests) {
        this.enabled = enabled;
        this.configuredMaxRequests = configuredMaxRequests;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        if (enabled && isAuthEndpoint(request.getRequestURI())) {
            String clientIp = extractClientIp(request);
            long now = System.currentTimeMillis();

            if (isRateLimited(clientIp, now)) {
                sendRateLimitResponse(request, response);
                return;
            }
        }

        filterChain.doFilter(request, response);
    }

    private boolean isAuthEndpoint(String path) {
        return path != null && (
                path.equals("/api/auth/login") ||
                path.equals("/api/auth/register") ||
                path.equals("/api/auth/refresh") ||
                path.startsWith("/api/auth/login/") ||
                path.startsWith("/api/auth/register/")
        );
    }

    private synchronized boolean isRateLimited(String clientIp, long now) {
        int maxLimit = testingOverrideLimit != null ? testingOverrideLimit : configuredMaxRequests;

        Deque<Long> timestamps = requestLogByIp.computeIfAbsent(clientIp, k -> new ArrayDeque<>());

        // Evict expired timestamps older than 1 minute
        while (!timestamps.isEmpty() && (now - timestamps.peekFirst()) > WINDOW_MS) {
            timestamps.pollFirst();
        }

        if (timestamps.size() >= maxLimit) {
            return true;
        }

        timestamps.addLast(now);
        return false;
    }

    private void sendRateLimitResponse(HttpServletRequest request, HttpServletResponse response) throws IOException {
        response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setHeader("Retry-After", "60");

        ErrorResponse errorResponse = ErrorResponse.builder()
                .timestamp(OffsetDateTime.now(ZoneOffset.UTC))
                .status(HttpStatus.TOO_MANY_REQUESTS.value())
                .error(HttpStatus.TOO_MANY_REQUESTS.getReasonPhrase())
                .message("Rate limit exceeded for authentication requests. Please try again after 60 seconds.")
                .path(request.getRequestURI())
                .build();

        response.getOutputStream().println(objectMapper.writeValueAsString(errorResponse));
    }

    private String extractClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isBlank()) {
            return xForwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr() != null ? request.getRemoteAddr() : "unknown";
    }

    // Testing helpers
    public static void setMaxRequestsForTesting(int limit) {
        testingOverrideLimit = limit;
        requestLogByIp.clear();
    }

    public static void resetLimitForTesting() {
        testingOverrideLimit = null;
        requestLogByIp.clear();
    }
}

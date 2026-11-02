package com.ecoconnect.foodbridge.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.annotation.web.configurers.HeadersConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfigurationSource;

/**
 * Spring Security configuration implementing Role-Based Access Control (RBAC).
 *
 * Non-negotiable platform rules enforced:
 * - Rule 1: Role-based access control on every endpoint.
 * - Stateless JWT-based session model.
 * - Public access strictly restricted to health probes and designated public paths.
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {

    private final CorsConfigurationSource corsConfigurationSource;

    public SecurityConfig(CorsConfigurationSource corsConfigurationSource) {
        this.corsConfigurationSource = corsConfigurationSource;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // Enable CORS with custom configuration
            .cors(cors -> cors.configurationSource(corsConfigurationSource))

            // Disable CSRF for stateless RESTful APIs
            .csrf(AbstractHttpConfigurer::disable)

            // Stateless session management
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

            // Frame options disabled for H2 console development if needed
            .headers(headers -> headers.frameOptions(HeadersConfigurer.FrameOptionsConfig::disable))

            // Endpoint authorization
            .authorizeHttpRequests(auth -> auth
                // Public health check and info
                .requestMatchers("/api/health").permitAll()
                // Public authentication and guest endpoints
                .requestMatchers("/api/auth/**", "/api/public/**").permitAll()
                // Local dev H2 console
                .requestMatchers("/h2-console/**").permitAll()
                // Any other endpoint requires authentication (RBAC rules apply)
                .anyRequest().authenticated()
            );

        return http.build();
    }
}


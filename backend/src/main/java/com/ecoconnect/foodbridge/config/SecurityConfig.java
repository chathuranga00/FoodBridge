package com.ecoconnect.foodbridge.config;

import com.ecoconnect.foodbridge.security.JwtAccessDeniedHandler;
import com.ecoconnect.foodbridge.security.JwtAuthenticationEntryPoint;
import com.ecoconnect.foodbridge.security.JwtAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.annotation.web.configurers.HeadersConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfigurationSource;

/**
 * Spring Security configuration implementing Role-Based Access Control (RBAC).
 *
 * Non-negotiable platform rules enforced:
 * - Rule 1: Role-based access control on every endpoint.
 * - Stateless JWT-based session model.
 * - Passwords encrypted using standard BCrypt hash.
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {

    private final CorsConfigurationSource corsConfigurationSource;
    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;
    private final JwtAccessDeniedHandler jwtAccessDeniedHandler;

    public SecurityConfig(CorsConfigurationSource corsConfigurationSource,
                          JwtAuthenticationFilter jwtAuthenticationFilter,
                          JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint,
                          JwtAccessDeniedHandler jwtAccessDeniedHandler) {
        this.corsConfigurationSource = corsConfigurationSource;
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
        this.jwtAuthenticationEntryPoint = jwtAuthenticationEntryPoint;
        this.jwtAccessDeniedHandler = jwtAccessDeniedHandler;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception {
        return configuration.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // Enable CORS with custom configuration
            .cors(cors -> cors.configurationSource(corsConfigurationSource))

            // Disable CSRF for stateless RESTful APIs
            .csrf(AbstractHttpConfigurer::disable)

            // Exception handling with uniform JSON format
            .exceptionHandling(ex -> ex
                .authenticationEntryPoint(jwtAuthenticationEntryPoint)
                .accessDeniedHandler(jwtAccessDeniedHandler)
            )

            // Stateless session management
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

            // Frame options disabled for H2 console development
            .headers(headers -> headers.frameOptions(HeadersConfigurer.FrameOptionsConfig::disable))

            // Endpoint authorization
            .authorizeHttpRequests(auth -> auth
                // Public health check and info
                .requestMatchers("/api/health").permitAll()
                // Public authentication and guest endpoints
                .requestMatchers(
                    "/api/auth/register",
                    "/api/auth/login",
                    "/api/auth/refresh",
                    "/api/public/**"
                ).permitAll()
                // Public browse for grocery discount offers and community campaigns
                .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/grocery/offers", "/api/grocery/offers/*").permitAll()
                .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/campaigns", "/api/campaigns/*", "/api/campaigns/*/updates").permitAll()
                .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/partnerships/campaign/*/recognitions", "/api/partnerships/business/*/recognitions").permitAll()
                // Public Explore Map pins and area locations
                .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/map/**").permitAll()
                // Current authenticated user profile
                .requestMatchers("/api/auth/me").authenticated()
                // Local dev H2 console
                .requestMatchers("/h2-console/**").permitAll()
                // Any other endpoint requires authentication (RBAC rules apply)
                .anyRequest().authenticated()
            )

            // Add JWT filter
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}

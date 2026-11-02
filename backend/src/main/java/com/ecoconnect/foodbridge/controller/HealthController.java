package com.ecoconnect.foodbridge.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.sql.DataSource;
import java.sql.Connection;
import java.time.Instant;
import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Health check controller for monitoring and service verification.
 * Accessible without authentication to satisfy load balancers (e.g., Render)
 * and frontend status verification.
 */
@RestController
@RequestMapping("/api")
public class HealthController {

    private final DataSource dataSource;
    private final Environment environment;

    @Autowired
    public HealthController(@Autowired(required = false) DataSource dataSource, Environment environment) {
        this.dataSource = dataSource;
        this.environment = environment;
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> getHealth() {
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("status", "UP");
        response.put("service", "FoodBridge REST API");
        response.put("team", "EcoConnect");
        response.put("timestamp", Instant.now().toString());
        response.put("version", "1.0.0");
        response.put("profiles", Arrays.asList(environment.getActiveProfiles()));

        // Database connectivity probe
        Map<String, Object> databaseStatus = new LinkedHashMap<>();
        if (dataSource != null) {
            try (Connection connection = dataSource.getConnection()) {
                boolean valid = connection.isValid(2);
                databaseStatus.put("connected", valid);
                databaseStatus.put("productName", connection.getMetaData().getDatabaseProductName());
                databaseStatus.put("databaseVersion", connection.getMetaData().getDatabaseProductVersion());
            } catch (Exception e) {
                databaseStatus.put("connected", false);
                databaseStatus.put("error", e.getMessage());
            }
        } else {
            databaseStatus.put("connected", false);
            databaseStatus.put("message", "DataSource bean not initialized");
        }
        response.put("database", databaseStatus);

        // Defined platform roles
        response.put("supportedRoles", List.of(
                "ADMIN",
                "RESTAURANT",
                "GROCERY",
                "CHARITY",
                "ANIMAL_ORG",
                "USER"
        ));

        return ResponseEntity.ok(response);
    }
}


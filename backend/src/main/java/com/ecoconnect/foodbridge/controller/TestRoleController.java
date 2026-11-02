package com.ecoconnect.foodbridge.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * Controller demonstrating role-based method security annotations
 * (@PreAuthorize) adhering to Rule 1: Role-based access control on every endpoint.
 */
@RestController
@RequestMapping("/api/test")
public class TestRoleController {

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> adminEndpoint() {
        return ResponseEntity.ok(Map.of("message", "Welcome Admin - administrative access confirmed"));
    }

    @GetMapping("/restaurant")
    @PreAuthorize("hasRole('RESTAURANT')")
    public ResponseEntity<Map<String, String>> restaurantEndpoint() {
        return ResponseEntity.ok(Map.of("message", "Welcome Restaurant - donor access confirmed"));
    }

    @GetMapping("/charity")
    @PreAuthorize("hasRole('CHARITY')")
    public ResponseEntity<Map<String, String>> charityEndpoint() {
        return ResponseEntity.ok(Map.of("message", "Welcome Charity - recipient access confirmed"));
    }

    @GetMapping("/authenticated")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, String>> authenticatedEndpoint() {
        return ResponseEntity.ok(Map.of("message", "Authenticated user verified"));
    }
}


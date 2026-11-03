package com.ecoconnect.foodbridge.controller;

import com.ecoconnect.foodbridge.service.DemoDataSeedService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Public controller to trigger or inspect realistic demonstration data for Kandy and nearby rural areas.
 * Safe for evaluation and local testing.
 */
@RestController
@RequestMapping("/api/public/demo-data")
public class DemoDataController {

    private final DemoDataSeedService demoDataSeedService;

    public DemoDataController(DemoDataSeedService demoDataSeedService) {
        this.demoDataSeedService = demoDataSeedService;
    }

    /**
     * Inspects current demo data state in the database.
     */
    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getStatus() {
        return ResponseEntity.ok(demoDataSeedService.getDemoDataStatus());
    }

    /**
     * Seeds or refreshes realistic Kandy demo data (restaurants, groceries, charities, campaigns, impact).
     */
    @PostMapping("/seed")
    public ResponseEntity<Map<String, Object>> seedData(
            @RequestParam(name = "force", required = false, defaultValue = "false") boolean force) {
        Map<String, Object> result = demoDataSeedService.seedAllDemoData(force);
        return ResponseEntity.ok(result);
    }
}

package com.ecoconnect.foodbridge.controller;

import com.ecoconnect.foodbridge.dto.PlatformSettingsDto;
import com.ecoconnect.foodbridge.service.AdminService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/public/settings")
public class PublicSettingsController {

    private final AdminService adminService;

    public PublicSettingsController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping
    public ResponseEntity<PlatformSettingsDto> getPublicSettings() {
        return ResponseEntity.ok(adminService.getSettings());
    }
}


package com.ecoconnect.foodbridge.controller;

import com.ecoconnect.foodbridge.dto.*;
import com.ecoconnect.foodbridge.model.enums.CampaignStatus;
import com.ecoconnect.foodbridge.model.enums.ContributionStatus;
import com.ecoconnect.foodbridge.model.enums.ContributionType;
import com.ecoconnect.foodbridge.model.enums.Role;
import com.ecoconnect.foodbridge.service.AdminService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminPlatformController {

    private final AdminService adminService;

    public AdminPlatformController(AdminService adminService) {
        this.adminService = adminService;
    }

    // 1. Platform Overview
    @GetMapping("/overview")
    public ResponseEntity<PlatformOverviewDto> getPlatformOverview() {
        return ResponseEntity.ok(adminService.getPlatformOverview());
    }

    // 2. User Management
    @GetMapping("/users")
    public ResponseEntity<List<AdminUserDto>> searchUsers(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Role role,
            @RequestParam(required = false) String status) {
        return ResponseEntity.ok(adminService.searchUsers(search, role, status));
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<AdminUserDto> getUserDetails(@PathVariable UUID id) {
        return ResponseEntity.ok(adminService.getUserDetails(id));
    }

    @PutMapping("/users/{id}/status")
    public ResponseEntity<AdminUserDto> updateUserStatus(
            Authentication authentication,
            @PathVariable UUID id,
            @Valid @RequestBody UpdateUserStatusRequest request,
            HttpServletRequest servletRequest) {
        String clientIp = servletRequest.getRemoteAddr();
        AdminUserDto updated = adminService.updateUserStatus(
                authentication.getName(),
                id,
                request.getIsActive(),
                request.getReason(),
                clientIp
        );
        return ResponseEntity.ok(updated);
    }

    @PutMapping("/users/{id}/role")
    public ResponseEntity<AdminUserDto> updateUserRole(
            Authentication authentication,
            @PathVariable UUID id,
            @Valid @RequestBody UpdateUserRoleRequest request,
            HttpServletRequest servletRequest) {
        String clientIp = servletRequest.getRemoteAddr();
        AdminUserDto updated = adminService.updateUserRole(
                authentication.getName(),
                id,
                request.getRole(),
                request.getReason(),
                clientIp
        );
        return ResponseEntity.ok(updated);
    }

    // 3. Listing Management
    @GetMapping("/listings")
    public ResponseEntity<List<AdminListingDto>> getAllListings(
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search) {
        return ResponseEntity.ok(adminService.getAllListings(type, status, search));
    }

    @PutMapping("/listings/{type}/{id}/status")
    public ResponseEntity<Map<String, String>> updateListingStatus(
            Authentication authentication,
            @PathVariable String type,
            @PathVariable UUID id,
            @Valid @RequestBody UpdateListingStatusRequest request,
            HttpServletRequest servletRequest) {
        String clientIp = servletRequest.getRemoteAddr();
        adminService.updateListingStatus(
                authentication.getName(),
                type,
                id,
                request.getStatus(),
                request.getReason(),
                clientIp
        );
        return ResponseEntity.ok(Map.of("message", "Listing status updated successfully."));
    }

    @DeleteMapping("/listings/{type}/{id}")
    public ResponseEntity<Map<String, String>> deleteListing(
            Authentication authentication,
            @PathVariable String type,
            @PathVariable UUID id,
            @RequestParam(required = false) String reason,
            HttpServletRequest servletRequest) {
        String clientIp = servletRequest.getRemoteAddr();
        adminService.deleteListing(
                authentication.getName(),
                type,
                id,
                reason,
                clientIp
        );
        return ResponseEntity.ok(Map.of("message", "Listing removed successfully."));
    }

    // 4. Campaign Moderation
    @GetMapping("/campaigns")
    public ResponseEntity<List<CampaignResponse>> getAllCampaigns(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search) {
        return ResponseEntity.ok(adminService.getAllCampaigns(status, search));
    }

    @PutMapping("/campaigns/{id}/feature")
    public ResponseEntity<CampaignResponse> toggleCampaignFeatured(
            Authentication authentication,
            @PathVariable UUID id,
            @RequestParam boolean featured,
            HttpServletRequest servletRequest) {
        String clientIp = servletRequest.getRemoteAddr();
        CampaignResponse updated = adminService.toggleCampaignFeatured(
                authentication.getName(),
                id,
                featured,
                clientIp
        );
        return ResponseEntity.ok(updated);
    }

    @PutMapping("/campaigns/{id}/status")
    public ResponseEntity<CampaignResponse> updateCampaignStatus(
            Authentication authentication,
            @PathVariable UUID id,
            @RequestParam CampaignStatus status,
            @RequestParam(required = false) String reason,
            HttpServletRequest servletRequest) {
        String clientIp = servletRequest.getRemoteAddr();
        CampaignResponse updated = adminService.updateCampaignStatus(
                authentication.getName(),
                id,
                status,
                reason,
                clientIp
        );
        return ResponseEntity.ok(updated);
    }

    // 5. Contribution Monitoring
    @GetMapping("/contributions")
    public ResponseEntity<List<AdminContributionDto>> getAllContributions(
            @RequestParam(required = false) ContributionStatus status,
            @RequestParam(required = false) ContributionType type,
            @RequestParam(required = false) String search) {
        return ResponseEntity.ok(adminService.getAllContributions(status, type, search));
    }

    @GetMapping("/contributions/summary")
    public ResponseEntity<Map<String, Object>> getContributionSummary() {
        return ResponseEntity.ok(adminService.getContributionSummary());
    }

    // 6. Audit Log Viewer
    @GetMapping("/audit-logs")
    public ResponseEntity<List<AuditLogResponseDto>> getAuditLogs(
            @RequestParam(required = false) String action,
            @RequestParam(required = false) String entityName,
            @RequestParam(required = false) String search,
            @RequestParam(required = false, defaultValue = "100") Integer limit) {
        return ResponseEntity.ok(adminService.getAuditLogs(action, entityName, search, limit));
    }

    // 7. Settings Management
    @GetMapping("/settings")
    public ResponseEntity<PlatformSettingsDto> getSettings() {
        return ResponseEntity.ok(adminService.getSettings());
    }

    @PutMapping("/settings")
    public ResponseEntity<PlatformSettingsDto> updateSettings(
            Authentication authentication,
            @Valid @RequestBody PlatformSettingsDto dto,
            HttpServletRequest servletRequest) {
        String clientIp = servletRequest.getRemoteAddr();
        PlatformSettingsDto updated = adminService.updateSettings(
                authentication.getName(),
                dto,
                clientIp
        );
        return ResponseEntity.ok(updated);
    }
}


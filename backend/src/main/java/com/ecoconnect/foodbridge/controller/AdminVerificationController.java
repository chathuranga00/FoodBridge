package com.ecoconnect.foodbridge.controller;

import com.ecoconnect.foodbridge.dto.PendingVerificationSummaryDto;
import com.ecoconnect.foodbridge.dto.VerificationDecisionRequest;
import com.ecoconnect.foodbridge.service.AdminVerificationService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/verifications")
@PreAuthorize("hasRole('ADMIN')")
public class AdminVerificationController {

    private final AdminVerificationService adminVerificationService;

    public AdminVerificationController(AdminVerificationService adminVerificationService) {
        this.adminVerificationService = adminVerificationService;
    }

    @GetMapping("/pending")
    public ResponseEntity<List<PendingVerificationSummaryDto>> getPendingVerifications() {
        List<PendingVerificationSummaryDto> pendingList = adminVerificationService.getPendingVerifications();
        return ResponseEntity.ok(pendingList);
    }

    @GetMapping("/{type}/{id}")
    public ResponseEntity<PendingVerificationSummaryDto> getVerificationDetails(
            @PathVariable String type,
            @PathVariable UUID id) {
        PendingVerificationSummaryDto details = adminVerificationService.getOrganizationDetails(type, id);
        return ResponseEntity.ok(details);
    }

    @PostMapping("/{type}/{id}/decide")
    public ResponseEntity<PendingVerificationSummaryDto> decideVerification(
            Authentication authentication,
            @PathVariable String type,
            @PathVariable UUID id,
            @Valid @RequestBody VerificationDecisionRequest request,
            HttpServletRequest servletRequest) {
        String clientIp = servletRequest.getRemoteAddr();
        PendingVerificationSummaryDto updated = adminVerificationService.processDecision(
                authentication.getName(),
                type,
                id,
                request,
                clientIp
        );
        return ResponseEntity.ok(updated);
    }
}


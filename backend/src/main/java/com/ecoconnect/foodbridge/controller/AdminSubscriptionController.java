package com.ecoconnect.foodbridge.controller;

import com.ecoconnect.foodbridge.dto.AdminSubscriptionActionDto;
import com.ecoconnect.foodbridge.dto.SubscriptionResponseDto;
import com.ecoconnect.foodbridge.model.enums.SubscriptionPlan;
import com.ecoconnect.foodbridge.model.enums.SubscriptionStatus;
import com.ecoconnect.foodbridge.service.SubscriptionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/subscriptions")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminSubscriptionController {

    private final SubscriptionService subscriptionService;

    @GetMapping
    public ResponseEntity<List<SubscriptionResponseDto>> getAllSubscriptions(
            @RequestParam(required = false) SubscriptionStatus status,
            @RequestParam(required = false) SubscriptionPlan plan) {
        return ResponseEntity.ok(subscriptionService.getAllSubscriptionsAdmin(status, plan));
    }

    @PostMapping("/{id}/activate")
    public ResponseEntity<SubscriptionResponseDto> activateSubscription(
            Authentication authentication,
            @PathVariable UUID id,
            @RequestBody(required = false) AdminSubscriptionActionDto action) {
        SubscriptionResponseDto response = subscriptionService.adminActivateSubscription(
                authentication.getName(), id, action);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/renew")
    public ResponseEntity<SubscriptionResponseDto> renewSubscription(
            Authentication authentication,
            @PathVariable UUID id,
            @RequestBody(required = false) AdminSubscriptionActionDto action) {
        SubscriptionResponseDto response = subscriptionService.adminRenewSubscription(
                authentication.getName(), id, action);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<SubscriptionResponseDto> cancelSubscription(
            Authentication authentication,
            @PathVariable UUID id,
            @RequestBody(required = false) AdminSubscriptionActionDto action) {
        SubscriptionResponseDto response = subscriptionService.adminCancelSubscription(
                authentication.getName(), id, action);
        return ResponseEntity.ok(response);
    }
}


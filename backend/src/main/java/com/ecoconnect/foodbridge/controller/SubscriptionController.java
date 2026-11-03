package com.ecoconnect.foodbridge.controller;

import com.ecoconnect.foodbridge.dto.SubscribeRequestDto;
import com.ecoconnect.foodbridge.dto.SubscriptionPackageDto;
import com.ecoconnect.foodbridge.dto.SubscriptionResponseDto;
import com.ecoconnect.foodbridge.service.SubscriptionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/subscriptions")
@RequiredArgsConstructor
public class SubscriptionController {

    private final SubscriptionService subscriptionService;

    @GetMapping("/packages")
    public ResponseEntity<List<SubscriptionPackageDto>> getPackages() {
        return ResponseEntity.ok(subscriptionService.getSubscriptionPackages());
    }

    @GetMapping("/current")
    @PreAuthorize("hasAnyRole('RESTAURANT', 'GROCERY')")
    public ResponseEntity<SubscriptionResponseDto> getCurrentSubscription(Authentication authentication) {
        return ResponseEntity.ok(subscriptionService.getCurrentSubscription(authentication.getName()));
    }

    @PostMapping("/subscribe")
    @PreAuthorize("hasAnyRole('RESTAURANT', 'GROCERY')")
    public ResponseEntity<SubscriptionResponseDto> subscribe(
            Authentication authentication,
            @Valid @RequestBody SubscribeRequestDto request) {
        SubscriptionResponseDto response = subscriptionService.subscribe(authentication.getName(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/history")
    @PreAuthorize("hasAnyRole('RESTAURANT', 'GROCERY')")
    public ResponseEntity<List<SubscriptionResponseDto>> getHistory(Authentication authentication) {
        return ResponseEntity.ok(subscriptionService.getSubscriptionHistory(authentication.getName()));
    }
}


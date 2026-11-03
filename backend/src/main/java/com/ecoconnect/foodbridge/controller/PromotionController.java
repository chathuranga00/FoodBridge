package com.ecoconnect.foodbridge.controller;

import com.ecoconnect.foodbridge.dto.PromotionAnalyticsDto;
import com.ecoconnect.foodbridge.dto.PromotionRequestDto;
import com.ecoconnect.foodbridge.dto.PromotionResponseDto;
import com.ecoconnect.foodbridge.service.PromotionService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/promotions")
public class PromotionController {

    private final PromotionService promotionService;

    public PromotionController(PromotionService promotionService) {
        this.promotionService = promotionService;
    }

    @GetMapping("/my")
    @PreAuthorize("hasAnyRole('RESTAURANT', 'GROCERY')")
    public ResponseEntity<List<PromotionResponseDto>> getMyPromotions(Authentication authentication) {
        List<PromotionResponseDto> list = promotionService.getMyPromotions(authentication.getName());
        return ResponseEntity.ok(list);
    }

    @GetMapping("/analytics")
    @PreAuthorize("hasAnyRole('RESTAURANT', 'GROCERY')")
    public ResponseEntity<PromotionAnalyticsDto> getMyPromotionAnalytics(Authentication authentication) {
        PromotionAnalyticsDto analytics = promotionService.getMyPromotionAnalytics(authentication.getName());
        return ResponseEntity.ok(analytics);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('RESTAURANT', 'GROCERY')")
    public ResponseEntity<PromotionResponseDto> createPromotion(
            Authentication authentication,
            @Valid @RequestBody PromotionRequestDto request) {
        PromotionResponseDto created = promotionService.createPromotion(authentication.getName(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('RESTAURANT', 'GROCERY')")
    public ResponseEntity<PromotionResponseDto> updatePromotion(
            Authentication authentication,
            @PathVariable UUID id,
            @Valid @RequestBody PromotionRequestDto request) {
        PromotionResponseDto updated = promotionService.updatePromotion(authentication.getName(), id, request);
        return ResponseEntity.ok(updated);
    }

    @PatchMapping("/{id}/toggle-status")
    @PreAuthorize("hasAnyRole('RESTAURANT', 'GROCERY')")
    public ResponseEntity<PromotionResponseDto> toggleStatus(
            Authentication authentication,
            @PathVariable UUID id) {
        PromotionResponseDto updated = promotionService.togglePromotionActive(authentication.getName(), id);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('RESTAURANT', 'GROCERY')")
    public ResponseEntity<Void> deletePromotion(
            Authentication authentication,
            @PathVariable UUID id) {
        promotionService.deletePromotion(authentication.getName(), id);
        return ResponseEntity.noContent().build();
    }
}

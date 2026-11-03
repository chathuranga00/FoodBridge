package com.ecoconnect.foodbridge.controller;

import com.ecoconnect.foodbridge.dto.PromotionResponseDto;
import com.ecoconnect.foodbridge.service.PromotionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/public/promotions")
public class PublicPromotionController {

    private final PromotionService promotionService;

    public PublicPromotionController(PromotionService promotionService) {
        this.promotionService = promotionService;
    }

    @GetMapping
    public ResponseEntity<List<PromotionResponseDto>> getPublicPromotions() {
        List<PromotionResponseDto> list = promotionService.getPublicActivePromotions();
        return ResponseEntity.ok(list);
    }

    @GetMapping("/featured")
    public ResponseEntity<List<PromotionResponseDto>> getFeaturedPromotions() {
        List<PromotionResponseDto> list = promotionService.getPublicFeaturedPromotions();
        return ResponseEntity.ok(list);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PromotionResponseDto> getPromotionById(@PathVariable UUID id) {
        PromotionResponseDto promo = promotionService.getPromotionById(id);
        return ResponseEntity.ok(promo);
    }

    @PostMapping("/{id}/view")
    public ResponseEntity<Void> recordView(@PathVariable UUID id) {
        promotionService.recordView(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/click")
    public ResponseEntity<Void> recordClick(@PathVariable UUID id) {
        promotionService.recordClick(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/redeem")
    public ResponseEntity<Void> recordRedemption(@PathVariable UUID id) {
        promotionService.recordRedemption(id);
        return ResponseEntity.ok().build();
    }
}

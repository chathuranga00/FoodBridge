package com.ecoconnect.foodbridge.controller;

import com.ecoconnect.foodbridge.dto.BusinessProfileDto;
import com.ecoconnect.foodbridge.dto.PromotionResponseDto;
import com.ecoconnect.foodbridge.service.BusinessProfileService;
import com.ecoconnect.foodbridge.service.PromotionService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminPromotionController {

    private final PromotionService promotionService;
    private final BusinessProfileService businessProfileService;

    public AdminPromotionController(PromotionService promotionService,
                                    BusinessProfileService businessProfileService) {
        this.promotionService = promotionService;
        this.businessProfileService = businessProfileService;
    }

    @GetMapping("/promotions")
    public ResponseEntity<List<PromotionResponseDto>> getAllPromotions() {
        List<PromotionResponseDto> list = promotionService.getAllPromotionsForAdmin();
        return ResponseEntity.ok(list);
    }

    @PutMapping("/promotions/{id}/feature")
    public ResponseEntity<PromotionResponseDto> togglePromotionFeatured(
            @PathVariable UUID id,
            @RequestParam(defaultValue = "true") boolean featured) {
        PromotionResponseDto updated = promotionService.togglePromotionFeaturedByAdmin(id, featured);
        return ResponseEntity.ok(updated);
    }

    @GetMapping("/businesses")
    public ResponseEntity<List<BusinessProfileDto>> getAllBusinesses() {
        List<BusinessProfileDto> list = businessProfileService.getAllBusinessesForAdmin();
        return ResponseEntity.ok(list);
    }

    @PutMapping("/businesses/{id}/feature")
    public ResponseEntity<BusinessProfileDto> toggleBusinessFeatured(
            @PathVariable UUID id,
            @RequestParam(defaultValue = "true") boolean featured) {
        BusinessProfileDto updated = businessProfileService.toggleBusinessFeatured(id, featured);
        return ResponseEntity.ok(updated);
    }
}


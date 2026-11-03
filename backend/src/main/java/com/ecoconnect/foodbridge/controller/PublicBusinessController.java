package com.ecoconnect.foodbridge.controller;

import com.ecoconnect.foodbridge.dto.BusinessSummaryDto;
import com.ecoconnect.foodbridge.dto.PublicBusinessProfileResponse;
import com.ecoconnect.foodbridge.model.enums.BusinessType;
import com.ecoconnect.foodbridge.service.BusinessProfileService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/public/businesses")
public class PublicBusinessController {

    private final BusinessProfileService businessProfileService;

    public PublicBusinessController(BusinessProfileService businessProfileService) {
        this.businessProfileService = businessProfileService;
    }

    @GetMapping
    public ResponseEntity<List<BusinessSummaryDto>> getPublicBusinesses(
            @RequestParam(required = false) String district,
            @RequestParam(required = false) BusinessType type,
            @RequestParam(required = false) Boolean featuredOnly) {
        List<BusinessSummaryDto> list = businessProfileService.getPublicBusinesses(district, type, featuredOnly);
        return ResponseEntity.ok(list);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PublicBusinessProfileResponse> getPublicBusinessProfile(@PathVariable UUID id) {
        PublicBusinessProfileResponse response = businessProfileService.getPublicBusinessProfile(id);
        return ResponseEntity.ok(response);
    }
}

package com.ecoconnect.foodbridge.controller;

import com.ecoconnect.foodbridge.dto.FoodListingCreateRequest;
import com.ecoconnect.foodbridge.dto.FoodListingResponse;
import com.ecoconnect.foodbridge.service.FoodListingService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/food-listings")
public class FoodListingController {

    private final FoodListingService foodListingService;

    public FoodListingController(FoodListingService foodListingService) {
        this.foodListingService = foodListingService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('RESTAURANT', 'GROCERY')")
    public ResponseEntity<FoodListingResponse> createListing(
            Authentication authentication,
            @Valid @RequestBody FoodListingCreateRequest request) {
        FoodListingResponse response = foodListingService.createListing(authentication.getName(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/my-listings")
    @PreAuthorize("hasAnyRole('RESTAURANT', 'GROCERY')")
    public ResponseEntity<List<FoodListingResponse>> getMyListings(Authentication authentication) {
        List<FoodListingResponse> listings = foodListingService.getMyListings(authentication.getName());
        return ResponseEntity.ok(listings);
    }
}


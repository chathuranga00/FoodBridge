package com.ecoconnect.foodbridge.controller;

import com.ecoconnect.foodbridge.dto.GroceryOfferCreateRequest;
import com.ecoconnect.foodbridge.dto.GroceryOfferResponse;
import com.ecoconnect.foodbridge.dto.GroceryReservationRequest;
import com.ecoconnect.foodbridge.dto.GroceryReservationResponse;
import com.ecoconnect.foodbridge.service.GroceryOfferService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/grocery/offers")
public class GroceryOfferController {

    private final GroceryOfferService groceryOfferService;

    public GroceryOfferController(GroceryOfferService groceryOfferService) {
        this.groceryOfferService = groceryOfferService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('GROCERY', 'RESTAURANT', 'ADMIN')")
    public ResponseEntity<GroceryOfferResponse> createOffer(
            Authentication authentication,
            @Valid @RequestBody GroceryOfferCreateRequest request) {
        GroceryOfferResponse response = groceryOfferService.createOffer(authentication.getName(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<GroceryOfferResponse>> getPublicOffers(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String district,
            @RequestParam(required = false) String search) {
        List<GroceryOfferResponse> offers = groceryOfferService.getPublicOffers(category, district, search);
        return ResponseEntity.ok(offers);
    }

    @GetMapping("/my")
    @PreAuthorize("hasAnyRole('GROCERY', 'RESTAURANT', 'ADMIN')")
    public ResponseEntity<List<GroceryOfferResponse>> getMyBusinessOffers(Authentication authentication) {
        List<GroceryOfferResponse> offers = groceryOfferService.getMyBusinessOffers(authentication.getName());
        return ResponseEntity.ok(offers);
    }

    @GetMapping("/{id}")
    public ResponseEntity<GroceryOfferResponse> getOfferById(@PathVariable UUID id) {
        GroceryOfferResponse offer = groceryOfferService.getOfferById(id);
        return ResponseEntity.ok(offer);
    }

    @PostMapping("/{id}/reserve")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<GroceryReservationResponse> reserveOffer(
            Authentication authentication,
            @PathVariable UUID id,
            @Valid @RequestBody GroceryReservationRequest request) {
        GroceryReservationResponse response = groceryOfferService.reserveOffer(authentication.getName(), id, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}


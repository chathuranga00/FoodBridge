package com.ecoconnect.foodbridge.controller;

import com.ecoconnect.foodbridge.dto.FoodRequestCreateDto;
import com.ecoconnect.foodbridge.dto.FoodRequestDecisionDto;
import com.ecoconnect.foodbridge.dto.FoodRequestResponse;
import com.ecoconnect.foodbridge.service.FoodRescueService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/food-rescue")
public class FoodRescueController {

    private final FoodRescueService foodRescueService;

    public FoodRescueController(FoodRescueService foodRescueService) {
        this.foodRescueService = foodRescueService;
    }

    /**
     * Verified charities browse available listings and send a request.
     */
    @PostMapping("/requests")
    @PreAuthorize("hasRole('CHARITY')")
    public ResponseEntity<FoodRequestResponse> createRequest(
            Authentication authentication,
            @Valid @RequestBody FoodRequestCreateDto dto) {
        FoodRequestResponse response = foodRescueService.requestListing(authentication.getName(), dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Charity views all their sent food rescue requests.
     */
    @GetMapping("/charity-requests")
    @PreAuthorize("hasRole('CHARITY')")
    public ResponseEntity<List<FoodRequestResponse>> getCharityRequests(Authentication authentication) {
        List<FoodRequestResponse> requests = foodRescueService.getRequestsForCharity(authentication.getName());
        return ResponseEntity.ok(requests);
    }

    /**
     * Restaurant / Grocery views incoming collection requests from charities.
     */
    @GetMapping("/restaurant-requests")
    @PreAuthorize("hasAnyRole('RESTAURANT', 'GROCERY')")
    public ResponseEntity<List<FoodRequestResponse>> getRestaurantRequests(Authentication authentication) {
        List<FoodRequestResponse> requests = foodRescueService.getRequestsForRestaurant(authentication.getName());
        return ResponseEntity.ok(requests);
    }

    /**
     * The restaurant approves/rejects; on approval the listing becomes RESERVED.
     */
    @PostMapping("/requests/{id}/decide")
    @PreAuthorize("hasAnyRole('RESTAURANT', 'GROCERY')")
    public ResponseEntity<FoodRequestResponse> decideRequest(
            Authentication authentication,
            @PathVariable UUID id,
            @Valid @RequestBody FoodRequestDecisionDto decisionDto) {
        FoodRequestResponse response = foodRescueService.decideRequest(authentication.getName(), id, decisionDto);
        return ResponseEntity.ok(response);
    }

    /**
     * After pickup the restaurant marks COLLECTED and an activity_record is created (with kg quantity).
     */
    @PostMapping("/requests/{id}/collect")
    @PreAuthorize("hasAnyRole('RESTAURANT', 'GROCERY')")
    public ResponseEntity<FoodRequestResponse> markCollected(
            Authentication authentication,
            @PathVariable UUID id,
            @RequestParam(required = false) UUID volunteerId) {
        FoodRequestResponse response = foodRescueService.markCollected(authentication.getName(), id);
        return ResponseEntity.ok(response);
    }
}


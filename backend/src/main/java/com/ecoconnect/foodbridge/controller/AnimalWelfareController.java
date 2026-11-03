package com.ecoconnect.foodbridge.controller;

import com.ecoconnect.foodbridge.dto.*;
import com.ecoconnect.foodbridge.service.AnimalWelfareService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/animal-welfare")
@RequiredArgsConstructor
public class AnimalWelfareController {

    private final AnimalWelfareService animalWelfareService;

    // =========================================================================
    // Profile Endpoints
    // =========================================================================

    @GetMapping("/profile")
    @PreAuthorize("hasAnyRole('ANIMAL_ORG', 'ADMIN')")
    public ResponseEntity<AnimalOrgProfileDto> getMyProfile(Authentication authentication) {
        return ResponseEntity.ok(animalWelfareService.getMyProfile(authentication.getName()));
    }

    @PutMapping("/profile")
    @PreAuthorize("hasAnyRole('ANIMAL_ORG', 'ADMIN')")
    public ResponseEntity<AnimalOrgProfileDto> updateMyProfile(
            Authentication authentication,
            @Valid @RequestBody AnimalOrgProfileDto dto) {
        return ResponseEntity.ok(animalWelfareService.updateMyProfile(authentication.getName(), dto));
    }

    @GetMapping("/organizations")
    public ResponseEntity<List<AnimalOrgProfileDto>> getVerifiedAnimalOrganizations() {
        return ResponseEntity.ok(animalWelfareService.getVerifiedAnimalOrganizations());
    }

    // =========================================================================
    // Feeding Locations Endpoints
    // =========================================================================

    @GetMapping("/locations")
    public ResponseEntity<List<AnimalLocationDto>> getPublicFeedingLocations(
            @RequestParam(required = false) String district) {
        return ResponseEntity.ok(animalWelfareService.getPublicFeedingLocations(district));
    }

    @GetMapping("/my-locations")
    @PreAuthorize("hasAnyRole('ANIMAL_ORG', 'ADMIN')")
    public ResponseEntity<List<AnimalLocationDto>> getMyLocations(Authentication authentication) {
        return ResponseEntity.ok(animalWelfareService.getMyLocations(authentication.getName()));
    }

    @PostMapping("/locations")
    @PreAuthorize("hasAnyRole('ANIMAL_ORG', 'ADMIN')")
    public ResponseEntity<AnimalLocationDto> registerFeedingLocation(
            Authentication authentication,
            @Valid @RequestBody AnimalLocationDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(animalWelfareService.registerFeedingLocation(authentication.getName(), dto));
    }

    @PutMapping("/locations/{id}")
    @PreAuthorize("hasAnyRole('ANIMAL_ORG', 'ADMIN')")
    public ResponseEntity<AnimalLocationDto> updateFeedingLocation(
            Authentication authentication,
            @PathVariable UUID id,
            @Valid @RequestBody AnimalLocationDto dto) {
        return ResponseEntity.ok(animalWelfareService.updateFeedingLocation(authentication.getName(), id, dto));
    }

    @DeleteMapping("/locations/{id}")
    @PreAuthorize("hasAnyRole('ANIMAL_ORG', 'ADMIN')")
    public ResponseEntity<Void> deleteFeedingLocation(
            Authentication authentication,
            @PathVariable UUID id) {
        animalWelfareService.deleteFeedingLocation(authentication.getName(), id);
        return ResponseEntity.noContent().build();
    }

    // =========================================================================
    // Feed Requirements Endpoints (Rule 7 Separation)
    // =========================================================================

    @GetMapping("/requirements")
    public ResponseEntity<List<AnimalFeedRequirementDto>> getPublicFeedRequirements(
            @RequestParam(required = false) String district) {
        return ResponseEntity.ok(animalWelfareService.getPublicFeedRequirements(district));
    }

    @GetMapping("/my-requirements")
    @PreAuthorize("hasAnyRole('ANIMAL_ORG', 'ADMIN')")
    public ResponseEntity<List<AnimalFeedRequirementDto>> getMyFeedRequirements(Authentication authentication) {
        return ResponseEntity.ok(animalWelfareService.getMyFeedRequirements(authentication.getName()));
    }

    @PostMapping("/requirements")
    @PreAuthorize("hasAnyRole('ANIMAL_ORG', 'ADMIN')")
    public ResponseEntity<AnimalFeedRequirementDto> createFeedRequirement(
            Authentication authentication,
            @Valid @RequestBody AnimalFeedRequirementDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(animalWelfareService.createFeedRequirement(authentication.getName(), dto));
    }

    @PutMapping("/requirements/{id}")
    @PreAuthorize("hasAnyRole('ANIMAL_ORG', 'ADMIN')")
    public ResponseEntity<AnimalFeedRequirementDto> updateFeedRequirement(
            Authentication authentication,
            @PathVariable UUID id,
            @Valid @RequestBody AnimalFeedRequirementDto dto) {
        return ResponseEntity.ok(animalWelfareService.updateFeedRequirement(authentication.getName(), id, dto));
    }

    @DeleteMapping("/requirements/{id}")
    @PreAuthorize("hasAnyRole('ANIMAL_ORG', 'ADMIN')")
    public ResponseEntity<Void> deleteFeedRequirement(
            Authentication authentication,
            @PathVariable UUID id) {
        animalWelfareService.deleteFeedRequirement(authentication.getName(), id);
        return ResponseEntity.noContent().build();
    }

    // =========================================================================
    // Available Surplus Feed Listings (Rule 7)
    // =========================================================================

    @GetMapping("/available-feed")
    public ResponseEntity<List<FoodListingResponse>> getAvailableAnimalFeedListings() {
        return ResponseEntity.ok(animalWelfareService.getAvailableAnimalFeedListings());
    }
}


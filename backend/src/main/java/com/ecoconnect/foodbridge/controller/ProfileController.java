package com.ecoconnect.foodbridge.controller;

import com.ecoconnect.foodbridge.dto.BusinessProfileDto;
import com.ecoconnect.foodbridge.dto.CharityProfileDto;
import com.ecoconnect.foodbridge.service.ProfileService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profiles")
public class ProfileController {

    private final ProfileService profileService;

    public ProfileController(ProfileService profileService) {
        this.profileService = profileService;
    }

    @GetMapping("/business")
    @PreAuthorize("hasAnyRole('RESTAURANT', 'GROCERY')")
    public ResponseEntity<BusinessProfileDto> getBusinessProfile(Authentication authentication) {
        BusinessProfileDto profile = profileService.getBusinessProfile(authentication.getName());
        return ResponseEntity.ok(profile);
    }

    @PutMapping("/business")
    @PreAuthorize("hasAnyRole('RESTAURANT', 'GROCERY')")
    public ResponseEntity<BusinessProfileDto> updateBusinessProfile(
            Authentication authentication,
            @Valid @RequestBody BusinessProfileDto dto) {
        BusinessProfileDto saved = profileService.saveOrUpdateBusinessProfile(authentication.getName(), dto);
        return ResponseEntity.ok(saved);
    }

    @PostMapping("/business")
    @PreAuthorize("hasAnyRole('RESTAURANT', 'GROCERY')")
    public ResponseEntity<BusinessProfileDto> createBusinessProfile(
            Authentication authentication,
            @Valid @RequestBody BusinessProfileDto dto) {
        BusinessProfileDto saved = profileService.saveOrUpdateBusinessProfile(authentication.getName(), dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @GetMapping("/charity")
    @PreAuthorize("hasRole('CHARITY')")
    public ResponseEntity<CharityProfileDto> getCharityProfile(Authentication authentication) {
        CharityProfileDto profile = profileService.getCharityProfile(authentication.getName());
        return ResponseEntity.ok(profile);
    }

    @PutMapping("/charity")
    @PreAuthorize("hasRole('CHARITY')")
    public ResponseEntity<CharityProfileDto> updateCharityProfile(
            Authentication authentication,
            @Valid @RequestBody CharityProfileDto dto) {
        CharityProfileDto saved = profileService.saveOrUpdateCharityProfile(authentication.getName(), dto);
        return ResponseEntity.ok(saved);
    }

    @PostMapping("/charity")
    @PreAuthorize("hasRole('CHARITY')")
    public ResponseEntity<CharityProfileDto> createCharityProfile(
            Authentication authentication,
            @Valid @RequestBody CharityProfileDto dto) {
        CharityProfileDto saved = profileService.saveOrUpdateCharityProfile(authentication.getName(), dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }
}


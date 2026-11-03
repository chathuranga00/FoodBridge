package com.ecoconnect.foodbridge.controller;

import com.ecoconnect.foodbridge.dto.*;
import com.ecoconnect.foodbridge.model.enums.CampaignNeedType;
import com.ecoconnect.foodbridge.service.CampaignService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api")
public class CampaignController {

    private final CampaignService campaignService;

    public CampaignController(CampaignService campaignService) {
        this.campaignService = campaignService;
    }

    /**
     * Verified charity creates a rural community campaign.
     * Enforces Rule 2 (verified charity only) and Rule 3 (starts PENDING).
     */
    @PostMapping("/campaigns")
    @PreAuthorize("hasRole('CHARITY')")
    public ResponseEntity<CampaignResponse> createCampaign(
            Authentication authentication,
            @Valid @RequestBody CampaignCreateRequest request) {
        CampaignResponse response = campaignService.createCampaign(authentication.getName(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Public browse of approved/active community campaigns with filters.
     * Preserves privacy: only district is exposed.
     */
    @GetMapping("/campaigns")
    public ResponseEntity<List<CampaignResponse>> getPublicCampaigns(
            @RequestParam(required = false) CampaignNeedType needType,
            @RequestParam(required = false) String district,
            @RequestParam(required = false) String search) {
        List<CampaignResponse> campaigns = campaignService.getPublicCampaigns(needType, district, search);
        return ResponseEntity.ok(campaigns);
    }

    /**
     * Get single campaign details.
     */
    @GetMapping("/campaigns/{id}")
    public ResponseEntity<CampaignResponse> getCampaignById(
            @PathVariable UUID id,
            Authentication authentication) {
        String email = authentication != null ? authentication.getName() : null;
        CampaignResponse response = campaignService.getCampaignById(id, email);
        return ResponseEntity.ok(response);
    }

    /**
     * Charity views all their submitted campaigns and statuses.
     */
    @GetMapping("/campaigns/my")
    @PreAuthorize("hasRole('CHARITY')")
    public ResponseEntity<List<CampaignResponse>> getMyCampaigns(Authentication authentication) {
        List<CampaignResponse> campaigns = campaignService.getMyCharityCampaigns(authentication.getName());
        return ResponseEntity.ok(campaigns);
    }

    /**
     * Charity posts field distribution updates with photos.
     */
    @PostMapping("/campaigns/{id}/updates")
    @PreAuthorize("hasAnyRole('CHARITY', 'ADMIN')")
    public ResponseEntity<CampaignUpdateResponse> postCampaignUpdate(
            Authentication authentication,
            @PathVariable UUID id,
            @Valid @RequestBody CampaignUpdateRequest request) {
        CampaignUpdateResponse response = campaignService.postCampaignUpdate(authentication.getName(), id, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Publicly view all distribution updates for a campaign.
     */
    @GetMapping("/campaigns/{id}/updates")
    public ResponseEntity<List<CampaignUpdateResponse>> getCampaignUpdates(@PathVariable UUID id) {
        List<CampaignUpdateResponse> updates = campaignService.getCampaignUpdates(id);
        return ResponseEntity.ok(updates);
    }

    /**
     * Community member pledges support/items to an active campaign.
     */
    @PostMapping("/campaigns/{id}/pledge")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<CampaignResponse> pledgeToCampaign(
            Authentication authentication,
            @PathVariable UUID id,
            @Valid @RequestBody CampaignPledgeRequest request) {
        CampaignResponse response = campaignService.pledgeToCampaign(authentication.getName(), id, request);
        return ResponseEntity.ok(response);
    }

    /**
     * Business with active PREMIUM subscription sponsors a community sustainability campaign.
     */
    @PostMapping("/campaigns/{id}/sponsor")
    @PreAuthorize("hasAnyRole('RESTAURANT', 'GROCERY')")
    public ResponseEntity<CampaignResponse> sponsorCampaign(
            Authentication authentication,
            @PathVariable UUID id,
            @RequestBody(required = false) CampaignSponsorRequest request) {
        CampaignResponse response = campaignService.sponsorCampaign(authentication.getName(), id, request);
        return ResponseEntity.ok(response);
    }

    /**
     * Admin Campaign Moderation: List all pending campaigns.
     */
    @GetMapping("/admin/campaigns/pending")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<CampaignResponse>> getPendingCampaigns() {
        List<CampaignResponse> pending = campaignService.getPendingCampaignsForAdmin();
        return ResponseEntity.ok(pending);
    }

    /**
     * Admin Campaign Moderation: Approve or reject campaign with reason and audit log.
     */
    @PostMapping("/admin/campaigns/{id}/moderate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CampaignResponse> moderateCampaign(
            Authentication authentication,
            @PathVariable UUID id,
            @Valid @RequestBody CampaignModerationRequest request) {
        CampaignResponse response = campaignService.moderateCampaign(authentication.getName(), id, request);
        return ResponseEntity.ok(response);
    }
}


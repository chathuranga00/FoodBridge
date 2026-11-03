package com.ecoconnect.foodbridge.controller;

import com.ecoconnect.foodbridge.dto.CampaignContributionResponse;
import com.ecoconnect.foodbridge.dto.ContributionConfirmRequest;
import com.ecoconnect.foodbridge.dto.ContributionCreateRequest;
import com.ecoconnect.foodbridge.dto.ContributionDistributeRequest;
import com.ecoconnect.foodbridge.model.enums.ContributionStatus;
import com.ecoconnect.foodbridge.service.ContributionService;
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
public class ContributionController {

    private final ContributionService contributionService;

    public ContributionController(ContributionService contributionService) {
        this.contributionService = contributionService;
    }

    /**
     * Users and businesses pledge a contribution to an approved campaign.
     * Records pledge without payment processing and displays agreed instructions.
     */
    @PostMapping("/campaigns/{id}/contributions")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<CampaignContributionResponse> pledgeContribution(
            Authentication authentication,
            @PathVariable UUID id,
            @Valid @RequestBody ContributionCreateRequest request) {
        CampaignContributionResponse response = contributionService.pledgeContribution(authentication.getName(), id, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Contributor (User or Business) views their contributions history.
     */
    @GetMapping("/contributions/my")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<CampaignContributionResponse>> getMyContributions(Authentication authentication) {
        List<CampaignContributionResponse> contributions = contributionService.getMyContributions(authentication.getName());
        return ResponseEntity.ok(contributions);
    }

    /**
     * Get specific contribution details.
     */
    @GetMapping("/contributions/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<CampaignContributionResponse> getContributionById(
            Authentication authentication,
            @PathVariable UUID id) {
        CampaignContributionResponse contribution = contributionService.getContributionById(authentication.getName(), id);
        return ResponseEntity.ok(contribution);
    }

    /**
     * Receiving charity views contributions for their campaigns.
     */
    @GetMapping("/charity/contributions")
    @PreAuthorize("hasAnyRole('CHARITY', 'ADMIN')")
    public ResponseEntity<List<CampaignContributionResponse>> getCharityContributions(
            Authentication authentication,
            @RequestParam(required = false) ContributionStatus status) {
        List<CampaignContributionResponse> contributions = contributionService.getCharityContributions(authentication.getName(), status);
        return ResponseEntity.ok(contributions);
    }

    /**
     * Receiving charity confirms receipt of funds or physical handover.
     * Updates status to CONFIRMED and advances campaign progress.
     */
    @PostMapping("/contributions/{id}/confirm")
    @PreAuthorize("hasAnyRole('CHARITY', 'ADMIN')")
    public ResponseEntity<CampaignContributionResponse> confirmContribution(
            Authentication authentication,
            @PathVariable UUID id,
            @RequestBody(required = false) ContributionConfirmRequest request) {
        CampaignContributionResponse response = contributionService.confirmContribution(authentication.getName(), id, request);
        return ResponseEntity.ok(response);
    }

    /**
     * Receiving charity records field distribution with proof/evidence.
     * Updates status to DISTRIBUTED.
     */
    @PostMapping("/contributions/{id}/distribute")
    @PreAuthorize("hasAnyRole('CHARITY', 'ADMIN')")
    public ResponseEntity<CampaignContributionResponse> recordDistribution(
            Authentication authentication,
            @PathVariable UUID id,
            @Valid @RequestBody ContributionDistributeRequest request) {
        CampaignContributionResponse response = contributionService.recordDistribution(authentication.getName(), id, request);
        return ResponseEntity.ok(response);
    }
}


package com.ecoconnect.foodbridge.controller;

import com.ecoconnect.foodbridge.dto.*;
import com.ecoconnect.foodbridge.model.enums.PartnershipStatus;
import com.ecoconnect.foodbridge.service.PartnershipService;
import jakarta.servlet.http.HttpServletRequest;
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
@RequestMapping("/api/partnerships")
@RequiredArgsConstructor
public class PartnershipController {

    private final PartnershipService partnershipService;

    /**
     * Business proposes a partnership to an active campaign.
     */
    @PostMapping("/propose")
    @PreAuthorize("hasAnyRole('RESTAURANT', 'GROCERY')")
    public ResponseEntity<PartnershipResponse> proposePartnership(
            Authentication authentication,
            @Valid @RequestBody PartnershipProposeRequest request,
            HttpServletRequest servletRequest) {
        PartnershipResponse response = partnershipService.proposePartnership(authentication.getName(), request, servletRequest.getRemoteAddr());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Either party counters the partnership terms.
     */
    @PostMapping("/{id}/counter")
    @PreAuthorize("hasAnyRole('RESTAURANT', 'GROCERY', 'CHARITY')")
    public ResponseEntity<PartnershipResponse> counterProposal(
            @PathVariable UUID id,
            Authentication authentication,
            @Valid @RequestBody PartnershipCounterRequest request,
            HttpServletRequest servletRequest) {
        PartnershipResponse response = partnershipService.counterProposal(id, authentication.getName(), request, servletRequest.getRemoteAddr());
        return ResponseEntity.ok(response);
    }

    /**
     * Either party accepts proposed/countered terms. Terms become AGREED and immutable.
     */
    @PostMapping("/{id}/accept")
    @PreAuthorize("hasAnyRole('RESTAURANT', 'GROCERY', 'CHARITY')")
    public ResponseEntity<PartnershipResponse> acceptPartnership(
            @PathVariable UUID id,
            Authentication authentication,
            @RequestBody(required = false) PartnershipAcceptRequest request,
            HttpServletRequest servletRequest) {
        PartnershipResponse response = partnershipService.acceptPartnership(id, authentication.getName(), request, servletRequest.getRemoteAddr());
        return ResponseEntity.ok(response);
    }

    /**
     * Decline proposal or negotiation.
     */
    @PostMapping("/{id}/decline")
    @PreAuthorize("hasAnyRole('RESTAURANT', 'GROCERY', 'CHARITY')")
    public ResponseEntity<PartnershipResponse> declinePartnership(
            @PathVariable UUID id,
            Authentication authentication,
            @Valid @RequestBody PartnershipDeclineRequest request,
            HttpServletRequest servletRequest) {
        PartnershipResponse response = partnershipService.declinePartnership(id, authentication.getName(), request, servletRequest.getRemoteAddr());
        return ResponseEntity.ok(response);
    }

    /**
     * Business delivers agreed support (dispatch / transfer).
     */
    @PostMapping("/{id}/deliver")
    @PreAuthorize("hasAnyRole('RESTAURANT', 'GROCERY')")
    public ResponseEntity<PartnershipResponse> deliverSupport(
            @PathVariable UUID id,
            Authentication authentication,
            @Valid @RequestBody PartnershipDeliverRequest request,
            HttpServletRequest servletRequest) {
        PartnershipResponse response = partnershipService.deliverSupport(id, authentication.getName(), request, servletRequest.getRemoteAddr());
        return ResponseEntity.ok(response);
    }

    /**
     * Charity confirms receipt (status COMPLETED) and activates recognition.
     */
    @PostMapping("/{id}/complete")
    @PreAuthorize("hasRole('CHARITY')")
    public ResponseEntity<PartnershipResponse> confirmReceiptAndComplete(
            @PathVariable UUID id,
            Authentication authentication,
            @Valid @RequestBody PartnershipCompleteRequest request,
            HttpServletRequest servletRequest) {
        PartnershipResponse response = partnershipService.confirmReceiptAndComplete(id, authentication.getName(), request, servletRequest.getRemoteAddr());
        return ResponseEntity.ok(response);
    }

    /**
     * Post a negotiation thread message without altering terms.
     */
    @PostMapping("/{id}/messages")
    @PreAuthorize("hasAnyRole('RESTAURANT', 'GROCERY', 'CHARITY', 'ADMIN')")
    public ResponseEntity<PartnershipResponse> postMessage(
            @PathVariable UUID id,
            Authentication authentication,
            @Valid @RequestBody PartnershipMessageRequest request,
            HttpServletRequest servletRequest) {
        PartnershipResponse response = partnershipService.postMessage(id, authentication.getName(), request, servletRequest.getRemoteAddr());
        return ResponseEntity.ok(response);
    }

    /**
     * Get details, negotiation message thread, and status timeline.
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('RESTAURANT', 'GROCERY', 'CHARITY', 'ADMIN')")
    public ResponseEntity<PartnershipResponse> getPartnershipDetails(
            @PathVariable UUID id,
            Authentication authentication) {
        PartnershipResponse response = partnershipService.getPartnershipDetails(id, authentication.getName());
        return ResponseEntity.ok(response);
    }

    /**
     * List all partnerships for authenticated business.
     */
    @GetMapping("/business/my")
    @PreAuthorize("hasAnyRole('RESTAURANT', 'GROCERY')")
    public ResponseEntity<List<PartnershipResponse>> getMyBusinessPartnerships(
            Authentication authentication) {
        List<PartnershipResponse> list = partnershipService.getMyBusinessPartnerships(authentication.getName());
        return ResponseEntity.ok(list);
    }

    /**
     * List all partnerships for authenticated charity.
     */
    @GetMapping("/charity/my")
    @PreAuthorize("hasRole('CHARITY')")
    public ResponseEntity<List<PartnershipResponse>> getMyCharityPartnerships(
            Authentication authentication) {
        List<PartnershipResponse> list = partnershipService.getMyCharityPartnerships(authentication.getName());
        return ResponseEntity.ok(list);
    }

    /**
     * Public endpoint: retrieve active promotional recognitions for a campaign.
     */
    @GetMapping("/campaign/{campaignId}/recognitions")
    public ResponseEntity<List<PartnershipRecognitionResponse>> getCampaignRecognitions(
            @PathVariable UUID campaignId) {
        List<PartnershipRecognitionResponse> list = partnershipService.getActiveRecognitionsForCampaign(campaignId);
        return ResponseEntity.ok(list);
    }

    /**
     * Public endpoint: retrieve active promotional recognitions for a business profile.
     */
    @GetMapping("/business/{businessId}/recognitions")
    public ResponseEntity<List<PartnershipRecognitionResponse>> getBusinessRecognitions(
            @PathVariable UUID businessId) {
        List<PartnershipRecognitionResponse> list = partnershipService.getActiveRecognitionsForBusiness(businessId);
        return ResponseEntity.ok(list);
    }

    /**
     * Admin monitoring endpoint: list all partnerships with filters.
     */
    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<PartnershipResponse>> getAdminPartnerships(
            @RequestParam(required = false) PartnershipStatus status,
            @RequestParam(required = false) UUID businessId,
            @RequestParam(required = false) UUID charityId,
            @RequestParam(required = false) UUID campaignId) {
        List<PartnershipResponse> list = partnershipService.getAdminPartnerships(status, businessId, charityId, campaignId);
        return ResponseEntity.ok(list);
    }
}

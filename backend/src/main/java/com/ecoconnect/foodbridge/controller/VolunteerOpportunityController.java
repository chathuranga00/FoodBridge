package com.ecoconnect.foodbridge.controller;

import com.ecoconnect.foodbridge.dto.*;
import com.ecoconnect.foodbridge.model.enums.VolunteerOpportunityCategory;
import com.ecoconnect.foodbridge.service.VolunteerOpportunityService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/volunteer")
public class VolunteerOpportunityController {

    private final VolunteerOpportunityService opportunityService;

    public VolunteerOpportunityController(VolunteerOpportunityService opportunityService) {
        this.opportunityService = opportunityService;
    }

    /**
     * Public endpoint to browse volunteer opportunities.
     */
    @GetMapping("/opportunities")
    public ResponseEntity<List<VolunteerOpportunityResponseDto>> getOpportunities(
            @RequestParam(required = false) VolunteerOpportunityCategory category,
            @RequestParam(required = false) String district,
            @RequestParam(required = false) String search,
            @AuthenticationPrincipal UserDetails userDetails) {

        String currentUserEmail = userDetails != null ? userDetails.getUsername() : null;
        List<VolunteerOpportunityResponseDto> list = opportunityService.getPublicOpportunities(
                category, district, search, currentUserEmail);
        return ResponseEntity.ok(list);
    }

    /**
     * Public endpoint to get opportunity details by ID.
     */
    @GetMapping("/opportunities/{id}")
    public ResponseEntity<VolunteerOpportunityResponseDto> getOpportunityDetails(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetails userDetails) {

        String currentUserEmail = userDetails != null ? userDetails.getUsername() : null;
        VolunteerOpportunityResponseDto opp = opportunityService.getOpportunityDetails(id, currentUserEmail);
        return ResponseEntity.ok(opp);
    }

    /**
     * Organizers (Charity, Animal Org, Admin) publish a new volunteer opportunity.
     */
    @PostMapping("/opportunities")
    public ResponseEntity<VolunteerOpportunityResponseDto> createOpportunity(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody VolunteerOpportunityCreateDto dto,
            HttpServletRequest request) {

        String ipAddress = request.getRemoteAddr();
        VolunteerOpportunityResponseDto created = opportunityService.createOpportunity(
                userDetails.getUsername(), dto, ipAddress);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    /**
     * Authenticated user signs up to volunteer for an opportunity.
     */
    @PostMapping("/opportunities/{id}/signup")
    public ResponseEntity<VolunteerParticipationDto> signUp(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable UUID id,
            @RequestBody(required = false) VolunteerSignUpDto dto,
            HttpServletRequest request) {

        String ipAddress = request.getRemoteAddr();
        VolunteerParticipationDto participation = opportunityService.signUpForOpportunity(
                userDetails.getUsername(), id, dto, ipAddress);
        return ResponseEntity.status(HttpStatus.CREATED).body(participation);
    }

    /**
     * Authenticated user cancels their sign up.
     */
    @PostMapping("/opportunities/{id}/cancel")
    public ResponseEntity<VolunteerParticipationDto> cancelSignUp(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable UUID id,
            HttpServletRequest request) {

        String ipAddress = request.getRemoteAddr();
        VolunteerParticipationDto participation = opportunityService.cancelSignUp(
                userDetails.getUsername(), id, ipAddress);
        return ResponseEntity.ok(participation);
    }

    /**
     * Authenticated user views their participation history.
     */
    @GetMapping("/my-participations")
    public ResponseEntity<List<VolunteerParticipationDto>> getMyParticipations(
            @AuthenticationPrincipal UserDetails userDetails) {

        List<VolunteerParticipationDto> list = opportunityService.getMyParticipations(userDetails.getUsername());
        return ResponseEntity.ok(list);
    }

    /**
     * Organizer views attendee list for their opportunity.
     */
    @GetMapping("/opportunities/{id}/attendees")
    public ResponseEntity<List<VolunteerParticipationDto>> getAttendees(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable UUID id) {

        List<VolunteerParticipationDto> list = opportunityService.getOpportunityAttendees(
                userDetails.getUsername(), id);
        return ResponseEntity.ok(list);
    }

    /**
     * Organizer or Admin marks attendance for a participant.
     */
    @PostMapping("/opportunities/{id}/attendees/{participationId}/attendance")
    public ResponseEntity<VolunteerParticipationDto> markAttendance(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable UUID id,
            @PathVariable UUID participationId,
            @Valid @RequestBody AttendanceMarkDto dto,
            HttpServletRequest request) {

        String ipAddress = request.getRemoteAddr();
        VolunteerParticipationDto result = opportunityService.markAttendance(
                userDetails.getUsername(), id, participationId, dto, ipAddress);
        return ResponseEntity.ok(result);
    }
}

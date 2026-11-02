package com.ecoconnect.foodbridge.service;

import com.ecoconnect.foodbridge.dto.PendingVerificationSummaryDto;
import com.ecoconnect.foodbridge.dto.VerificationDecisionRequest;
import com.ecoconnect.foodbridge.exception.BadRequestException;
import com.ecoconnect.foodbridge.exception.ResourceNotFoundException;
import com.ecoconnect.foodbridge.model.Business;
import com.ecoconnect.foodbridge.model.Charity;
import com.ecoconnect.foodbridge.model.User;
import com.ecoconnect.foodbridge.model.enums.VerificationStatus;
import com.ecoconnect.foodbridge.repository.BusinessRepository;
import com.ecoconnect.foodbridge.repository.CharityRepository;
import com.ecoconnect.foodbridge.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;

@Service
public class AdminVerificationService {

    private final BusinessRepository businessRepository;
    private final CharityRepository charityRepository;
    private final UserRepository userRepository;
    private final AuditLogService auditLogService;
    private final EmailService emailService;

    public AdminVerificationService(BusinessRepository businessRepository,
                                    CharityRepository charityRepository,
                                    UserRepository userRepository,
                                    AuditLogService auditLogService,
                                    EmailService emailService) {
        this.businessRepository = businessRepository;
        this.charityRepository = charityRepository;
        this.userRepository = userRepository;
        this.auditLogService = auditLogService;
        this.emailService = emailService;
    }

    @Transactional(readOnly = true)
    public List<PendingVerificationSummaryDto> getPendingVerifications() {
        List<PendingVerificationSummaryDto> queue = new ArrayList<>();

        List<Business> pendingBusinesses = businessRepository.findByVerificationStatus(VerificationStatus.PENDING);
        for (Business b : pendingBusinesses) {
            queue.add(mapBusinessToSummary(b));
        }

        List<Charity> pendingCharities = charityRepository.findByVerificationStatus(VerificationStatus.PENDING);
        for (Charity c : pendingCharities) {
            queue.add(mapCharityToSummary(c));
        }

        // Sort latest submitted first
        queue.sort(Comparator.comparing(
                PendingVerificationSummaryDto::getSubmittedAt,
                Comparator.nullsLast(Comparator.reverseOrder())
        ));

        return queue;
    }

    @Transactional(readOnly = true)
    public PendingVerificationSummaryDto getOrganizationDetails(String type, UUID id) {
        if ("BUSINESS".equalsIgnoreCase(type)) {
            Business b = businessRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Business not found with ID: " + id));
            return mapBusinessToSummary(b);
        } else if ("CHARITY".equalsIgnoreCase(type)) {
            Charity c = charityRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Charity not found with ID: " + id));
            return mapCharityToSummary(c);
        } else {
            throw new BadRequestException("Invalid organization type: " + type + ". Must be BUSINESS or CHARITY.");
        }
    }

    @Transactional
    public PendingVerificationSummaryDto processDecision(String adminEmail,
                                                         String type,
                                                         UUID id,
                                                         VerificationDecisionRequest request,
                                                         String ipAddress) {
        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Admin user not found"));

        if (request.getStatus() != VerificationStatus.VERIFIED && request.getStatus() != VerificationStatus.REJECTED) {
            throw new BadRequestException("Decision status must be VERIFIED or REJECTED");
        }

        if (request.getStatus() == VerificationStatus.REJECTED) {
            if (request.getReason() == null || request.getReason().trim().isEmpty()) {
                throw new BadRequestException("A rejection reason is required when rejecting an organization profile");
            }
        }

        OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
        String action = request.getStatus() == VerificationStatus.VERIFIED
                ? "ADMIN_APPROVE_VERIFICATION"
                : "ADMIN_REJECT_VERIFICATION";

        if ("BUSINESS".equalsIgnoreCase(type)) {
            Business business = businessRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Business not found with ID: " + id));

            business.setVerificationStatus(request.getStatus());
            business.setVerifiedAt(now);
            business.setVerifiedBy(admin);
            business.setVerificationNotes(request.getReason());
            Business saved = businessRepository.save(business);

            // Audit Log
            String details = String.format("Admin %s updated business '%s' (%s) verification status to %s.%s",
                    admin.getEmail(),
                    business.getBusinessName(),
                    business.getRegistrationNumber(),
                    request.getStatus(),
                    request.getReason() != null ? " Reason: " + request.getReason() : "");
            auditLogService.record(admin, action, "BUSINESS", business.getId(), details, ipAddress);

            // Email Notification Stub
            if (request.getStatus() == VerificationStatus.VERIFIED) {
                emailService.sendVerificationApprovedEmail(
                        business.getUser(),
                        business.getBusinessName(),
                        business.getBusinessType().name(),
                        business.getId()
                );
            } else {
                emailService.sendVerificationRejectedEmail(
                        business.getUser(),
                        business.getBusinessName(),
                        business.getBusinessType().name(),
                        business.getId(),
                        request.getReason()
                );
            }

            return mapBusinessToSummary(saved);

        } else if ("CHARITY".equalsIgnoreCase(type)) {
            Charity charity = charityRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Charity not found with ID: " + id));

            charity.setVerificationStatus(request.getStatus());
            charity.setVerifiedAt(now);
            charity.setVerifiedBy(admin);
            charity.setVerificationNotes(request.getReason());
            Charity saved = charityRepository.save(charity);

            // Audit Log
            String details = String.format("Admin %s updated charity '%s' (%s) verification status to %s.%s",
                    admin.getEmail(),
                    charity.getCharityName(),
                    charity.getRegistrationNumber(),
                    request.getStatus(),
                    request.getReason() != null ? " Reason: " + request.getReason() : "");
            auditLogService.record(admin, action, "CHARITY", charity.getId(), details, ipAddress);

            // Email Notification Stub
            if (request.getStatus() == VerificationStatus.VERIFIED) {
                emailService.sendVerificationApprovedEmail(
                        charity.getUser(),
                        charity.getCharityName(),
                        "CHARITY",
                        charity.getId()
                );
            } else {
                emailService.sendVerificationRejectedEmail(
                        charity.getUser(),
                        charity.getCharityName(),
                        "CHARITY",
                        charity.getId(),
                        request.getReason()
                );
            }

            return mapCharityToSummary(saved);

        } else {
            throw new BadRequestException("Invalid organization type: " + type + ". Must be BUSINESS or CHARITY.");
        }
    }

    private PendingVerificationSummaryDto mapBusinessToSummary(Business b) {
        return PendingVerificationSummaryDto.builder()
                .id(b.getId())
                .organizationType("BUSINESS")
                .name(b.getBusinessName())
                .category(b.getBusinessType().name())
                .registrationNumber(b.getRegistrationNumber())
                .description(b.getDescription())
                .operatingArea(null)
                .logoUrl(b.getLogoUrl())
                .documentUrl(b.getDocumentUrl())
                .contactPerson(b.getContactPerson())
                .contactEmail(b.getContactEmail())
                .contactPhone(b.getContactPhone())
                .addressLine1(b.getAddressLine1())
                .addressLine2(b.getAddressLine2())
                .city(b.getCity())
                .district(b.getDistrict())
                .latitude(b.getLatitude())
                .longitude(b.getLongitude())
                .capacityPeople(null)
                .verificationStatus(b.getVerificationStatus())
                .submittedAt(b.getCreatedAt())
                .verificationNotes(b.getVerificationNotes())
                .build();
    }

    private PendingVerificationSummaryDto mapCharityToSummary(Charity c) {
        return PendingVerificationSummaryDto.builder()
                .id(c.getId())
                .organizationType("CHARITY")
                .name(c.getCharityName())
                .category("CHARITY")
                .registrationNumber(c.getRegistrationNumber())
                .description(c.getDescription())
                .operatingArea(c.getOperatingArea())
                .logoUrl(c.getLogoUrl())
                .documentUrl(c.getDocumentUrl())
                .contactPerson(c.getContactPerson())
                .contactEmail(c.getContactEmail())
                .contactPhone(c.getContactPhone())
                .addressLine1(c.getAddressLine1())
                .addressLine2(c.getAddressLine2())
                .city(c.getCity())
                .district(c.getDistrict())
                .latitude(c.getLatitude())
                .longitude(c.getLongitude())
                .capacityPeople(c.getCapacityPeople())
                .verificationStatus(c.getVerificationStatus())
                .submittedAt(c.getCreatedAt())
                .verificationNotes(c.getVerificationNotes())
                .build();
    }
}

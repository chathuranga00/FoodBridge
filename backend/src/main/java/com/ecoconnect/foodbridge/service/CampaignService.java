package com.ecoconnect.foodbridge.service;

import com.ecoconnect.foodbridge.dto.*;
import com.ecoconnect.foodbridge.exception.BadRequestException;
import com.ecoconnect.foodbridge.exception.ResourceNotFoundException;
import com.ecoconnect.foodbridge.model.*;
import com.ecoconnect.foodbridge.model.enums.*;
import com.ecoconnect.foodbridge.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Service
public class CampaignService {

    private static final Logger log = LoggerFactory.getLogger(CampaignService.class);

    private final CampaignRepository campaignRepository;
    private final CampaignUpdateRepository campaignUpdateRepository;
    private final CampaignContributionRepository contributionRepository;
    private final CharityRepository charityRepository;
    private final UserRepository userRepository;
    private final AuditLogRepository auditLogRepository;
    private final VerificationGuardService verificationGuardService;

    public CampaignService(CampaignRepository campaignRepository,
                           CampaignUpdateRepository campaignUpdateRepository,
                           CampaignContributionRepository contributionRepository,
                           CharityRepository charityRepository,
                           UserRepository userRepository,
                           AuditLogRepository auditLogRepository,
                           VerificationGuardService verificationGuardService) {
        this.campaignRepository = campaignRepository;
        this.campaignUpdateRepository = campaignUpdateRepository;
        this.contributionRepository = contributionRepository;
        this.charityRepository = charityRepository;
        this.userRepository = userRepository;
        this.auditLogRepository = auditLogRepository;
        this.verificationGuardService = verificationGuardService;
    }

    /**
     * Creates a new rural community campaign.
     * Enforces:
     * - Rule 2: Charity must be admin-VERIFIED.
     * - Rule 3: Campaign starts in PENDING_APPROVAL and requires admin review.
     * - Evidence upload and district-level privacy.
     */
    @Transactional
    public CampaignResponse createCampaign(String userEmail, CampaignCreateRequest request) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userEmail));

        // Rule 2 check: Charity must be admin-verified to organize community campaigns
        Charity charity = verificationGuardService.assertCharityVerifiedForPublishing(user);

        if (request.getEndDate().isBefore(request.getStartDate())) {
            throw new BadRequestException("Campaign end date cannot be before start date");
        }

        if (request.getEvidenceUrl() == null || request.getEvidenceUrl().isBlank()) {
            throw new BadRequestException("Supporting evidence upload is required for rural community campaign moderation");
        }

        Campaign campaign = Campaign.builder()
                .organizerType(CampaignOrganizerType.CHARITY)
                .charity(charity)
                .title(request.getTitle())
                .description(request.getDescription())
                .needType(request.getNeedType())
                .district(request.getDistrict())
                .targetQuantity(request.getTargetQuantity())
                .targetUnit(request.getTargetUnit())
                .currentQuantity(0)
                .coverImageUrl(request.getCoverImageUrl())
                .evidenceUrl(request.getEvidenceUrl())
                .targetBeneficiariesCount(request.getTargetBeneficiariesCount())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .status(CampaignStatus.PENDING_APPROVAL) // Rule 3: Must be reviewed by admin
                .build();

        Campaign saved = campaignRepository.save(campaign);
        log.info("Charity {} created community campaign '{}' (ID: {}). Status: PENDING_APPROVAL.",
                charity.getCharityName(), saved.getTitle(), saved.getId());

        return CampaignResponse.fromEntity(saved);
    }

    /**
     * Publicly browse active campaigns with filters (need type, district, search).
     * Privacy: Only district is exposed, never private residences or vulnerable identities.
     */
    @Transactional(readOnly = true)
    public List<CampaignResponse> getPublicCampaigns(CampaignNeedType needType, String district, String search) {
        List<CampaignStatus> activeStatuses = List.of(
                CampaignStatus.APPROVED,
                CampaignStatus.ACTIVE,
                CampaignStatus.COMPLETED
        );

        List<Campaign> campaigns = campaignRepository.findByStatusInWithCharity(activeStatuses);

        return campaigns.stream()
                .filter(c -> {
                    if (needType != null && c.getNeedType() != needType) {
                        return false;
                    }
                    if (district != null && !district.isBlank() && !district.equalsIgnoreCase("All")) {
                        if (c.getDistrict() == null || !c.getDistrict().equalsIgnoreCase(district.trim())) {
                            return false;
                        }
                    }
                    if (search != null && !search.isBlank()) {
                        String q = search.trim().toLowerCase(Locale.ROOT);
                        boolean titleMatch = c.getTitle() != null && c.getTitle().toLowerCase(Locale.ROOT).contains(q);
                        boolean descMatch = c.getDescription() != null && c.getDescription().toLowerCase(Locale.ROOT).contains(q);
                        boolean chMatch = c.getCharity() != null && c.getCharity().getCharityName() != null &&
                                c.getCharity().getCharityName().toLowerCase(Locale.ROOT).contains(q);
                        if (!titleMatch && !descMatch && !chMatch) {
                            return false;
                        }
                    }
                    return true;
                })
                .map(CampaignResponse::fromEntity)
                .toList();
    }

    /**
     * Single campaign lookup with privacy protection.
     */
    @Transactional(readOnly = true)
    public CampaignResponse getCampaignById(UUID id, String currentUserEmail) {
        Campaign campaign = campaignRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Campaign not found with ID: " + id));

        // If not active/approved, ensure only creator or admin can view
        if (campaign.getStatus() == CampaignStatus.PENDING_APPROVAL || campaign.getStatus() == CampaignStatus.REJECTED) {
            if (currentUserEmail == null) {
                throw new ResourceNotFoundException("Campaign not found with ID: " + id);
            }
            User user = userRepository.findByEmail(currentUserEmail).orElse(null);
            boolean isOwner = user != null && campaign.getCharity() != null &&
                    campaign.getCharity().getUser() != null &&
                    campaign.getCharity().getUser().getId().equals(user.getId());
            boolean isAdmin = user != null && user.getRole() == Role.ADMIN;

            if (!isOwner && !isAdmin) {
                throw new ResourceNotFoundException("Campaign not found with ID: " + id);
            }
        }

        return CampaignResponse.fromEntity(campaign);
    }

    /**
     * Charity views all their submitted campaigns.
     */
    @Transactional(readOnly = true)
    public List<CampaignResponse> getMyCharityCampaigns(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userEmail));

        return charityRepository.findByUserId(user.getId())
                .map(charity -> campaignRepository.findByCharityIdOrderByCreatedAtDesc(charity.getId())
                        .stream()
                        .map(CampaignResponse::fromEntity)
                        .toList())
                .orElse(List.of());
    }

    /**
     * Admin lists all pending campaigns awaiting moderation.
     */
    @Transactional(readOnly = true)
    public List<CampaignResponse> getPendingCampaignsForAdmin() {
        return campaignRepository.findByStatusOrderByCreatedAtDesc(CampaignStatus.PENDING_APPROVAL)
                .stream()
                .map(CampaignResponse::fromEntity)
                .toList();
    }

    /**
     * Admin approves or rejects a campaign with audit logging (Rule 3).
     */
    @Transactional
    public CampaignResponse moderateCampaign(String adminEmail, UUID campaignId, CampaignModerationRequest request) {
        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Admin user not found: " + adminEmail));

        if (admin.getRole() != Role.ADMIN) {
            throw new AccessDeniedException("Only platform administrators can moderate campaigns");
        }

        Campaign campaign = campaignRepository.findById(campaignId)
                .orElseThrow(() -> new ResourceNotFoundException("Campaign not found with ID: " + campaignId));

        String decision = request.getDecision().trim().toUpperCase(Locale.ROOT);
        OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);

        if ("APPROVE".equals(decision)) {
            campaign.setStatus(CampaignStatus.ACTIVE);
            campaign.setApprovedBy(admin);
            campaign.setApprovedAt(now);
            campaign.setApprovalNotes(request.getReason() != null ? request.getReason() : "Approved for public visibility");
        } else if ("REJECT".equals(decision)) {
            campaign.setStatus(CampaignStatus.REJECTED);
            campaign.setApprovalNotes(request.getReason() != null ? request.getReason() : "Rejected during admin moderation");
        } else {
            throw new BadRequestException("Invalid decision: " + decision + ". Must be APPROVE or REJECT");
        }

        Campaign saved = campaignRepository.save(campaign);

        // Audit Log Entry
        AuditLog logEntry = AuditLog.builder()
                .user(admin)
                .action("CAMPAIGN_MODERATION_" + decision)
                .entityName("CAMPAIGN")
                .entityId(saved.getId())
                .details(String.format("Admin '%s' moderated campaign '%s' to status %s. Reason: %s",
                        admin.getEmail(), saved.getTitle(), saved.getStatus(), saved.getApprovalNotes()))
                .build();
        auditLogRepository.save(logEntry);

        log.info("Campaign {} moderated to {} by admin {}", campaignId, saved.getStatus(), adminEmail);
        return CampaignResponse.fromEntity(saved);
    }

    /**
     * Charity posts a field distribution update with photos.
     */
    @Transactional
    public CampaignUpdateResponse postCampaignUpdate(String userEmail, UUID campaignId, CampaignUpdateRequest request) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userEmail));

        Campaign campaign = campaignRepository.findById(campaignId)
                .orElseThrow(() -> new ResourceNotFoundException("Campaign not found with ID: " + campaignId));

        boolean isOwner = campaign.getCharity() != null &&
                campaign.getCharity().getUser() != null &&
                campaign.getCharity().getUser().getId().equals(user.getId());
        boolean isAdmin = user.getRole() == Role.ADMIN;

        if (!isOwner && !isAdmin) {
            throw new AccessDeniedException("You are not authorized to post distribution updates for this campaign");
        }

        int distributed = request.getQuantityDistributed() != null ? request.getQuantityDistributed() : 0;

        CampaignUpdate update = CampaignUpdate.builder()
                .campaign(campaign)
                .title(request.getTitle())
                .description(request.getDescription())
                .photoUrl(request.getPhotoUrl())
                .quantityDistributed(distributed)
                .distributionDate(request.getDistributionDate())
                .build();

        CampaignUpdate saved = campaignUpdateRepository.save(update);

        if (distributed > 0) {
            campaignRepository.incrementCurrentQuantity(campaignId, distributed);
            log.info("Incremented campaign {} currentQuantity by {}", campaignId, distributed);
        }

        return CampaignUpdateResponse.fromEntity(saved);
    }

    /**
     * Get all distribution updates for a campaign.
     */
    @Transactional(readOnly = true)
    public List<CampaignUpdateResponse> getCampaignUpdates(UUID campaignId) {
        return campaignUpdateRepository.findByCampaignIdOrderByDistributionDateDesc(campaignId)
                .stream()
                .map(CampaignUpdateResponse::fromEntity)
                .toList();
    }

    /**
     * Community member pledges items to a campaign (non-monetary / offline pledge).
     */
    @Transactional
    public CampaignResponse pledgeToCampaign(String userEmail, UUID campaignId, CampaignPledgeRequest request) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userEmail));

        Campaign campaign = campaignRepository.findById(campaignId)
                .orElseThrow(() -> new ResourceNotFoundException("Campaign not found with ID: " + campaignId));

        if (campaign.getStatus() != CampaignStatus.ACTIVE && campaign.getStatus() != CampaignStatus.APPROVED) {
            throw new BadRequestException("Can only pledge to active campaigns (current status: " + campaign.getStatus() + ")");
        }

        int qty = request.getPledgeQuantity() != null ? request.getPledgeQuantity() : 1;

        // Save contribution record
        CampaignContribution contribution = CampaignContribution.builder()
                .campaign(campaign)
                .contributorUser(user)
                .contributorName(user.getFullName() != null ? user.getFullName() : user.getEmail())
                .contributorEmail(user.getEmail())
                .contributorPhone(user.getPhoneNumber())
                .contributionType(ContributionType.FOOD_ITEMS)
                .itemDescription(request.getItemDescription() != null ? request.getItemDescription() : (qty + " " + campaign.getTargetUnit()))
                .status(ContributionStatus.CONFIRMED)
                .notes(request.getNotes())
                .build();
        contributionRepository.save(contribution);

        // Increment campaign current quantity
        campaignRepository.incrementCurrentQuantity(campaignId, qty);

        Campaign updated = campaignRepository.findById(campaignId).orElse(campaign);
        log.info("User {} pledged {} units to campaign {}", userEmail, qty, campaignId);

        return CampaignResponse.fromEntity(updated);
    }
}

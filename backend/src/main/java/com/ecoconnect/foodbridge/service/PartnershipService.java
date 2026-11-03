package com.ecoconnect.foodbridge.service;

import com.ecoconnect.foodbridge.dto.*;
import com.ecoconnect.foodbridge.exception.AppException;
import com.ecoconnect.foodbridge.exception.ForbiddenException;
import com.ecoconnect.foodbridge.exception.ResourceNotFoundException;
import com.ecoconnect.foodbridge.model.*;
import com.ecoconnect.foodbridge.model.enums.*;
import com.ecoconnect.foodbridge.repository.*;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class PartnershipService {

    private final PartnershipRepository partnershipRepository;
    private final PartnershipMessageRepository messageRepository;
    private final BusinessRepository businessRepository;
    private final CharityRepository charityRepository;
    private final CampaignRepository campaignRepository;
    private final CampaignContributionRepository contributionRepository;
    private final UserRepository userRepository;
    private final AuditLogService auditLogService;
    private final EmailService emailService;
    private final ObjectMapper objectMapper;

    /**
     * Business browses verified campaigns and proposes a partnership.
     */
    @Transactional
    public PartnershipResponse proposePartnership(String userEmail, PartnershipProposeRequest request, String ipAddress) {
        User businessUser = getUserByEmailOrThrow(userEmail);

        Business business = businessRepository.findByUserId(businessUser.getId())
                .orElseThrow(() -> new AppException("Business profile not found. Please create and verify your profile first.", HttpStatus.FORBIDDEN));

        if (business.getVerificationStatus() != VerificationStatus.VERIFIED) {
            throw new AppException("Only admin-verified businesses can propose partnerships (Rule 2).", HttpStatus.FORBIDDEN);
        }

        Campaign campaign = campaignRepository.findById(request.getCampaignId())
                .orElseThrow(() -> new ResourceNotFoundException("Campaign not found with ID: " + request.getCampaignId()));

        if (campaign.getStatus() != CampaignStatus.ACTIVE && campaign.getStatus() != CampaignStatus.APPROVED) {
            throw new AppException("Partnerships can only be proposed for verified active campaigns.", HttpStatus.BAD_REQUEST);
        }

        Charity charity = campaign.getCharity();
        if (charity == null) {
            throw new AppException("Target campaign does not have an associated charity.", HttpStatus.BAD_REQUEST);
        }

        // Validate contribution
        if (request.getContributionType() == ContributionType.MONETARY_PLEDGE) {
            if (request.getMonetaryAmount() == null || request.getMonetaryAmount().compareTo(BigDecimal.ZERO) <= 0) {
                throw new AppException("Monetary amount must be greater than zero for monetary pledges.", HttpStatus.BAD_REQUEST);
            }
        } else {
            if (request.getQuantity() == null || request.getQuantity() <= 0) {
                throw new AppException("Quantity must be greater than zero for physical aid supplies.", HttpStatus.BAD_REQUEST);
            }
        }

        String recognition = (request.getRequestedRecognition() != null && !request.getRequestedRecognition().isBlank())
                ? request.getRequestedRecognition().trim()
                : "Official Corporate Partner";

        Partnership partnership = Partnership.builder()
                .business(business)
                .charity(charity)
                .partnerType(RequesterType.CHARITY)
                .campaign(campaign)
                .contributionType(request.getContributionType())
                .monetaryAmount(request.getMonetaryAmount())
                .quantity(request.getQuantity())
                .unit(request.getUnit() != null ? request.getUnit() : campaign.getTargetUnit())
                .itemDescription(request.getItemDescription())
                .requestedRecognition(recognition)
                .status(PartnershipStatus.PROPOSED)
                .lastCounterByRole("BUSINESS")
                .recognitionActive(false)
                .agreementDetails(request.getInitialMessage())
                .startDate(request.getProposedDeliveryDate())
                .build();

        Partnership saved = partnershipRepository.save(partnership);

        // Record initial proposal message in thread
        PartnershipMessage msg = PartnershipMessage.builder()
                .partnership(saved)
                .senderUser(businessUser)
                .senderRole("BUSINESS")
                .senderName(business.getBusinessName())
                .messageText(request.getInitialMessage())
                .isCounterProposal(false)
                .build();
        messageRepository.save(msg);

        // Audit log
        String auditDetails = String.format("Business '%s' proposed partnership for campaign '%s'. Type: %s, Recognition: %s",
                business.getBusinessName(), campaign.getTitle(), request.getContributionType(), recognition);
        auditLogService.record(businessUser, "PARTNERSHIP_PROPOSED", "PARTNERSHIP", saved.getId(), auditDetails, ipAddress);

        // Notifications
        if (charity.getUser() != null) {
            sendNotification(charity.getUser(),
                    "New Partnership Proposal: " + business.getBusinessName(),
                    String.format("Business '%s' proposed a partnership for campaign '%s'. Requested recognition: %s",
                            business.getBusinessName(), campaign.getTitle(), recognition),
                    "PARTNERSHIP_PROPOSED", saved.getId());
        }

        log.info("Partnership {} proposed by business {} for campaign {}", saved.getId(), business.getId(), campaign.getId());
        return enrichWithMessages(saved);
    }

    /**
     * Counter-propose adjusted terms (contribution or recognition) in the message thread.
     */
    @Transactional
    public PartnershipResponse counterProposal(UUID partnershipId, String userEmail, PartnershipCounterRequest request, String ipAddress) {
        User user = getUserByEmailOrThrow(userEmail);
        Partnership partnership = getPartnershipOrThrow(partnershipId);

        if (partnership.getStatus() != PartnershipStatus.PROPOSED && partnership.getStatus() != PartnershipStatus.COUNTERED) {
            throw new AppException("Cannot counter a partnership that is in status " + partnership.getStatus() + ". Terms may already be agreed or declined.", HttpStatus.BAD_REQUEST);
        }

        boolean isBusiness = partnership.getBusiness().getUser().getId().equals(user.getId());
        boolean isCharity = partnership.getCharity().getUser().getId().equals(user.getId());

        if (!isBusiness && !isCharity) {
            throw new ForbiddenException("You are not an authorized party in this partnership.");
        }

        String role = isCharity ? "CHARITY" : "BUSINESS";
        String senderName = isCharity ? partnership.getCharity().getCharityName() : partnership.getBusiness().getBusinessName();

        // Update pending values if specified in counter
        if (request.getCounterContributionType() != null) {
            partnership.setContributionType(request.getCounterContributionType());
        }
        if (request.getCounterMonetaryAmount() != null) {
            partnership.setMonetaryAmount(request.getCounterMonetaryAmount());
        }
        if (request.getCounterQuantity() != null) {
            partnership.setQuantity(request.getCounterQuantity());
        }
        if (request.getCounterUnit() != null) {
            partnership.setUnit(request.getCounterUnit());
        }
        if (request.getCounterItemDescription() != null) {
            partnership.setItemDescription(request.getCounterItemDescription());
        }
        if (request.getCounterRecognition() != null && !request.getCounterRecognition().isBlank()) {
            partnership.setRequestedRecognition(request.getCounterRecognition().trim());
        }

        partnership.setStatus(PartnershipStatus.COUNTERED);
        partnership.setLastCounterByRole(role);
        Partnership saved = partnershipRepository.save(partnership);

        // Record counter message in thread
        PartnershipMessage msg = PartnershipMessage.builder()
                .partnership(saved)
                .senderUser(user)
                .senderRole(role)
                .senderName(senderName)
                .messageText(request.getMessage())
                .isCounterProposal(true)
                .counterContributionType(request.getCounterContributionType())
                .counterMonetaryAmount(request.getCounterMonetaryAmount())
                .counterQuantity(request.getCounterQuantity())
                .counterUnit(request.getCounterUnit())
                .counterItemDescription(request.getCounterItemDescription())
                .counterRecognition(request.getCounterRecognition())
                .build();
        messageRepository.save(msg);

        // Audit Log
        String auditDetails = String.format("%s '%s' counter-proposed partnership terms for partnership %s.",
                role, senderName, saved.getId());
        auditLogService.record(user, "PARTNERSHIP_COUNTERED", "PARTNERSHIP", saved.getId(), auditDetails, ipAddress);

        // Notification to counterparty
        User counterparty = isCharity ? partnership.getBusiness().getUser() : partnership.getCharity().getUser();
        if (counterparty != null) {
            sendNotification(counterparty,
                    "Counter-Proposal Received from " + senderName,
                    String.format("%s counter-proposed terms for your partnership on campaign '%s': %s",
                            senderName, partnership.getCampaign().getTitle(), request.getMessage()),
                    "PARTNERSHIP_COUNTERED", saved.getId());
        }

        return enrichWithMessages(saved);
    }

    /**
     * Either party accepts current proposed/counter terms.
     * Status becomes AGREED, terms are locked and stored immutably.
     */
    @Transactional
    public PartnershipResponse acceptPartnership(UUID partnershipId, String userEmail, PartnershipAcceptRequest request, String ipAddress) {
        User user = getUserByEmailOrThrow(userEmail);
        Partnership partnership = getPartnershipOrThrow(partnershipId);

        if (partnership.getStatus() != PartnershipStatus.PROPOSED && partnership.getStatus() != PartnershipStatus.COUNTERED) {
            throw new AppException("Cannot accept partnership in status " + partnership.getStatus() + ". Only proposed or countered partnerships can be accepted.", HttpStatus.BAD_REQUEST);
        }

        boolean isBusiness = partnership.getBusiness().getUser().getId().equals(user.getId());
        boolean isCharity = partnership.getCharity().getUser().getId().equals(user.getId());

        if (!isBusiness && !isCharity) {
            throw new ForbiddenException("You are not an authorized party in this partnership.");
        }

        // If in PROPOSED status, charity must accept.
        if (partnership.getStatus() == PartnershipStatus.PROPOSED && !isCharity) {
            throw new AppException("Initial proposal must be reviewed and accepted by the receiving charity.", HttpStatus.BAD_REQUEST);
        }

        // If in COUNTERED status, the counterparty must accept (cannot accept your own counter)
        if (partnership.getStatus() == PartnershipStatus.COUNTERED) {
            if ("CHARITY".equals(partnership.getLastCounterByRole()) && isCharity) {
                throw new AppException("You cannot accept your own counter-proposal. Waiting for the business to respond.", HttpStatus.BAD_REQUEST);
            }
            if ("BUSINESS".equals(partnership.getLastCounterByRole()) && isBusiness) {
                throw new AppException("You cannot accept your own counter-proposal. Waiting for the charity to respond.", HttpStatus.BAD_REQUEST);
            }
        }

        String role = isCharity ? "CHARITY" : "BUSINESS";
        String partyName = isCharity ? partnership.getCharity().getCharityName() : partnership.getBusiness().getBusinessName();

        // Lock agreed terms and store snapshot immutably
        OffsetDateTime now = OffsetDateTime.now();
        partnership.setStatus(PartnershipStatus.AGREED);
        partnership.setAgreedAt(now);
        partnership.setAgreedRecognition(partnership.getRequestedRecognition() != null ? partnership.getRequestedRecognition() : "Official Corporate Partner");
        partnership.setAgreedByBusinessUser(partnership.getBusiness().getUser());
        partnership.setAgreedByCharityUser(partnership.getCharity().getUser());

        // Build immutable JSON snapshot
        Map<String, Object> snapshot = new LinkedHashMap<>();
        snapshot.put("partnershipId", partnership.getId().toString());
        snapshot.put("campaignId", partnership.getCampaign().getId().toString());
        snapshot.put("campaignTitle", partnership.getCampaign().getTitle());
        snapshot.put("businessId", partnership.getBusiness().getId().toString());
        snapshot.put("businessName", partnership.getBusiness().getBusinessName());
        snapshot.put("charityId", partnership.getCharity().getId().toString());
        snapshot.put("charityName", partnership.getCharity().getCharityName());
        snapshot.put("contributionType", partnership.getContributionType() != null ? partnership.getContributionType().name() : null);
        snapshot.put("monetaryAmount", partnership.getMonetaryAmount());
        snapshot.put("quantity", partnership.getQuantity());
        snapshot.put("unit", partnership.getUnit());
        snapshot.put("itemDescription", partnership.getItemDescription());
        snapshot.put("agreedRecognition", partnership.getAgreedRecognition());
        snapshot.put("agreedAt", now.toString());
        snapshot.put("acceptedByRole", role);
        snapshot.put("acceptedByUserId", user.getId().toString());
        snapshot.put("immutable", true);

        try {
            partnership.setAgreedTermsSnapshot(objectMapper.writeValueAsString(snapshot));
        } catch (JsonProcessingException e) {
            log.error("Failed to serialize agreed terms snapshot", e);
            partnership.setAgreedTermsSnapshot("{\"agreedAt\":\"" + now + "\",\"immutable\":true}");
        }

        Partnership saved = partnershipRepository.save(partnership);

        // System message in thread
        String acceptMessage = (request != null && request.getMessage() != null && !request.getMessage().isBlank())
                ? request.getMessage().trim()
                : partyName + " accepted all terms. Partnership terms are now AGREED and locked (immutable).";

        PartnershipMessage msg = PartnershipMessage.builder()
                .partnership(saved)
                .senderUser(user)
                .senderRole(role)
                .senderName(partyName)
                .messageText(acceptMessage)
                .isCounterProposal(false)
                .build();
        messageRepository.save(msg);

        // Audit Log
        String auditDetails = String.format("Partnership %s terms agreed and locked by %s '%s'. Recognition: %s",
                saved.getId(), role, partyName, saved.getAgreedRecognition());
        auditLogService.record(user, "PARTNERSHIP_AGREED", "PARTNERSHIP", saved.getId(), auditDetails, ipAddress);

        // Notify other party
        User counterparty = isCharity ? partnership.getBusiness().getUser() : partnership.getCharity().getUser();
        if (counterparty != null) {
            sendNotification(counterparty,
                    "Partnership Terms Agreed! (" + partyName + ")",
                    String.format("%s accepted the partnership terms for '%s'. Next step: Business delivers support.",
                            partyName, partnership.getCampaign().getTitle()),
                    "PARTNERSHIP_AGREED", saved.getId());
        }

        log.info("Partnership {} terms agreed and locked immutably", saved.getId());
        return enrichWithMessages(saved);
    }

    /**
     * Decline proposal or ongoing negotiations.
     */
    @Transactional
    public PartnershipResponse declinePartnership(UUID partnershipId, String userEmail, PartnershipDeclineRequest request, String ipAddress) {
        User user = getUserByEmailOrThrow(userEmail);
        Partnership partnership = getPartnershipOrThrow(partnershipId);

        if (partnership.getStatus() == PartnershipStatus.COMPLETED) {
            throw new AppException("Cannot decline a completed partnership.", HttpStatus.BAD_REQUEST);
        }

        boolean isBusiness = partnership.getBusiness().getUser().getId().equals(user.getId());
        boolean isCharity = partnership.getCharity().getUser().getId().equals(user.getId());

        if (!isBusiness && !isCharity) {
            throw new ForbiddenException("You are not an authorized party in this partnership.");
        }

        String role = isCharity ? "CHARITY" : "BUSINESS";
        String partyName = isCharity ? partnership.getCharity().getCharityName() : partnership.getBusiness().getBusinessName();

        partnership.setStatus(PartnershipStatus.DECLINED);
        Partnership saved = partnershipRepository.save(partnership);

        // Add decline message to thread
        PartnershipMessage msg = PartnershipMessage.builder()
                .partnership(saved)
                .senderUser(user)
                .senderRole(role)
                .senderName(partyName)
                .messageText("Partnership declined: " + request.getReason())
                .isCounterProposal(false)
                .build();
        messageRepository.save(msg);

        // Audit Log
        auditLogService.record(user, "PARTNERSHIP_DECLINED", "PARTNERSHIP", saved.getId(),
                role + " '" + partyName + "' declined partnership. Reason: " + request.getReason(), ipAddress);

        // Notify counterparty
        User counterparty = isCharity ? partnership.getBusiness().getUser() : partnership.getCharity().getUser();
        if (counterparty != null) {
            sendNotification(counterparty,
                    "Partnership Declined",
                    String.format("%s declined the partnership on campaign '%s'. Reason: %s",
                            partyName, partnership.getCampaign().getTitle(), request.getReason()),
                    "PARTNERSHIP_DECLINED", saved.getId());
        }

        return enrichWithMessages(saved);
    }

    /**
     * Business delivers support (courier dispatch, direct transfer, physical handover).
     */
    @Transactional
    public PartnershipResponse deliverSupport(UUID partnershipId, String userEmail, PartnershipDeliverRequest request, String ipAddress) {
        User businessUser = getUserByEmailOrThrow(userEmail);
        Partnership partnership = getPartnershipOrThrow(partnershipId);

        if (!partnership.getBusiness().getUser().getId().equals(businessUser.getId())) {
            throw new ForbiddenException("Only the partnering business can mark support as delivered.");
        }

        if (partnership.getStatus() != PartnershipStatus.AGREED) {
            throw new AppException("Support can only be delivered for partnerships with AGREED terms. Current status: " + partnership.getStatus(), HttpStatus.BAD_REQUEST);
        }

        OffsetDateTime now = OffsetDateTime.now();
        partnership.setStatus(PartnershipStatus.DELIVERED);
        partnership.setDeliveredAt(now);
        partnership.setDeliveryNotes(request.getDeliveryNotes().trim());
        Partnership saved = partnershipRepository.save(partnership);

        // Message to thread
        PartnershipMessage msg = PartnershipMessage.builder()
                .partnership(saved)
                .senderUser(businessUser)
                .senderRole("BUSINESS")
                .senderName(partnership.getBusiness().getBusinessName())
                .messageText("Support Dispatched / Delivered: " + request.getDeliveryNotes().trim())
                .isCounterProposal(false)
                .build();
        messageRepository.save(msg);

        // Audit Log
        auditLogService.record(businessUser, "PARTNERSHIP_DELIVERED", "PARTNERSHIP", saved.getId(),
                "Business delivered support: " + request.getDeliveryNotes(), ipAddress);

        // Notify Charity
        if (partnership.getCharity().getUser() != null) {
            sendNotification(partnership.getCharity().getUser(),
                    "Partnership Support Delivered: " + partnership.getBusiness().getBusinessName(),
                    String.format("Business '%s' has dispatched/delivered support for '%s'. Please verify and confirm receipt to activate recognition.",
                            partnership.getBusiness().getBusinessName(), partnership.getCampaign().getTitle()),
                    "PARTNERSHIP_DELIVERED", saved.getId());
        }

        return enrichWithMessages(saved);
    }

    /**
     * Charity confirms receipt (status COMPLETED).
     * Platform records the contribution, updates campaign progress, and activates the agreed recognition.
     */
    @Transactional
    public PartnershipResponse confirmReceiptAndComplete(UUID partnershipId, String userEmail, PartnershipCompleteRequest request, String ipAddress) {
        User charityUser = getUserByEmailOrThrow(userEmail);
        Partnership partnership = getPartnershipOrThrow(partnershipId);

        if (!partnership.getCharity().getUser().getId().equals(charityUser.getId())) {
            throw new ForbiddenException("Only the recipient charity can confirm receipt and complete this partnership.");
        }

        if (partnership.getStatus() != PartnershipStatus.DELIVERED && partnership.getStatus() != PartnershipStatus.AGREED) {
            throw new AppException("Partnership must be in DELIVERED or AGREED status to confirm receipt. Current status: " + partnership.getStatus(), HttpStatus.BAD_REQUEST);
        }

        OffsetDateTime now = OffsetDateTime.now();
        partnership.setStatus(PartnershipStatus.COMPLETED);
        partnership.setCompletedAt(now);
        partnership.setCompletedBy(charityUser);
        partnership.setCompletionNotes(request.getCompletionNotes().trim());

        // ACTIVATE PROMOTIONAL RECOGNITION (Only activated upon verified completion!)
        partnership.setRecognitionActive(true);

        // Automatically record Campaign Contribution & increment campaign progress bar
        Campaign campaign = partnership.getCampaign();
        int progressIncrement = 0;
        if (partnership.getContributionType() == ContributionType.MONETARY_PLEDGE && partnership.getMonetaryAmount() != null) {
            progressIncrement = partnership.getMonetaryAmount().intValue();
        } else if (partnership.getQuantity() != null) {
            progressIncrement = partnership.getQuantity();
        }

        // Create campaign contribution record
        CampaignContribution contrib = CampaignContribution.builder()
                .campaign(campaign)
                .contributorUser(partnership.getBusiness().getUser())
                .contributorName(partnership.getBusiness().getBusinessName())
                .contributorEmail(partnership.getBusiness().getUser().getEmail())
                .contributorPhone(partnership.getBusiness().getUser().getPhoneNumber())
                .contributionType(partnership.getContributionType())
                .monetaryAmount(partnership.getMonetaryAmount())
                .quantity(partnership.getQuantity())
                .unit(partnership.getUnit())
                .itemDescription(partnership.getItemDescription())
                .status(request.getEvidenceUrl() != null && !request.getEvidenceUrl().isBlank()
                        ? ContributionStatus.DISTRIBUTED
                        : ContributionStatus.CONFIRMED)
                .confirmedAt(now)
                .confirmedBy(charityUser)
                .distributionEvidenceUrl(request.getEvidenceUrl())
                .distributionNotes(request.getCompletionNotes())
                .distributedAt(request.getEvidenceUrl() != null ? now : null)
                .distributedBy(request.getEvidenceUrl() != null ? charityUser : null)
                .notes(String.format("Completed Corporate CSR Partnership with %s. Agreed Recognition: %s",
                        partnership.getBusiness().getBusinessName(), partnership.getAgreedRecognition()))
                .build();

        CampaignContribution savedContrib = contributionRepository.save(contrib);
        partnership.setCampaignContribution(savedContrib);

        // Update campaign currentQuantity atomically
        if (campaign != null) {
            campaign.setCurrentQuantity((campaign.getCurrentQuantity() != null ? campaign.getCurrentQuantity() : 0) + progressIncrement);
            campaignRepository.save(campaign);
        }

        Partnership saved = partnershipRepository.save(partnership);

        // Message to thread
        PartnershipMessage msg = PartnershipMessage.builder()
                .partnership(saved)
                .senderUser(charityUser)
                .senderRole("CHARITY")
                .senderName(partnership.getCharity().getCharityName())
                .messageText(String.format("Charity confirmed receipt! Partnership COMPLETED. Agreed promotional recognition '%s' is now ACTIVATED on business profile and campaign page.",
                        partnership.getAgreedRecognition()))
                .isCounterProposal(false)
                .build();
        messageRepository.save(msg);

        // Audit Log
        String auditDetails = String.format("Charity confirmed receipt for partnership %s. Status COMPLETED. Recognition '%s' ACTIVATED for business '%s'.",
                saved.getId(), saved.getAgreedRecognition(), saved.getBusiness().getBusinessName());
        auditLogService.record(charityUser, "PARTNERSHIP_COMPLETED", "PARTNERSHIP", saved.getId(), auditDetails, ipAddress);

        // Notify Business User
        if (partnership.getBusiness().getUser() != null) {
            sendNotification(partnership.getBusiness().getUser(),
                    "Partnership Completed & Recognition Activated! 🎉",
                    String.format("Charity '%s' confirmed receipt. Your promotional badge '%s' is now active on your profile and campaign '%s'!",
                            partnership.getCharity().getCharityName(), partnership.getAgreedRecognition(), campaign != null ? campaign.getTitle() : ""),
                    "PARTNERSHIP_COMPLETED", saved.getId());
        }

        log.info("Partnership {} marked COMPLETED. Promotional recognition {} activated.", saved.getId(), saved.getAgreedRecognition());
        return enrichWithMessages(saved);
    }

    /**
     * Post a regular message to the negotiation thread without modifying terms.
     */
    @Transactional
    public PartnershipResponse postMessage(UUID partnershipId, String userEmail, PartnershipMessageRequest request, String ipAddress) {
        User user = getUserByEmailOrThrow(userEmail);
        Partnership partnership = getPartnershipOrThrow(partnershipId);

        boolean isBusiness = partnership.getBusiness().getUser().getId().equals(user.getId());
        boolean isCharity = partnership.getCharity().getUser().getId().equals(user.getId());

        if (!isBusiness && !isCharity) {
            throw new ForbiddenException("You are not an authorized party in this partnership.");
        }

        String role = isCharity ? "CHARITY" : "BUSINESS";
        String senderName = isCharity ? partnership.getCharity().getCharityName() : partnership.getBusiness().getBusinessName();

        PartnershipMessage msg = PartnershipMessage.builder()
                .partnership(partnership)
                .senderUser(user)
                .senderRole(role)
                .senderName(senderName)
                .messageText(request.getMessage().trim())
                .isCounterProposal(false)
                .build();
        messageRepository.save(msg);

        // Notify counterparty
        User counterparty = isCharity ? partnership.getBusiness().getUser() : partnership.getCharity().getUser();
        if (counterparty != null) {
            sendNotification(counterparty,
                    "New Message from " + senderName,
                    request.getMessage().trim(),
                    "PARTNERSHIP_MESSAGE", partnership.getId());
        }

        return enrichWithMessages(partnership);
    }

    /**
     * Retrieve single partnership with full message thread and timeline.
     */
    @Transactional(readOnly = true)
    public PartnershipResponse getPartnershipDetails(UUID id, String userEmail) {
        User currentUser = getUserByEmailOrThrow(userEmail);
        Partnership partnership = getPartnershipOrThrow(id);

        boolean isBusiness = partnership.getBusiness().getUser().getId().equals(currentUser.getId());
        boolean isCharity = partnership.getCharity().getUser().getId().equals(currentUser.getId());
        boolean isAdmin = currentUser.getRole() == Role.ADMIN;

        if (!isBusiness && !isCharity && !isAdmin) {
            throw new ForbiddenException("You do not have permission to view this partnership.");
        }

        return enrichWithMessages(partnership);
    }

    /**
     * Get all partnerships for authenticated business.
     */
    @Transactional(readOnly = true)
    public List<PartnershipResponse> getMyBusinessPartnerships(String userEmail) {
        User businessUser = getUserByEmailOrThrow(userEmail);
        Business business = businessRepository.findByUserId(businessUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Business profile not found"));
        return partnershipRepository.findByBusinessIdOrderByCreatedAtDesc(business.getId())
                .stream()
                .map(this::enrichWithMessages)
                .collect(Collectors.toList());
    }

    /**
     * Get all partnerships for authenticated charity.
     */
    @Transactional(readOnly = true)
    public List<PartnershipResponse> getMyCharityPartnerships(String userEmail) {
        User charityUser = getUserByEmailOrThrow(userEmail);
        Charity charity = charityRepository.findByUserId(charityUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Charity profile not found"));
        return partnershipRepository.findByCharityIdOrderByCreatedAtDesc(charity.getId())
                .stream()
                .map(this::enrichWithMessages)
                .collect(Collectors.toList());
    }

    /**
     * Admin monitoring: query partnerships with filters.
     */
    @Transactional(readOnly = true)
    public List<PartnershipResponse> getAdminPartnerships(PartnershipStatus status, UUID businessId, UUID charityId, UUID campaignId) {
        List<Partnership> all = partnershipRepository.findAllByOrderByCreatedAtDesc();
        return all.stream()
                .filter(p -> status == null || p.getStatus() == status)
                .filter(p -> businessId == null || (p.getBusiness() != null && p.getBusiness().getId().equals(businessId)))
                .filter(p -> charityId == null || (p.getCharity() != null && p.getCharity().getId().equals(charityId)))
                .filter(p -> campaignId == null || (p.getCampaign() != null && p.getCampaign().getId().equals(campaignId)))
                .map(this::enrichWithMessages)
                .collect(Collectors.toList());
    }

    /**
     * Public endpoint: retrieve active promotional recognitions for a campaign.
     * ONLY returns recognitions from COMPLETED partnerships (Rule: recognition active = true).
     */
    @Transactional(readOnly = true)
    public List<PartnershipRecognitionResponse> getActiveRecognitionsForCampaign(UUID campaignId) {
        return partnershipRepository.findByCampaignIdAndRecognitionActiveTrue(campaignId).stream()
                .map(p -> PartnershipRecognitionResponse.builder()
                        .partnershipId(p.getId())
                        .businessId(p.getBusiness().getId())
                        .businessName(p.getBusiness().getBusinessName())
                        .businessType(p.getBusiness().getBusinessType() != null ? p.getBusiness().getBusinessType().name() : null)
                        .businessLogoUrl(p.getBusiness().getLogoUrl())
                        .campaignId(p.getCampaign().getId())
                        .campaignTitle(p.getCampaign().getTitle())
                        .recognitionBadge(p.getAgreedRecognition())
                        .impactSummary(formatImpactSummary(p))
                        .completedAt(p.getCompletedAt())
                        .build())
                .collect(Collectors.toList());
    }

    /**
     * Public endpoint: retrieve active promotional recognitions for a business profile.
     * ONLY returns recognitions from COMPLETED partnerships (Rule: recognition active = true).
     */
    @Transactional(readOnly = true)
    public List<PartnershipRecognitionResponse> getActiveRecognitionsForBusiness(UUID businessId) {
        return partnershipRepository.findByBusinessIdAndRecognitionActiveTrue(businessId).stream()
                .map(p -> PartnershipRecognitionResponse.builder()
                        .partnershipId(p.getId())
                        .businessId(p.getBusiness().getId())
                        .businessName(p.getBusiness().getBusinessName())
                        .businessType(p.getBusiness().getBusinessType() != null ? p.getBusiness().getBusinessType().name() : null)
                        .businessLogoUrl(p.getBusiness().getLogoUrl())
                        .campaignId(p.getCampaign() != null ? p.getCampaign().getId() : null)
                        .campaignTitle(p.getCampaign() != null ? p.getCampaign().getTitle() : null)
                        .recognitionBadge(p.getAgreedRecognition())
                        .impactSummary(formatImpactSummary(p))
                        .completedAt(p.getCompletedAt())
                        .build())
                .collect(Collectors.toList());
    }

    private String formatImpactSummary(Partnership p) {
        if (p.getContributionType() == ContributionType.MONETARY_PLEDGE && p.getMonetaryAmount() != null) {
            return String.format("Contributed LKR %s direct aid", NumberFormatUtil(p.getMonetaryAmount()));
        } else if (p.getQuantity() != null) {
            return String.format("Provided %d %s (%s)", p.getQuantity(), p.getUnit() != null ? p.getUnit() : "Units",
                    p.getItemDescription() != null ? p.getItemDescription() : "Relief Aid");
        }
        return "Verified CSR Community Support";
    }

    private String NumberFormatUtil(BigDecimal amount) {
        return String.format("%,.2f", amount);
    }

    private User getUserByEmailOrThrow(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
    }

    private Partnership getPartnershipOrThrow(UUID id) {
        return partnershipRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Partnership not found with ID: " + id));
    }

    private PartnershipResponse enrichWithMessages(Partnership p) {
        PartnershipResponse resp = PartnershipResponse.fromEntity(p);
        List<PartnershipMessage> msgs = messageRepository.findByPartnershipIdOrderByCreatedAtAsc(p.getId());
        resp.setMessages(msgs.stream().map(PartnershipMessageResponse::fromEntity).collect(Collectors.toList()));
        return resp;
    }

    private void sendNotification(User recipient, String title, String message, String type, UUID refId) {
        try {
            emailService.sendPartnershipUpdateEmail(recipient, title, message, type, null, refId);
        } catch (Exception e) {
            log.warn("Failed to dispatch partnership notification to user {}: {}", recipient.getEmail(), e.getMessage());
        }
    }
}

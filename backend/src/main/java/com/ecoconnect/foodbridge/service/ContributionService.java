package com.ecoconnect.foodbridge.service;

import com.ecoconnect.foodbridge.dto.CampaignContributionResponse;
import com.ecoconnect.foodbridge.dto.ContributionConfirmRequest;
import com.ecoconnect.foodbridge.dto.ContributionCreateRequest;
import com.ecoconnect.foodbridge.dto.ContributionDistributeRequest;
import com.ecoconnect.foodbridge.exception.BadRequestException;
import com.ecoconnect.foodbridge.exception.ForbiddenException;
import com.ecoconnect.foodbridge.exception.ResourceNotFoundException;
import com.ecoconnect.foodbridge.model.Campaign;
import com.ecoconnect.foodbridge.model.CampaignContribution;
import com.ecoconnect.foodbridge.model.User;
import com.ecoconnect.foodbridge.model.enums.CampaignStatus;
import com.ecoconnect.foodbridge.model.enums.ContributionStatus;
import com.ecoconnect.foodbridge.model.enums.ContributionType;
import com.ecoconnect.foodbridge.model.enums.Role;
import com.ecoconnect.foodbridge.repository.CampaignContributionRepository;
import com.ecoconnect.foodbridge.repository.CampaignRepository;
import com.ecoconnect.foodbridge.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Service enforcing Rule 5 & Rule 8:
 * Contribution tracking WITHOUT payment processing.
 * Direct donations/pledges (funds, food, or other resources) confirmed by receiving charity.
 * Kept strictly isolated from platform subscriptions and revenue.
 */
@Slf4j
@Service
public class ContributionService {

    private final CampaignContributionRepository contributionRepository;
    private final CampaignRepository campaignRepository;
    private final UserRepository userRepository;

    public ContributionService(CampaignContributionRepository contributionRepository,
                               CampaignRepository campaignRepository,
                               UserRepository userRepository) {
        this.contributionRepository = contributionRepository;
        this.campaignRepository = campaignRepository;
        this.userRepository = userRepository;
    }

    /**
     * User or Business pledges a contribution to an approved campaign.
     * Starts in PLEDGED status.
     * Campaign progress is NOT incremented until the receiving charity confirms receipt.
     */
    @Transactional
    public CampaignContributionResponse pledgeContribution(String userEmail, UUID campaignId, ContributionCreateRequest request) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userEmail));

        Campaign campaign = campaignRepository.findById(campaignId)
                .orElseThrow(() -> new ResourceNotFoundException("Campaign not found with ID: " + campaignId));

        if (campaign.getStatus() != CampaignStatus.ACTIVE && campaign.getStatus() != CampaignStatus.APPROVED) {
            throw new BadRequestException("Contributions can only be pledged to active approved campaigns (current status: " + campaign.getStatus() + ")");
        }

        ContributionType type = request.getContributionType() != null ? request.getContributionType() : ContributionType.OTHER_RESOURCES;

        int qty = 1;
        if (request.getQuantity() != null && request.getQuantity() > 0) {
            qty = request.getQuantity();
        } else if (request.getMonetaryAmount() != null && request.getMonetaryAmount().intValue() > 0) {
            qty = request.getMonetaryAmount().intValue();
        } else if (request.getFoodAmountKg() != null && request.getFoodAmountKg().intValue() > 0) {
            qty = request.getFoodAmountKg().intValue();
        }

        String unit = request.getUnit() != null && !request.getUnit().isBlank()
                ? request.getUnit()
                : (campaign.getTargetUnit() != null ? campaign.getTargetUnit() : (type == ContributionType.MONETARY_PLEDGE ? "LKR" : "Units"));

        String name = request.getContributorName() != null && !request.getContributorName().isBlank()
                ? request.getContributorName()
                : (user.getFullName() != null ? user.getFullName() : user.getEmail());

        String email = request.getContributorEmail() != null && !request.getContributorEmail().isBlank()
                ? request.getContributorEmail()
                : user.getEmail();

        String phone = request.getContributorPhone() != null && !request.getContributorPhone().isBlank()
                ? request.getContributorPhone()
                : user.getPhoneNumber();

        CampaignContribution contribution = CampaignContribution.builder()
                .campaign(campaign)
                .contributorUser(user)
                .contributorName(name)
                .contributorEmail(email)
                .contributorPhone(phone)
                .contributionType(type)
                .quantity(qty)
                .unit(unit)
                .monetaryAmount(request.getMonetaryAmount())
                .foodAmountKg(request.getFoodAmountKg())
                .itemDescription(request.getItemDescription() != null ? request.getItemDescription() : (qty + " " + unit))
                .status(ContributionStatus.PLEDGED)
                .notes(request.getNotes())
                .build();

        CampaignContribution saved = contributionRepository.save(contribution);
        log.info("Recorded contribution pledge {} by {} for campaign {}", saved.getId(), userEmail, campaignId);

        return CampaignContributionResponse.fromEntity(saved);
    }

    /**
     * Get contributions pledged by the currently authenticated user or business.
     */
    @Transactional(readOnly = true)
    public List<CampaignContributionResponse> getMyContributions(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userEmail));

        return contributionRepository.findByContributorUserIdOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(CampaignContributionResponse::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Get contributions received for the charity's campaigns.
     */
    @Transactional(readOnly = true)
    public List<CampaignContributionResponse> getCharityContributions(String userEmail, ContributionStatus status) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userEmail));

        List<CampaignContribution> list;
        if (user.getRole() == Role.ADMIN) {
            list = contributionRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt"));
        } else {
            if (status != null) {
                list = contributionRepository.findByCharityUserIdAndStatusOrderByCreatedAtDesc(user.getId(), status);
            } else {
                list = contributionRepository.findByCharityUserIdOrderByCreatedAtDesc(user.getId());
            }
        }

        return list.stream()
                .map(CampaignContributionResponse::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Get single contribution details.
     */
    @Transactional(readOnly = true)
    public CampaignContributionResponse getContributionById(String userEmail, UUID contributionId) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userEmail));

        CampaignContribution contribution = contributionRepository.findById(contributionId)
                .orElseThrow(() -> new ResourceNotFoundException("Contribution not found: " + contributionId));

        validateAccess(user, contribution);
        return CampaignContributionResponse.fromEntity(contribution);
    }

    /**
     * Receiving charity confirms receipt of funds or physical handover.
     * Updates status to CONFIRMED and updates campaign progress atomically.
     */
    @Transactional
    public CampaignContributionResponse confirmContribution(String userEmail, UUID contributionId, ContributionConfirmRequest request) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userEmail));

        CampaignContribution contribution = contributionRepository.findById(contributionId)
                .orElseThrow(() -> new ResourceNotFoundException("Contribution not found: " + contributionId));

        validateCharityOwnership(user, contribution);

        if (contribution.getStatus() != ContributionStatus.PLEDGED && contribution.getStatus() != ContributionStatus.PENDING_CONFIRMATION) {
            throw new BadRequestException("Contribution cannot be confirmed from status: " + contribution.getStatus());
        }

        contribution.setStatus(ContributionStatus.CONFIRMED);
        contribution.setConfirmedAt(OffsetDateTime.now());
        contribution.setConfirmedBy(user);

        if (request != null && request.getNotes() != null && !request.getNotes().isBlank()) {
            String existing = contribution.getNotes() != null ? contribution.getNotes() + " | " : "";
            contribution.setNotes(existing + "Charity confirmation: " + request.getNotes());
        }

        CampaignContribution saved = contributionRepository.save(contribution);

        // Update campaign progress ONLY from CONFIRMED contributions
        int qtyToAdd = contribution.getQuantity() != null && contribution.getQuantity() > 0 ? contribution.getQuantity() : 1;
        campaignRepository.incrementCurrentQuantity(contribution.getCampaign().getId(), qtyToAdd);

        Campaign campaign = campaignRepository.findById(contribution.getCampaign().getId()).orElse(null);
        if (campaign != null && campaign.getTargetQuantity() != null && campaign.getCurrentQuantity() >= campaign.getTargetQuantity() && campaign.getStatus() == CampaignStatus.ACTIVE) {
            campaign.setStatus(CampaignStatus.COMPLETED);
            campaignRepository.save(campaign);
            log.info("Campaign {} target achieved and marked COMPLETED!", campaign.getId());
        }

        log.info("Charity {} confirmed contribution {} for campaign {}", userEmail, contributionId, contribution.getCampaign().getId());
        return CampaignContributionResponse.fromEntity(saved);
    }

    /**
     * Receiving charity records field distribution with proof/evidence.
     * Updates status to DISTRIBUTED.
     */
    @Transactional
    public CampaignContributionResponse recordDistribution(String userEmail, UUID contributionId, ContributionDistributeRequest request) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userEmail));

        CampaignContribution contribution = contributionRepository.findById(contributionId)
                .orElseThrow(() -> new ResourceNotFoundException("Contribution not found: " + contributionId));

        validateCharityOwnership(user, contribution);

        if (contribution.getStatus() != ContributionStatus.CONFIRMED) {
            throw new BadRequestException("Only confirmed contributions can be marked as distributed (current status: " + contribution.getStatus() + ")");
        }

        if (request.getEvidenceUrl() == null || request.getEvidenceUrl().isBlank()) {
            throw new BadRequestException("Distribution evidence URL (photo or document) is required.");
        }

        contribution.setStatus(ContributionStatus.DISTRIBUTED);
        contribution.setDistributionEvidenceUrl(request.getEvidenceUrl());
        contribution.setDistributionNotes(request.getNotes());
        contribution.setDistributedAt(OffsetDateTime.now());
        contribution.setDistributedBy(user);

        CampaignContribution saved = contributionRepository.save(contribution);
        log.info("Charity {} recorded distribution for contribution {} with evidence {}", userEmail, contributionId, request.getEvidenceUrl());

        return CampaignContributionResponse.fromEntity(saved);
    }

    private void validateCharityOwnership(User user, CampaignContribution contribution) {
        if (user.getRole() == Role.ADMIN) {
            return;
        }

        Campaign campaign = contribution.getCampaign();
        if (campaign.getCharity() != null && campaign.getCharity().getUser().getId().equals(user.getId())) {
            return;
        }
        if (campaign.getAnimalOrg() != null && campaign.getAnimalOrg().getUser().getId().equals(user.getId())) {
            return;
        }

        throw new ForbiddenException("You are not authorized to manage contributions for this campaign.");
    }

    private void validateAccess(User user, CampaignContribution contribution) {
        if (user.getRole() == Role.ADMIN) {
            return;
        }
        if (contribution.getContributorUser() != null && contribution.getContributorUser().getId().equals(user.getId())) {
            return;
        }
        Campaign campaign = contribution.getCampaign();
        if (campaign.getCharity() != null && campaign.getCharity().getUser().getId().equals(user.getId())) {
            return;
        }
        if (campaign.getAnimalOrg() != null && campaign.getAnimalOrg().getUser().getId().equals(user.getId())) {
            return;
        }

        throw new ForbiddenException("You do not have permission to view this contribution record.");
    }
}

package com.ecoconnect.foodbridge.dto;

import com.ecoconnect.foodbridge.model.Campaign;
import com.ecoconnect.foodbridge.model.CampaignContribution;
import com.ecoconnect.foodbridge.model.Charity;
import com.ecoconnect.foodbridge.model.enums.ContributionStatus;
import com.ecoconnect.foodbridge.model.enums.ContributionType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CampaignContributionResponse {

    private UUID id;
    private UUID campaignId;
    private String campaignTitle;
    private String campaignDistrict;

    private String charityName;
    private String charityContactPerson;
    private String charityContactEmail;
    private String charityContactPhone;

    private UUID contributorUserId;
    private String contributorName;
    private String contributorEmail;
    private String contributorPhone;

    private ContributionType contributionType;
    private Integer quantity;
    private String unit;
    private BigDecimal monetaryAmount;
    private BigDecimal foodAmountKg;
    private String itemDescription;

    private ContributionStatus status;

    private OffsetDateTime confirmedAt;
    private String confirmedByName;

    private String distributionEvidenceUrl;
    private String distributionNotes;
    private OffsetDateTime distributedAt;
    private String distributedByName;

    private String paymentInstructions;
    private String handoverInstructions;

    private String notes;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;

    public static CampaignContributionResponse fromEntity(CampaignContribution c) {
        Campaign campaign = c.getCampaign();
        Charity charity = campaign != null ? campaign.getCharity() : null;

        String chName = charity != null ? charity.getCharityName() : (campaign != null && campaign.getAnimalOrg() != null ? campaign.getAnimalOrg().getOrganizationName() : "FoodBridge Partner");
        String chContact = charity != null ? charity.getContactPerson() : (campaign != null && campaign.getAnimalOrg() != null ? campaign.getAnimalOrg().getContactPerson() : null);
        String chEmail = charity != null ? charity.getContactEmail() : (campaign != null && campaign.getAnimalOrg() != null ? campaign.getAnimalOrg().getContactEmail() : null);
        String chPhone = charity != null ? charity.getContactPhone() : (campaign != null && campaign.getAnimalOrg() != null ? campaign.getAnimalOrg().getContactPhone() : null);

        // Agreed payment and handover instructions
        String paymentInst = (campaign != null && campaign.getPaymentInstructions() != null && !campaign.getPaymentInstructions().isBlank())
                ? campaign.getPaymentInstructions()
                : (charity != null
                ? "Direct Bank Transfer to: " + charity.getCharityName() + " (Reg No: " + charity.getRegistrationNumber() + "). Please contact " + (chPhone != null ? chPhone : chEmail) + " for official receipt details."
                : "Please contact organizer for direct transfer instructions.");

        String handoverInst = (campaign != null && campaign.getHandoverInstructions() != null && !campaign.getHandoverInstructions().isBlank())
                ? campaign.getHandoverInstructions()
                : (charity != null && charity.getAddressLine1() != null
                ? "Drop-off Location: " + charity.getCharityName() + ", " + charity.getAddressLine1() + ", " + charity.getCity() + ", " + charity.getDistrict() + " District. Contact: " + chContact + " (" + chPhone + ")."
                : "Please contact organizer for drop-off coordination.");

        String confirmer = c.getConfirmedBy() != null ? c.getConfirmedBy().getFullName() : null;
        String distributor = c.getDistributedBy() != null ? c.getDistributedBy().getFullName() : null;

        return CampaignContributionResponse.builder()
                .id(c.getId())
                .campaignId(campaign != null ? campaign.getId() : null)
                .campaignTitle(campaign != null ? campaign.getTitle() : null)
                .campaignDistrict(campaign != null ? campaign.getDistrict() : null)
                .charityName(chName)
                .charityContactPerson(chContact)
                .charityContactEmail(chEmail)
                .charityContactPhone(chPhone)
                .contributorUserId(c.getContributorUser() != null ? c.getContributorUser().getId() : null)
                .contributorName(c.getContributorName())
                .contributorEmail(c.getContributorEmail())
                .contributorPhone(c.getContributorPhone())
                .contributionType(c.getContributionType())
                .quantity(c.getQuantity())
                .unit(c.getUnit() != null ? c.getUnit() : (campaign != null ? campaign.getTargetUnit() : null))
                .monetaryAmount(c.getMonetaryAmount())
                .foodAmountKg(c.getFoodAmountKg())
                .itemDescription(c.getItemDescription())
                .status(c.getStatus())
                .confirmedAt(c.getConfirmedAt())
                .confirmedByName(confirmer)
                .distributionEvidenceUrl(c.getDistributionEvidenceUrl())
                .distributionNotes(c.getDistributionNotes())
                .distributedAt(c.getDistributedAt())
                .distributedByName(distributor)
                .paymentInstructions(paymentInst)
                .handoverInstructions(handoverInst)
                .notes(c.getNotes())
                .createdAt(c.getCreatedAt())
                .updatedAt(c.getUpdatedAt())
                .build();
    }
}

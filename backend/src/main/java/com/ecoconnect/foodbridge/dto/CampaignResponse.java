package com.ecoconnect.foodbridge.dto;

import com.ecoconnect.foodbridge.model.Campaign;
import com.ecoconnect.foodbridge.model.enums.CampaignNeedType;
import com.ecoconnect.foodbridge.model.enums.CampaignOrganizerType;
import com.ecoconnect.foodbridge.model.enums.CampaignStatus;
import com.ecoconnect.foodbridge.model.enums.VerificationStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CampaignResponse {

    private UUID id;
    private CampaignOrganizerType organizerType;

    private UUID charityId;
    private String charityName;
    private String charityRegistrationNumber;
    private Boolean charityVerified;
    private String charityPhone;

    private String title;
    private String description;
    private CampaignNeedType needType;

    /**
     * Preserving privacy: only district is exposed publicly.
     */
    private String district;

    private Integer targetQuantity;
    private String targetUnit;
    private Integer currentQuantity;
    private Integer progressPercentage;

    private String coverImageUrl;
    private String evidenceUrl;
    private Integer targetBeneficiariesCount;

    private LocalDate startDate;
    private LocalDate endDate;
    private CampaignStatus status;
    private String approvalNotes;
    private OffsetDateTime approvedAt;
    private OffsetDateTime createdAt;

    public static CampaignResponse fromEntity(Campaign c) {
        UUID chId = null;
        String chName = null;
        String chReg = null;
        boolean chVer = false;
        String chPhone = null;

        if (c.getCharity() != null) {
            chId = c.getCharity().getId();
            chName = c.getCharity().getCharityName();
            chReg = c.getCharity().getRegistrationNumber();
            chVer = c.getCharity().getVerificationStatus() == VerificationStatus.VERIFIED;
            chPhone = c.getCharity().getContactPhone();
        } else if (c.getAnimalOrg() != null) {
            chId = c.getAnimalOrg().getId();
            chName = c.getAnimalOrg().getOrganizationName();
            chReg = c.getAnimalOrg().getRegistrationNumber();
            chVer = c.getAnimalOrg().getVerificationStatus() == VerificationStatus.VERIFIED;
            chPhone = c.getAnimalOrg().getContactPhone();
        }

        int target = c.getTargetQuantity() != null && c.getTargetQuantity() > 0 ? c.getTargetQuantity() : 100;
        int current = c.getCurrentQuantity() != null ? c.getCurrentQuantity() : 0;
        int pct = Math.min(100, (int) Math.round(((double) current / target) * 100));

        return CampaignResponse.builder()
                .id(c.getId())
                .organizerType(c.getOrganizerType())
                .charityId(chId)
                .charityName(chName)
                .charityRegistrationNumber(chReg)
                .charityVerified(chVer)
                .charityPhone(chPhone)
                .title(c.getTitle())
                .description(c.getDescription())
                .needType(c.getNeedType())
                .district(c.getDistrict())
                .targetQuantity(c.getTargetQuantity())
                .targetUnit(c.getTargetUnit())
                .currentQuantity(current)
                .progressPercentage(pct)
                .coverImageUrl(c.getCoverImageUrl())
                .evidenceUrl(c.getEvidenceUrl())
                .targetBeneficiariesCount(c.getTargetBeneficiariesCount())
                .startDate(c.getStartDate())
                .endDate(c.getEndDate())
                .status(c.getStatus())
                .approvalNotes(c.getApprovalNotes())
                .approvedAt(c.getApprovedAt())
                .createdAt(c.getCreatedAt())
                .build();
    }
}

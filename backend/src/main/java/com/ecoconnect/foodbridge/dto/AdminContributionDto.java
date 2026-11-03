package com.ecoconnect.foodbridge.dto;

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
public class AdminContributionDto {
    private UUID id;
    private UUID campaignId;
    private String campaignTitle;
    private String charityName;
    private UUID contributorUserId;
    private String contributorName;
    private String contributorEmail;
    private ContributionType contributionType;
    private BigDecimal monetaryAmount;
    private BigDecimal foodAmountKg;
    private String otherResourceDescription;
    private ContributionStatus status;
    private String receiptNumber;
    private OffsetDateTime createdAt;
}


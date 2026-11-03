package com.ecoconnect.foodbridge.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PartnershipRecognitionResponse {

    private UUID partnershipId;
    private UUID businessId;
    private String businessName;
    private String businessType;
    private String businessLogoUrl;
    private UUID campaignId;
    private String campaignTitle;
    private String recognitionBadge;
    private String impactSummary;
    private OffsetDateTime completedAt;
}


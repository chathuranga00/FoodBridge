package com.ecoconnect.foodbridge.dto;

import com.ecoconnect.foodbridge.model.enums.BusinessType;
import com.ecoconnect.foodbridge.model.enums.VerificationStatus;
import lombok.*;

import java.math.BigDecimal;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BusinessSummaryDto {

    private UUID id;
    private String businessName;
    private BusinessType businessType;
    private String description;
    private String logoUrl;
    private String city;
    private String district;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private Boolean isFeatured;
    private VerificationStatus verificationStatus;
    private Integer activeOffersCount;
    private Integer activeListingsCount;
    private Long completedPartnershipsCount;
    private Double totalKgRescued;
}


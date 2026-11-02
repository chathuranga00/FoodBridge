package com.ecoconnect.foodbridge.dto;

import com.ecoconnect.foodbridge.model.enums.VerificationStatus;
import lombok.*;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PendingVerificationSummaryDto {

    private UUID id;
    private String organizationType; // "BUSINESS" or "CHARITY"
    private String name;
    private String category; // "RESTAURANT", "GROCERY", or "CHARITY"
    private String registrationNumber;
    private String description;
    private String operatingArea;
    private String logoUrl;
    private String documentUrl;
    private String contactPerson;
    private String contactEmail;
    private String contactPhone;
    private String addressLine1;
    private String addressLine2;
    private String city;
    private String district;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private Integer capacityPeople;
    private VerificationStatus verificationStatus;
    private OffsetDateTime submittedAt;
    private String verificationNotes;
}


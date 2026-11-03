package com.ecoconnect.foodbridge.dto;

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
public class AdminListingDto {
    private UUID id;
    private String type; // "FOOD_RESCUE" or "GROCERY_OFFER"
    private String title;
    private UUID businessId;
    private String businessName;
    private String businessType;
    private String category;
    private BigDecimal quantity;
    private String unit;
    private BigDecimal price;
    private BigDecimal originalPrice;
    private String status;
    private String suitabilityType;
    private Boolean animalSuitable;
    private OffsetDateTime expiryDate;
    private OffsetDateTime createdAt;
}


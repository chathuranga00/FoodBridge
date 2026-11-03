package com.ecoconnect.foodbridge.dto;

import com.ecoconnect.foodbridge.model.enums.SubscriptionPlan;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubscriptionPackageDto {

    private SubscriptionPlan plan;
    private String name;
    private BigDecimal priceMonthly;
    private BigDecimal priceAnnual;
    private int maxPromotions;
    private boolean hasAnalytics;
    private boolean hasFeaturedPlacement;
    private boolean hasSponsoredCampaigns;
    private String badge;
    private String description;
    private List<String> features;
}


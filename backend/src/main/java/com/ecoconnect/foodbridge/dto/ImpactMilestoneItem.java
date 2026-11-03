package com.ecoconnect.foodbridge.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ImpactMilestoneItem {
    private String id;
    private String title;
    private String type; // e.g., "FOOD_RESCUE", "GROCERY_REDEMPTION", "CAMPAIGN_COMPLETED", "RESOURCE_DISTRIBUTED"
    private String organizationName;
    private String district;
    private String description;
    private OffsetDateTime timestamp;
}

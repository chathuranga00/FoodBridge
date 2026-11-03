package com.ecoconnect.foodbridge.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrganizationImpactResponse {
    private UUID organizationId;
    private String organizationName;
    private String organizationType;
    private String verificationStatus;

    private Double foodWeightKg;
    private Long completedCollections;
    private Long groceryProductsRedeemed;
    private Long completedCampaigns;
    private Long resourcesHandled;
    private Long peopleSupported;
    private Double co2SavingsKg;
    private Long mealsProvided;
    private Long completedPartnerships;

    private List<CategoryBreakdownItem> categoryBreakdown;
    private List<MonthlyTrendItem> monthlyTrends;
    private List<ImpactMilestoneItem> recentActivities;

    private LocalDate startDate;
    private LocalDate endDate;
    private OffsetDateTime generatedAt;
}

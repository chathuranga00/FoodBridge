package com.ecoconnect.foodbridge.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ImpactSummaryResponse {
    private Double foodRescuedKg;
    private Long completedCollections;
    private Long groceryProductsRedeemed;
    private Long activeBusinesses;
    private Long completedCampaigns;
    private Long resourcesDistributed;
    private Long peopleSupported;
    private Long animalsFed;
    private Long activeVolunteers;
    private Long totalVolunteerHours;
    private Long completedVolunteerActivities;
    private Double co2SavingsKg;
    private Long mealsProvided;
    private Long districtsSupported;

    private List<CategoryBreakdownItem> categoryBreakdown;
    private List<MonthlyTrendItem> monthlyTrends;
    private List<ImpactMilestoneItem> recentMilestones;

    private LocalDate startDate;
    private LocalDate endDate;
    private OffsetDateTime generatedAt;
}


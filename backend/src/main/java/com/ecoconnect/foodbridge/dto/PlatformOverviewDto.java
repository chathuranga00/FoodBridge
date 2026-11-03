package com.ecoconnect.foodbridge.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PlatformOverviewDto {
    // User metrics
    private long totalUsers;
    private long activeUsers;
    private long suspendedUsers;
    private Map<String, Long> usersByRole;

    // Organization metrics
    private long totalBusinesses;
    private long verifiedBusinesses;
    private long totalCharities;
    private long verifiedCharities;
    private long totalAnimalOrgs;
    private long verifiedAnimalOrgs;
    private long pendingVerifications;

    // Food & Rescue listings
    private long activeFoodListings;
    private long totalFoodListings;
    private long activeGroceryOffers;
    private long totalGroceryOffers;

    // Campaigns & Community
    private long totalCampaigns;
    private long pendingCampaigns;
    private long activeCampaigns;

    // Partnerships & Contributions
    private long totalPartnerships;
    private long activePartnerships;
    private long completedPartnerships;
    private long totalContributions;
    private BigDecimal monetaryContributionsLkr;
    private BigDecimal foodContributionsKg;

    // Subscriptions & Platform Revenue (Rule 8 Segregated)
    private long totalSubscriptions;
    private long activeSubscriptions;
    private BigDecimal platformRevenueLkr;

    // Verified Impact Aggregate
    private BigDecimal totalKgFoodRescued;
    private long peopleSupported;
    private long animalsSupported;

    // Recent Audit Logs
    private List<AuditLogResponseDto> recentAuditLogs;
}


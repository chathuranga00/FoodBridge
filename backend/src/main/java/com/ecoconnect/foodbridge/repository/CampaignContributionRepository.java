package com.ecoconnect.foodbridge.repository;

import com.ecoconnect.foodbridge.model.CampaignContribution;
import com.ecoconnect.foodbridge.model.enums.ContributionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Repository
public interface CampaignContributionRepository extends JpaRepository<CampaignContribution, UUID> {

    List<CampaignContribution> findByCampaignId(UUID campaignId);

    List<CampaignContribution> findByCampaignIdAndStatus(UUID campaignId, ContributionStatus status);

    List<CampaignContribution> findByContributorUserId(UUID userId);

    @Query("SELECT COALESCE(SUM(c.monetaryAmount), 0) FROM CampaignContribution c WHERE c.campaign.id = :campaignId AND c.status = 'CONFIRMED'")
    BigDecimal sumConfirmedMonetaryByCampaignId(@Param("campaignId") UUID campaignId);

    @Query("SELECT COALESCE(SUM(c.foodAmountKg), 0) FROM CampaignContribution c WHERE c.campaign.id = :campaignId AND c.status = 'CONFIRMED'")
    BigDecimal sumConfirmedFoodKgByCampaignId(@Param("campaignId") UUID campaignId);
}


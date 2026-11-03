package com.ecoconnect.foodbridge.repository;

import com.ecoconnect.foodbridge.model.CampaignContribution;
import com.ecoconnect.foodbridge.model.enums.ContributionStatus;
import com.ecoconnect.foodbridge.model.enums.ContributionType;
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

    List<CampaignContribution> findByCampaignIdOrderByCreatedAtDesc(UUID campaignId);

    List<CampaignContribution> findByCampaignIdAndStatus(UUID campaignId, ContributionStatus status);

    List<CampaignContribution> findByStatus(ContributionStatus status);

    List<CampaignContribution> findByStatusOrderByCreatedAtDesc(ContributionStatus status);

    List<CampaignContribution> findByContributionTypeOrderByCreatedAtDesc(ContributionType type);

    List<CampaignContribution> findByStatusAndContributionTypeOrderByCreatedAtDesc(ContributionStatus status, ContributionType type);

    List<CampaignContribution> findAllByOrderByCreatedAtDesc();

    List<CampaignContribution> findByCampaignCharityIdAndStatus(UUID charityId, ContributionStatus status);

    List<CampaignContribution> findByContributorUserIdOrderByCreatedAtDesc(UUID userId);

    @Query("SELECT c FROM CampaignContribution c WHERE (c.campaign.charity IS NOT NULL AND c.campaign.charity.user.id = :userId) ORDER BY c.createdAt DESC")
    List<CampaignContribution> findByCharityUserIdOrderByCreatedAtDesc(@Param("userId") UUID userId);

    @Query("SELECT c FROM CampaignContribution c WHERE (c.campaign.charity IS NOT NULL AND c.campaign.charity.user.id = :userId) AND c.status = :status ORDER BY c.createdAt DESC")
    List<CampaignContribution> findByCharityUserIdAndStatusOrderByCreatedAtDesc(@Param("userId") UUID userId, @Param("status") ContributionStatus status);

    @Query("SELECT COALESCE(SUM(c.monetaryAmount), 0) FROM CampaignContribution c WHERE c.campaign.id = :campaignId AND c.status = 'CONFIRMED'")
    BigDecimal sumConfirmedMonetaryByCampaignId(@Param("campaignId") UUID campaignId);

    @Query("SELECT COALESCE(SUM(c.foodAmountKg), 0) FROM CampaignContribution c WHERE c.campaign.id = :campaignId AND c.status = 'CONFIRMED'")
    BigDecimal sumConfirmedFoodKgByCampaignId(@Param("campaignId") UUID campaignId);

    @Query("SELECT COALESCE(SUM(c.monetaryAmount), 0) FROM CampaignContribution c WHERE c.status = 'CONFIRMED'")
    BigDecimal sumTotalConfirmedMonetaryAmount();

    @Query("SELECT COALESCE(SUM(c.foodAmountKg), 0) FROM CampaignContribution c WHERE c.status = 'CONFIRMED'")
    BigDecimal sumTotalConfirmedFoodKg();
}

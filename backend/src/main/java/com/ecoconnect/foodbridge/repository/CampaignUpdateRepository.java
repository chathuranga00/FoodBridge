package com.ecoconnect.foodbridge.repository;

import com.ecoconnect.foodbridge.model.CampaignUpdate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CampaignUpdateRepository extends JpaRepository<CampaignUpdate, UUID> {

    List<CampaignUpdate> findByCampaignIdOrderByDistributionDateDesc(UUID campaignId);
}

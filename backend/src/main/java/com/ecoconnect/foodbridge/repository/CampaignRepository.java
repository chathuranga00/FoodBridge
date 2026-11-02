package com.ecoconnect.foodbridge.repository;

import com.ecoconnect.foodbridge.model.Campaign;
import com.ecoconnect.foodbridge.model.enums.CampaignStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CampaignRepository extends JpaRepository<Campaign, UUID> {

    List<Campaign> findByStatus(CampaignStatus status);

    List<Campaign> findByCharityId(UUID charityId);

    List<Campaign> findByAnimalOrgId(UUID animalOrgId);

    List<Campaign> findByDistrictAndStatus(String district, CampaignStatus status);

    List<Campaign> findByStatusIn(List<CampaignStatus> statuses);
}


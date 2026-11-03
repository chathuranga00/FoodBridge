package com.ecoconnect.foodbridge.repository;

import com.ecoconnect.foodbridge.model.Campaign;
import com.ecoconnect.foodbridge.model.enums.CampaignStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CampaignRepository extends JpaRepository<Campaign, UUID> {

    List<Campaign> findByStatus(CampaignStatus status);

    List<Campaign> findByStatusOrderByCreatedAtDesc(CampaignStatus status);

    List<Campaign> findByCharityId(UUID charityId);

    List<Campaign> findByCharityIdOrderByCreatedAtDesc(UUID charityId);

    List<Campaign> findByAnimalOrgId(UUID animalOrgId);

    List<Campaign> findByDistrictAndStatus(String district, CampaignStatus status);

    List<Campaign> findByStatusIn(List<CampaignStatus> statuses);

    @Query("SELECT c FROM Campaign c LEFT JOIN FETCH c.charity ch " +
           "WHERE c.status IN :statuses ORDER BY c.createdAt DESC")
    List<Campaign> findByStatusInWithCharity(@Param("statuses") List<CampaignStatus> statuses);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("UPDATE Campaign c SET c.currentQuantity = c.currentQuantity + :qty WHERE c.id = :id")
    int incrementCurrentQuantity(@Param("id") UUID id, @Param("qty") int qty);
}

package com.ecoconnect.foodbridge.repository;

import com.ecoconnect.foodbridge.model.FoodRequest;
import com.ecoconnect.foodbridge.model.enums.FoodRequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface FoodRequestRepository extends JpaRepository<FoodRequest, UUID> {

    List<FoodRequest> findByListingId(UUID listingId);

    List<FoodRequest> findByListingIdOrderByCreatedAtDesc(UUID listingId);

    List<FoodRequest> findByCharityId(UUID charityId);

    List<FoodRequest> findByCharityIdOrderByCreatedAtDesc(UUID charityId);

    List<FoodRequest> findByListingBusinessIdOrderByCreatedAtDesc(UUID businessId);

    boolean existsByListingIdAndCharityIdAndStatusIn(UUID listingId, UUID charityId, List<FoodRequestStatus> statuses);

    List<FoodRequest> findByAnimalOrgId(UUID animalOrgId);

    List<FoodRequest> findByStatus(FoodRequestStatus status);

    List<FoodRequest> findByVolunteerId(UUID volunteerId);
}


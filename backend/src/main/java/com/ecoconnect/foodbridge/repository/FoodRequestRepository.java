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

    List<FoodRequest> findByCharityId(UUID charityId);

    List<FoodRequest> findByAnimalOrgId(UUID animalOrgId);

    List<FoodRequest> findByStatus(FoodRequestStatus status);

    List<FoodRequest> findByVolunteerId(UUID volunteerId);
}


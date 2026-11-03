package com.ecoconnect.foodbridge.repository;

import com.ecoconnect.foodbridge.model.FoodListing;
import com.ecoconnect.foodbridge.model.enums.FoodListingStatus;
import com.ecoconnect.foodbridge.model.enums.FoodSuitabilityType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface FoodListingRepository extends JpaRepository<FoodListing, UUID> {

    List<FoodListing> findByBusinessId(UUID businessId);

    List<FoodListing> findByBusinessIdOrderByCreatedAtDesc(UUID businessId);

    List<FoodListing> findByStatus(FoodListingStatus status);

    List<FoodListing> findByStatusOrderByCreatedAtDesc(FoodListingStatus status);

    List<FoodListing> findAllByOrderByCreatedAtDesc();

    List<FoodListing> findBySuitabilityTypeAndStatus(FoodSuitabilityType suitabilityType, FoodListingStatus status);

    List<FoodListing> findByStatusAndExpiryDateAfter(FoodListingStatus status, OffsetDateTime dateTime);

    List<FoodListing> findByBusinessIdAndStatus(UUID businessId, FoodListingStatus status);

    List<FoodListing> findByStatusAndSuitabilityTypeAndPickupEndAfterOrderByPickupEndAsc(FoodListingStatus status, FoodSuitabilityType suitabilityType, OffsetDateTime dateTime);

    List<FoodListing> findByStatusAndPickupEndBefore(FoodListingStatus status, OffsetDateTime dateTime);

    @Query("SELECT f FROM FoodListing f WHERE f.status = :status AND (f.suitabilityType = :suitabilityType OR f.animalSuitable = true) AND f.pickupEnd > :dateTime ORDER BY f.pickupEnd ASC")
    List<FoodListing> findAvailableForAnimalOrganizations(
            @Param("status") FoodListingStatus status,
            @Param("suitabilityType") FoodSuitabilityType suitabilityType,
            @Param("dateTime") OffsetDateTime dateTime);
}

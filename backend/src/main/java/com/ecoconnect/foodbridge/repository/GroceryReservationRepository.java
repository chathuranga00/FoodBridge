package com.ecoconnect.foodbridge.repository;

import com.ecoconnect.foodbridge.model.GroceryReservation;
import com.ecoconnect.foodbridge.model.enums.GroceryReservationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface GroceryReservationRepository extends JpaRepository<GroceryReservation, UUID> {

    Optional<GroceryReservation> findByRedemptionCode(String redemptionCode);

    List<GroceryReservation> findByUserIdOrderByReservedAtDesc(UUID userId);

    List<GroceryReservation> findByOfferBusinessIdOrderByReservedAtDesc(UUID businessId);

    List<GroceryReservation> findByOfferId(UUID offerId);

    List<GroceryReservation> findByStatusAndExpiresAtBefore(GroceryReservationStatus status, OffsetDateTime dateTime);
}

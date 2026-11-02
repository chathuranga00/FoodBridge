package com.ecoconnect.foodbridge.repository;

import com.ecoconnect.foodbridge.model.GroceryOffer;
import com.ecoconnect.foodbridge.model.enums.GroceryOfferStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface GroceryOfferRepository extends JpaRepository<GroceryOffer, UUID> {

    List<GroceryOffer> findByBusinessId(UUID businessId);

    List<GroceryOffer> findByStatus(GroceryOfferStatus status);

    List<GroceryOffer> findByStatusAndExpiryDateAfter(GroceryOfferStatus status, OffsetDateTime dateTime);
}


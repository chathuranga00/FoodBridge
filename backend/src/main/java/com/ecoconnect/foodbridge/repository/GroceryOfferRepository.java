package com.ecoconnect.foodbridge.repository;

import com.ecoconnect.foodbridge.model.GroceryOffer;
import com.ecoconnect.foodbridge.model.enums.GroceryOfferStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface GroceryOfferRepository extends JpaRepository<GroceryOffer, UUID> {

    List<GroceryOffer> findByBusinessId(UUID businessId);

    List<GroceryOffer> findByBusinessIdAndStatus(UUID businessId, GroceryOfferStatus status);

    List<GroceryOffer> findByBusinessIdOrderByCreatedAtDesc(UUID businessId);

    List<GroceryOffer> findByStatus(GroceryOfferStatus status);

    List<GroceryOffer> findByStatusAndExpiryDateAfter(GroceryOfferStatus status, OffsetDateTime dateTime);

    @Query("SELECT g FROM GroceryOffer g JOIN FETCH g.business b " +
           "WHERE g.status = :status AND g.expiryDate > :now AND (g.pickupEnd IS NULL OR g.pickupEnd > :now) " +
           "ORDER BY g.createdAt DESC")
    List<GroceryOffer> findActiveAvailableOffers(@Param("status") GroceryOfferStatus status,
                                                @Param("now") OffsetDateTime now);

    @Query("SELECT g FROM GroceryOffer g WHERE g.status = com.ecoconnect.foodbridge.model.enums.GroceryOfferStatus.AVAILABLE AND " +
           "((g.pickupEnd IS NOT NULL AND g.pickupEnd < :now) OR g.expiryDate < :now)")
    List<GroceryOffer> findExpiredAvailableOffers(@Param("now") OffsetDateTime now);

    /**
     * Atomically decrements availableQuantity and transitions status to SOLD_OUT if stock reaches 0.
     * Prevents race conditions and overselling.
     */
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("UPDATE GroceryOffer g SET g.availableQuantity = g.availableQuantity - :qty, " +
           "g.status = CASE WHEN (g.availableQuantity - :qty) = 0 THEN com.ecoconnect.foodbridge.model.enums.GroceryOfferStatus.SOLD_OUT ELSE g.status END " +
           "WHERE g.id = :id AND g.availableQuantity >= :qty AND g.status = com.ecoconnect.foodbridge.model.enums.GroceryOfferStatus.AVAILABLE")
    int decrementQuantityAtomic(@Param("id") UUID id, @Param("qty") int qty);

    /**
     * Atomically returns reserved quantity on cancellation or reservation expiry.
     * Sets status back to AVAILABLE if it was SOLD_OUT.
     */
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("UPDATE GroceryOffer g SET g.availableQuantity = g.availableQuantity + :qty, " +
           "g.status = com.ecoconnect.foodbridge.model.enums.GroceryOfferStatus.AVAILABLE " +
           "WHERE g.id = :id AND g.status != com.ecoconnect.foodbridge.model.enums.GroceryOfferStatus.CANCELLED")
    int incrementQuantityAtomic(@Param("id") UUID id, @Param("qty") int qty);
}

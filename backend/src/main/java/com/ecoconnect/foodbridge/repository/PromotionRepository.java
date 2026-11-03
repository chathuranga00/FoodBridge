package com.ecoconnect.foodbridge.repository;

import com.ecoconnect.foodbridge.model.Promotion;
import com.ecoconnect.foodbridge.model.enums.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PromotionRepository extends JpaRepository<Promotion, UUID> {

    List<Promotion> findByBusinessId(UUID businessId);

    List<Promotion> findByBusinessIdOrderByCreatedAtDesc(UUID businessId);

    List<Promotion> findByBusinessIdAndIsActiveTrue(UUID businessId);

    List<Promotion> findByIsActiveTrue();

    List<Promotion> findByIsActiveTrueOrderByIsFeaturedDescCreatedAtDesc();

    List<Promotion> findByIsActiveTrueAndIsFeaturedTrue();

    List<Promotion> findAllByOrderByCreatedAtDesc();

    List<Promotion> findByPaymentStatus(PaymentStatus paymentStatus);

    @Modifying
    @Query("UPDATE Promotion p SET p.viewsCount = p.viewsCount + 1 WHERE p.id = :id")
    void incrementViews(@Param("id") UUID id);

    @Modifying
    @Query("UPDATE Promotion p SET p.clicksCount = p.clicksCount + 1 WHERE p.id = :id")
    void incrementClicks(@Param("id") UUID id);

    @Modifying
    @Query("UPDATE Promotion p SET p.redemptionsCount = p.redemptionsCount + 1 WHERE p.id = :id")
    void incrementRedemptions(@Param("id") UUID id);
}



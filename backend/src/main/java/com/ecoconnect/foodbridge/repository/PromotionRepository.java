package com.ecoconnect.foodbridge.repository;

import com.ecoconnect.foodbridge.model.Promotion;
import com.ecoconnect.foodbridge.model.enums.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PromotionRepository extends JpaRepository<Promotion, UUID> {

    List<Promotion> findByBusinessId(UUID businessId);

    List<Promotion> findByIsActiveTrue();

    List<Promotion> findByPaymentStatus(PaymentStatus paymentStatus);
}


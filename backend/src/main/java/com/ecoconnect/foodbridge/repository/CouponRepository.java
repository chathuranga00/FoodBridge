package com.ecoconnect.foodbridge.repository;

import com.ecoconnect.foodbridge.model.Coupon;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CouponRepository extends JpaRepository<Coupon, UUID> {

    Optional<Coupon> findByCode(String code);

    List<Coupon> findByBusinessIdAndIsActiveTrue(UUID businessId);

    List<Coupon> findByIsActiveTrueAndValidFromBeforeAndValidUntilAfter(OffsetDateTime now1, OffsetDateTime now2);

    boolean existsByCode(String code);
}


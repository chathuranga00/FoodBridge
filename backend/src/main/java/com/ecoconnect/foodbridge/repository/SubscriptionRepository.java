package com.ecoconnect.foodbridge.repository;

import com.ecoconnect.foodbridge.model.Subscription;
import com.ecoconnect.foodbridge.model.enums.SubscriptionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SubscriptionRepository extends JpaRepository<Subscription, UUID> {

    List<Subscription> findByBusinessId(UUID businessId);

    Optional<Subscription> findFirstByBusinessIdAndStatus(UUID businessId, SubscriptionStatus status);

    List<Subscription> findByStatus(SubscriptionStatus status);
}


package com.ecoconnect.foodbridge.repository;

import com.ecoconnect.foodbridge.model.BusinessSubscription;
import com.ecoconnect.foodbridge.model.enums.SubscriptionPlan;
import com.ecoconnect.foodbridge.model.enums.SubscriptionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface BusinessSubscriptionRepository extends JpaRepository<BusinessSubscription, UUID> {

    List<BusinessSubscription> findByBusinessIdOrderByCreatedAtDesc(UUID businessId);

    Optional<BusinessSubscription> findFirstByBusinessIdAndStatusOrderByCreatedAtDesc(UUID businessId, SubscriptionStatus status);

    List<BusinessSubscription> findAllByOrderByCreatedAtDesc();

    List<BusinessSubscription> findByStatusOrderByCreatedAtDesc(SubscriptionStatus status);

    List<BusinessSubscription> findByPlanOrderByCreatedAtDesc(SubscriptionPlan plan);

    List<BusinessSubscription> findByStatusAndPlanOrderByCreatedAtDesc(SubscriptionStatus status, SubscriptionPlan plan);
}


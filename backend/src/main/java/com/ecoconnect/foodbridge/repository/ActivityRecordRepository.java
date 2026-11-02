package com.ecoconnect.foodbridge.repository;

import com.ecoconnect.foodbridge.model.ActivityRecord;
import com.ecoconnect.foodbridge.model.enums.ActivityStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ActivityRecordRepository extends JpaRepository<ActivityRecord, UUID> {

    List<ActivityRecord> findByStatus(ActivityStatus status);

    List<ActivityRecord> findByActivityType(String activityType);

    List<ActivityRecord> findByPerformedByUserId(UUID userId);

    List<ActivityRecord> findByVerifiedByUserId(UUID userId);

    List<ActivityRecord> findByRelatedListingId(UUID listingId);

    List<ActivityRecord> findByRelatedCampaignId(UUID campaignId);
}


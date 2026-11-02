package com.ecoconnect.foodbridge.model;

import com.ecoconnect.foodbridge.model.enums.ActivityStatus;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * Enforces Rule 4: Activities must be VERIFIED and COMPLETED
 * before an associated ImpactRecord can be created.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "activity_records")
public class ActivityRecord extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @NotBlank
    @Size(max = 50)
    @Column(name = "activity_type", nullable = false)
    private String activityType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "related_listing_id")
    private FoodListing relatedListing;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "related_campaign_id")
    private Campaign relatedCampaign;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "performed_by_user_id", nullable = false)
    private User performedByUser;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "verified_by_user_id")
    private User verifiedByUser;

    @NotNull
    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    private ActivityStatus status = ActivityStatus.PENDING;

    @Column(name = "completion_timestamp")
    private OffsetDateTime completionTimestamp;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;
}


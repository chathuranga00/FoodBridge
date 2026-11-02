package com.ecoconnect.foodbridge.model;

import com.ecoconnect.foodbridge.model.enums.FoodRequestStatus;
import com.ecoconnect.foodbridge.model.enums.RequesterType;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "food_requests")
public class FoodRequest extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "listing_id", nullable = false)
    private FoodListing listing;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "requester_type", nullable = false, length = 30)
    private RequesterType requesterType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "charity_id")
    private Charity charity;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "animal_org_id")
    private AnimalOrganization animalOrg;

    @NotNull
    @Column(name = "quantity_requested", nullable = false, precision = 10, scale = 2)
    private BigDecimal quantityRequested;

    @NotNull
    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    private FoodRequestStatus status = FoodRequestStatus.PENDING;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "volunteer_id")
    private User volunteer;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @Column(name = "completed_at")
    private OffsetDateTime completedAt;
}


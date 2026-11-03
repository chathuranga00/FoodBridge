package com.ecoconnect.foodbridge.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.math.BigDecimal;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "animal_feed_requirements")
public class AnimalFeedRequirement extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "animal_org_id", nullable = false)
    private AnimalOrganization animalOrg;

    @NotBlank
    @Size(max = 200)
    @Column(name = "title", nullable = false)
    private String title;

    @NotBlank
    @Size(max = 100)
    @Column(name = "animal_types", nullable = false)
    private String animalTypes;

    @NotBlank
    @Column(name = "suitable_feed_types", nullable = false, columnDefinition = "TEXT")
    private String suitableFeedTypes;

    @Column(name = "prohibited_items", columnDefinition = "TEXT")
    private String prohibitedItems;

    @Column(name = "daily_quantity_needed", precision = 10, scale = 2)
    private BigDecimal dailyQuantityNeeded;

    @Size(max = 20)
    @Column(name = "unit")
    private String unit;

    @NotBlank
    @Builder.Default
    @Column(name = "urgency", nullable = false, length = 30)
    private String urgency = "MEDIUM";

    @Column(name = "delivery_or_pickup_instructions", columnDefinition = "TEXT")
    private String deliveryOrPickupInstructions;

    @Builder.Default
    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;
}


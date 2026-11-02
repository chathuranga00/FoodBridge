package com.ecoconnect.foodbridge.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * Enforces Rule 4: Only VERIFIED, COMPLETED activities count toward impact statistics.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "impact_records")
public class ImpactRecord extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @NotNull
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "activity_record_id", unique = true, nullable = false)
    private ActivityRecord activityRecord;

    @Builder.Default
    @Column(name = "meals_rescued", nullable = false)
    private Integer mealsRescued = 0;

    @Builder.Default
    @Column(name = "food_weight_kg", nullable = false, precision = 10, scale = 2)
    private BigDecimal foodWeightKg = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = "co2_savings_kg", nullable = false, precision = 10, scale = 2)
    private BigDecimal co2SavingsKg = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = "people_fed", nullable = false)
    private Integer peopleFed = 0;

    @Builder.Default
    @Column(name = "animals_fed", nullable = false)
    private Integer animalsFed = 0;

    @Column(name = "calculated_at", nullable = false)
    private OffsetDateTime calculatedAt;
}


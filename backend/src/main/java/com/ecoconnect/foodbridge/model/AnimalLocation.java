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
@Table(name = "animal_locations")
public class AnimalLocation extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "animal_org_id")
    private AnimalOrganization animalOrg;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reported_by_user_id")
    private User reportedByUser;

    @NotBlank
    @Size(max = 200)
    @Column(name = "location_name", nullable = false)
    private String locationName;

    @NotBlank
    @Size(max = 100)
    @Column(name = "animal_type", nullable = false)
    private String animalType;

    @Column(name = "estimated_count")
    private Integer estimatedCount;

    @Size(max = 255)
    @Column(name = "feeding_routine")
    private String feedingRoutine;

    @NotNull
    @Column(name = "latitude", nullable = false, precision = 10, scale = 7)
    private BigDecimal latitude;

    @NotNull
    @Column(name = "longitude", nullable = false, precision = 10, scale = 7)
    private BigDecimal longitude;

    @NotBlank
    @Size(max = 100)
    @Column(name = "district", nullable = false)
    private String district;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @Builder.Default
    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;
}


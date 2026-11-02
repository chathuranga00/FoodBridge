package com.ecoconnect.foodbridge.model;

import com.ecoconnect.foodbridge.model.enums.FoodListingStatus;
import com.ecoconnect.foodbridge.model.enums.FoodSuitabilityType;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
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
@Table(name = "food_listings")
public class FoodListing extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "business_id", nullable = false)
    private Business business;

    @NotBlank
    @Size(max = 200)
    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Size(max = 500)
    @Column(name = "image_url")
    private String imageUrl;

    @Builder.Default
    @Column(name = "food_safety_confirmed", nullable = false)
    private Boolean foodSafetyConfirmed = false;

    @NotBlank
    @Size(max = 50)
    @Column(name = "food_category", nullable = false)
    private String foodCategory;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "suitability_type", nullable = false, length = 30)
    private FoodSuitabilityType suitabilityType;

    @NotNull
    @Column(name = "quantity", nullable = false, precision = 10, scale = 2)
    private BigDecimal quantity;

    @NotBlank
    @Size(max = 20)
    @Column(name = "unit", nullable = false)
    private String unit;

    @Builder.Default
    @Column(name = "perishable", nullable = false)
    private Boolean perishable = true;

    @Column(name = "prepared_at")
    private OffsetDateTime preparedAt;

    @NotNull
    @Column(name = "expiry_date", nullable = false)
    private OffsetDateTime expiryDate;

    @Size(max = 255)
    @Column(name = "dietary_flags")
    private String dietaryFlags;

    @Size(max = 255)
    @Column(name = "storage_instructions")
    private String storageInstructions;

    @NotNull
    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    private FoodListingStatus status = FoodListingStatus.AVAILABLE;

    @NotNull
    @Column(name = "pickup_start", nullable = false)
    private OffsetDateTime pickupStart;

    @NotNull
    @Column(name = "pickup_end", nullable = false)
    private OffsetDateTime pickupEnd;

    @NotBlank
    @Size(max = 255)
    @Column(name = "pickup_address", nullable = false)
    private String pickupAddress;

    @NotNull
    @Column(name = "latitude", nullable = false, precision = 10, scale = 7)
    private BigDecimal latitude;

    @NotNull
    @Column(name = "longitude", nullable = false, precision = 10, scale = 7)
    private BigDecimal longitude;
}


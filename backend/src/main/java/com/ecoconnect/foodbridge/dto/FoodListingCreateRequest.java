package com.ecoconnect.foodbridge.dto;

import com.ecoconnect.foodbridge.model.enums.FoodSuitabilityType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.*;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FoodListingCreateRequest {

    @NotBlank(message = "Title is required")
    private String title;

    private String description;

    @NotBlank(message = "Food category is required")
    private String foodCategory;

    @NotNull(message = "Suitability type is required (HUMAN_CONSUMPTION or ANIMAL_FEED)")
    private FoodSuitabilityType suitabilityType;

    @NotNull(message = "Quantity is required")
    @Positive(message = "Quantity must be greater than zero")
    private BigDecimal quantity;

    @NotBlank(message = "Unit is required (e.g., kg, portions, boxes)")
    private String unit;

    @Builder.Default
    private Boolean perishable = true;

    private OffsetDateTime preparedAt;

    @NotNull(message = "Expiry date is required")
    private OffsetDateTime expiryDate;

    private String dietaryFlags;
    private String storageInstructions;

    @NotNull(message = "Pickup start time is required")
    private OffsetDateTime pickupStart;

    @NotNull(message = "Pickup end time is required")
    private OffsetDateTime pickupEnd;

    @NotBlank(message = "Pickup address is required")
    private String pickupAddress;

    @NotNull(message = "Latitude is required")
    private BigDecimal latitude;

    @NotNull(message = "Longitude is required")
    private BigDecimal longitude;
}

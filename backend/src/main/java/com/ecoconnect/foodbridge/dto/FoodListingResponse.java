package com.ecoconnect.foodbridge.dto;

import com.ecoconnect.foodbridge.model.FoodListing;
import com.ecoconnect.foodbridge.model.enums.FoodListingStatus;
import com.ecoconnect.foodbridge.model.enums.FoodSuitabilityType;
import lombok.*;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FoodListingResponse {

    private UUID id;
    private UUID businessId;
    private String businessName;
    private String title;
    private String description;
    private String imageUrl;
    private Boolean foodSafetyConfirmed;
    private String foodCategory;
    private FoodSuitabilityType suitabilityType;
    private Boolean animalSuitable;
    private BigDecimal quantity;
    private String unit;
    private Boolean perishable;
    private OffsetDateTime preparedAt;
    private OffsetDateTime expiryDate;
    private String dietaryFlags;
    private String storageInstructions;
    private FoodListingStatus status;
    private OffsetDateTime pickupStart;
    private OffsetDateTime pickupEnd;
    private String pickupAddress;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private OffsetDateTime createdAt;

    public static FoodListingResponse fromEntity(FoodListing entity) {
        if (entity == null) {
            return null;
        }
        return FoodListingResponse.builder()
                .id(entity.getId())
                .businessId(entity.getBusiness().getId())
                .businessName(entity.getBusiness().getBusinessName())
                .title(entity.getTitle())
                .description(entity.getDescription())
                .imageUrl(entity.getImageUrl())
                .foodSafetyConfirmed(entity.getFoodSafetyConfirmed())
                .foodCategory(entity.getFoodCategory())
                .suitabilityType(entity.getSuitabilityType())
                .animalSuitable(entity.getAnimalSuitable())
                .quantity(entity.getQuantity())
                .unit(entity.getUnit())
                .perishable(entity.getPerishable())
                .preparedAt(entity.getPreparedAt())
                .expiryDate(entity.getExpiryDate())
                .dietaryFlags(entity.getDietaryFlags())
                .storageInstructions(entity.getStorageInstructions())
                .status(entity.getStatus())
                .pickupStart(entity.getPickupStart())
                .pickupEnd(entity.getPickupEnd())
                .pickupAddress(entity.getPickupAddress())
                .latitude(entity.getLatitude())
                .longitude(entity.getLongitude())
                .createdAt(entity.getCreatedAt())
                .build();
    }
}


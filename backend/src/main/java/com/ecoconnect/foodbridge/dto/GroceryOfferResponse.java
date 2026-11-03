package com.ecoconnect.foodbridge.dto;

import com.ecoconnect.foodbridge.model.GroceryOffer;
import com.ecoconnect.foodbridge.model.enums.GroceryOfferStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GroceryOfferResponse {

    private UUID id;
    private UUID businessId;
    private String businessName;
    private String businessCity;
    private String businessDistrict;
    private String businessAddress;
    private String businessPhone;

    private String title;
    private String description;
    private String category;
    private String imageUrl;

    private BigDecimal originalPrice;
    private BigDecimal discountedPrice;
    private Integer discountPercentage;
    private String currency;

    private Integer availableQuantity;
    private OffsetDateTime bestBeforeDate;
    private OffsetDateTime expiryDate;
    private OffsetDateTime pickupStart;
    private OffsetDateTime pickupEnd;
    private String pickupAddress;
    private Boolean safetyConfirmed;
    private GroceryOfferStatus status;
    private OffsetDateTime createdAt;

    public static GroceryOfferResponse fromEntity(GroceryOffer entity) {
        int discountPct = 0;
        if (entity.getOriginalPrice() != null && entity.getDiscountedPrice() != null
                && entity.getOriginalPrice().compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal diff = entity.getOriginalPrice().subtract(entity.getDiscountedPrice());
            discountPct = diff.multiply(BigDecimal.valueOf(100))
                    .divide(entity.getOriginalPrice(), 0, RoundingMode.HALF_UP)
                    .intValue();
        }

        String bName = null;
        String bCity = null;
        String bDistrict = null;
        String bAddress = null;
        String bPhone = null;
        UUID bId = null;

        if (entity.getBusiness() != null) {
            bId = entity.getBusiness().getId();
            bName = entity.getBusiness().getBusinessName();
            bCity = entity.getBusiness().getCity();
            bDistrict = entity.getBusiness().getDistrict();
            bAddress = entity.getBusiness().getAddressLine1();
            bPhone = entity.getBusiness().getContactPhone();
        }

        return GroceryOfferResponse.builder()
                .id(entity.getId())
                .businessId(bId)
                .businessName(bName)
                .businessCity(bCity)
                .businessDistrict(bDistrict)
                .businessAddress(bAddress)
                .businessPhone(bPhone)
                .title(entity.getTitle())
                .description(entity.getDescription())
                .category(entity.getCategory())
                .imageUrl(entity.getImageUrl())
                .originalPrice(entity.getOriginalPrice())
                .discountedPrice(entity.getDiscountedPrice())
                .discountPercentage(discountPct)
                .currency(entity.getCurrency() != null ? entity.getCurrency() : "LKR")
                .availableQuantity(entity.getAvailableQuantity())
                .bestBeforeDate(entity.getBestBeforeDate())
                .expiryDate(entity.getExpiryDate())
                .pickupStart(entity.getPickupStart())
                .pickupEnd(entity.getPickupEnd())
                .pickupAddress(entity.getPickupAddress() != null ? entity.getPickupAddress() : bAddress)
                .safetyConfirmed(entity.getSafetyConfirmed())
                .status(entity.getStatus())
                .createdAt(entity.getCreatedAt())
                .build();
    }
}

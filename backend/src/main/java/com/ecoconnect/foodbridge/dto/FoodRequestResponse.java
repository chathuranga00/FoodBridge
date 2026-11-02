package com.ecoconnect.foodbridge.dto;

import com.ecoconnect.foodbridge.model.FoodListing;
import com.ecoconnect.foodbridge.model.FoodRequest;
import com.ecoconnect.foodbridge.model.enums.FoodListingStatus;
import com.ecoconnect.foodbridge.model.enums.FoodRequestStatus;
import lombok.*;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FoodRequestResponse {

    private UUID id;
    private UUID listingId;
    private String listingTitle;
    private String listingCategory;
    private BigDecimal listingQuantity;
    private String listingUnit;
    private FoodListingStatus listingStatus;
    private String listingImageUrl;
    private String pickupAddress;
    private OffsetDateTime pickupStart;
    private OffsetDateTime pickupEnd;

    // Business details
    private UUID businessId;
    private String businessName;
    private String businessPhone;

    // Requester / Charity details
    private UUID charityId;
    private String charityName;
    private String charityRegistrationNumber;
    private String charityContactPerson;
    private String charityContactPhone;

    // Request details
    private BigDecimal quantityRequested;
    private FoodRequestStatus status;
    private String notes;
    private OffsetDateTime completedAt;
    private OffsetDateTime createdAt;

    public static FoodRequestResponse fromEntity(FoodRequest r) {
        if (r == null) {
            return null;
        }

        FoodListing l = r.getListing();

        return FoodRequestResponse.builder()
                .id(r.getId())
                .listingId(l != null ? l.getId() : null)
                .listingTitle(l != null ? l.getTitle() : null)
                .listingCategory(l != null ? l.getFoodCategory() : null)
                .listingQuantity(l != null ? l.getQuantity() : null)
                .listingUnit(l != null ? l.getUnit() : null)
                .listingStatus(l != null ? l.getStatus() : null)
                .listingImageUrl(l != null ? l.getImageUrl() : null)
                .pickupAddress(l != null ? l.getPickupAddress() : null)
                .pickupStart(l != null ? l.getPickupStart() : null)
                .pickupEnd(l != null ? l.getPickupEnd() : null)
                .businessId(l != null && l.getBusiness() != null ? l.getBusiness().getId() : null)
                .businessName(l != null && l.getBusiness() != null ? l.getBusiness().getBusinessName() : null)
                .businessPhone(l != null && l.getBusiness() != null ? l.getBusiness().getContactPhone() : null)
                .charityId(r.getCharity() != null ? r.getCharity().getId() : null)
                .charityName(r.getCharity() != null ? r.getCharity().getCharityName() : null)
                .charityRegistrationNumber(r.getCharity() != null ? r.getCharity().getRegistrationNumber() : null)
                .charityContactPerson(r.getCharity() != null ? r.getCharity().getContactPerson() : null)
                .charityContactPhone(r.getCharity() != null ? r.getCharity().getContactPhone() : null)
                .quantityRequested(r.getQuantityRequested())
                .status(r.getStatus())
                .notes(r.getNotes())
                .completedAt(r.getCompletedAt())
                .createdAt(r.getCreatedAt())
                .build();
    }
}


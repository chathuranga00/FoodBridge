package com.ecoconnect.foodbridge.dto;

import com.ecoconnect.foodbridge.model.GroceryReservation;
import com.ecoconnect.foodbridge.model.enums.GroceryReservationStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GroceryReservationResponse {

    private UUID id;
    private UUID offerId;
    private String offerTitle;
    private String offerCategory;
    private String offerImageUrl;

    private UUID businessId;
    private String businessName;
    private String businessAddress;
    private String businessPhone;

    private UUID userId;
    private String userName;
    private String userEmail;

    private String redemptionCode;
    private Integer quantity;
    private BigDecimal unitPrice;
    private BigDecimal totalPrice;
    private String currency;

    private GroceryReservationStatus status;
    private OffsetDateTime reservedAt;
    private OffsetDateTime redeemedAt;
    private OffsetDateTime cancelledAt;
    private OffsetDateTime expiresAt;

    private OffsetDateTime bestBeforeDate;
    private OffsetDateTime pickupStart;
    private OffsetDateTime pickupEnd;
    private String pickupAddress;

    public static GroceryReservationResponse fromEntity(GroceryReservation r) {
        String oTitle = null;
        String oCategory = null;
        String oImage = null;
        UUID oId = null;
        UUID bId = null;
        String bName = null;
        String bAddress = null;
        String bPhone = null;
        OffsetDateTime bbd = null;
        OffsetDateTime pStart = null;
        OffsetDateTime pEnd = null;
        String pAddress = null;
        String curr = "LKR";

        if (r.getOffer() != null) {
            oId = r.getOffer().getId();
            oTitle = r.getOffer().getTitle();
            oCategory = r.getOffer().getCategory();
            oImage = r.getOffer().getImageUrl();
            bbd = r.getOffer().getBestBeforeDate();
            pStart = r.getOffer().getPickupStart();
            pEnd = r.getOffer().getPickupEnd();
            pAddress = r.getOffer().getPickupAddress();
            curr = r.getOffer().getCurrency();

            if (r.getOffer().getBusiness() != null) {
                bId = r.getOffer().getBusiness().getId();
                bName = r.getOffer().getBusiness().getBusinessName();
                bAddress = r.getOffer().getBusiness().getAddressLine1();
                bPhone = r.getOffer().getBusiness().getContactPhone();
            }
        }

        String uName = null;
        String uEmail = null;
        UUID uId = null;
        if (r.getUser() != null) {
            uId = r.getUser().getId();
            uName = r.getUser().getFullName();
            uEmail = r.getUser().getEmail();
        }

        return GroceryReservationResponse.builder()
                .id(r.getId())
                .offerId(oId)
                .offerTitle(oTitle)
                .offerCategory(oCategory)
                .offerImageUrl(oImage)
                .businessId(bId)
                .businessName(bName)
                .businessAddress(bAddress)
                .businessPhone(bPhone)
                .userId(uId)
                .userName(uName)
                .userEmail(uEmail)
                .redemptionCode(r.getRedemptionCode())
                .quantity(r.getQuantity())
                .unitPrice(r.getUnitPrice())
                .totalPrice(r.getTotalPrice())
                .currency(curr != null ? curr : "LKR")
                .status(r.getStatus())
                .reservedAt(r.getReservedAt())
                .redeemedAt(r.getRedeemedAt())
                .cancelledAt(r.getCancelledAt())
                .expiresAt(r.getExpiresAt())
                .bestBeforeDate(bbd)
                .pickupStart(pStart)
                .pickupEnd(pEnd)
                .pickupAddress(pAddress != null ? pAddress : bAddress)
                .build();
    }
}

package com.ecoconnect.foodbridge.dto;

import com.ecoconnect.foodbridge.model.enums.BusinessType;
import com.ecoconnect.foodbridge.model.enums.VerificationStatus;
import lombok.*;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PublicBusinessProfileResponse {

    private UUID id;
    private String businessName;
    private BusinessType businessType;
    private String description;
    private String logoUrl;
    private String registrationNumber;
    private String contactPerson;
    private String contactEmail;
    private String contactPhone;
    private String addressLine1;
    private String addressLine2;
    private String city;
    private String district;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private VerificationStatus verificationStatus;
    private Boolean isFeatured;
    private OffsetDateTime featuredUntil;

    // Active offerings
    private List<GroceryOfferResponse> activeGroceryOffers;
    private List<FoodListingResponse> activeFoodListings;

    // Audited Community Recognitions (ONLY completed, agreed partnerships!)
    private List<PartnershipRecognitionResponse> verifiedRecognitions;
    private Long completedPartnershipsCount;

    // Verified CSR Impact Numbers
    private Double totalKgRescued;
    private Long completedCollectionsCount;

    // Active promotions & campaigns for this business
    private List<PromotionResponseDto> activePromotions;
}


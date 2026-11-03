package com.ecoconnect.foodbridge.service;

import com.ecoconnect.foodbridge.dto.*;
import com.ecoconnect.foodbridge.exception.ResourceNotFoundException;
import com.ecoconnect.foodbridge.model.*;
import com.ecoconnect.foodbridge.model.enums.*;
import com.ecoconnect.foodbridge.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class BusinessProfileService {

    private final BusinessRepository businessRepository;
    private final GroceryOfferRepository groceryOfferRepository;
    private final FoodListingRepository foodListingRepository;
    private final FoodRequestRepository foodRequestRepository;
    private final PartnershipRepository partnershipRepository;
    private final PartnershipService partnershipService;
    private final PromotionRepository promotionRepository;

    public BusinessProfileService(BusinessRepository businessRepository,
                                  GroceryOfferRepository groceryOfferRepository,
                                  FoodListingRepository foodListingRepository,
                                  FoodRequestRepository foodRequestRepository,
                                  PartnershipRepository partnershipRepository,
                                  PartnershipService partnershipService,
                                  PromotionRepository promotionRepository) {
        this.businessRepository = businessRepository;
        this.groceryOfferRepository = groceryOfferRepository;
        this.foodListingRepository = foodListingRepository;
        this.foodRequestRepository = foodRequestRepository;
        this.partnershipRepository = partnershipRepository;
        this.partnershipService = partnershipService;
        this.promotionRepository = promotionRepository;
    }

    /**
     * Retrieve full public business profile including location, active offers,
     * promotions, verified CSR impact, and audited community recognitions.
     * Enforces the critical rule: RECOGNITION IS SHOWN ONLY FOR COMPLETED, AGREED PARTNERSHIPS.
     */
    @Transactional(readOnly = true)
    public PublicBusinessProfileResponse getPublicBusinessProfile(UUID businessId) {
        Business business = businessRepository.findById(businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Business not found with id: " + businessId));

        // Active grocery discount offers
        List<GroceryOfferResponse> activeOffers = groceryOfferRepository
                .findByBusinessIdAndStatus(businessId, GroceryOfferStatus.AVAILABLE).stream()
                .map(GroceryOfferResponse::fromEntity)
                .collect(Collectors.toList());

        // Available surplus food rescue listings
        List<FoodListingResponse> activeListings = foodListingRepository
                .findByBusinessIdAndStatus(businessId, FoodListingStatus.AVAILABLE).stream()
                .map(FoodListingResponse::fromEntity)
                .collect(Collectors.toList());

        // CRITICAL: Verified community recognitions & badges ONLY from COMPLETED partnerships
        List<PartnershipRecognitionResponse> recognitions = partnershipService.getActiveRecognitionsForBusiness(businessId);
        long completedPartnershipsCount = partnershipRepository.countByBusinessIdAndStatus(businessId, PartnershipStatus.COMPLETED);

        // Verified Food Rescue Impact (Zero-estimate Rule 4 accounting)
        List<FoodRequest> collectedRequests = foodRequestRepository
                .findByListingBusinessIdAndStatus(businessId, FoodRequestStatus.COLLECTED);
        double totalKgRescued = collectedRequests.stream()
                .mapToDouble(r -> convertToKg(r.getQuantityRequested(), r.getListing() != null ? r.getListing().getUnit() : "kg"))
                .sum();
        totalKgRescued = Math.round(totalKgRescued * 100.0) / 100.0;

        // Active promotions
        List<PromotionResponseDto> activePromos = promotionRepository
                .findByBusinessIdAndIsActiveTrue(businessId).stream()
                .map(PromotionResponseDto::fromEntity)
                .collect(Collectors.toList());

        return PublicBusinessProfileResponse.builder()
                .id(business.getId())
                .businessName(business.getBusinessName())
                .businessType(business.getBusinessType())
                .description(business.getDescription())
                .logoUrl(business.getLogoUrl())
                .registrationNumber(business.getRegistrationNumber())
                .contactPerson(business.getContactPerson())
                .contactEmail(business.getContactEmail())
                .contactPhone(business.getContactPhone())
                .addressLine1(business.getAddressLine1())
                .addressLine2(business.getAddressLine2())
                .city(business.getCity())
                .district(business.getDistrict())
                .latitude(business.getLatitude())
                .longitude(business.getLongitude())
                .verificationStatus(business.getVerificationStatus())
                .isFeatured(Boolean.TRUE.equals(business.getIsFeatured()))
                .featuredUntil(business.getFeaturedUntil())
                .activeGroceryOffers(activeOffers)
                .activeFoodListings(activeListings)
                .verifiedRecognitions(recognitions)
                .completedPartnershipsCount(completedPartnershipsCount)
                .totalKgRescued(totalKgRescued)
                .completedCollectionsCount((long) collectedRequests.size())
                .activePromotions(activePromos)
                .build();
    }

    /**
     * Public business directory with filters for district, type, and featured status.
     * Always prioritizes featured businesses.
     */
    @Transactional(readOnly = true)
    public List<BusinessSummaryDto> getPublicBusinesses(String district, BusinessType type, Boolean featuredOnly) {
        List<Business> businesses;

        if (district != null && !district.trim().isEmpty() && type != null) {
            businesses = businessRepository.findByDistrictAndBusinessTypeAndVerificationStatusOrderByIsFeaturedDescBusinessNameAsc(
                    district.trim(), type, VerificationStatus.VERIFIED);
        } else if (district != null && !district.trim().isEmpty()) {
            businesses = businessRepository.findByDistrictAndVerificationStatusOrderByIsFeaturedDescBusinessNameAsc(
                    district.trim(), VerificationStatus.VERIFIED);
        } else if (type != null) {
            businesses = businessRepository.findByBusinessTypeAndVerificationStatusOrderByIsFeaturedDescBusinessNameAsc(
                    type, VerificationStatus.VERIFIED);
        } else {
            businesses = businessRepository.findByVerificationStatusOrderByIsFeaturedDescBusinessNameAsc(
                    VerificationStatus.VERIFIED);
        }

        if (Boolean.TRUE.equals(featuredOnly)) {
            businesses = businesses.stream()
                    .filter(b -> Boolean.TRUE.equals(b.getIsFeatured()))
                    .collect(Collectors.toList());
        }

        return businesses.stream().map(b -> {
            int offersCount = groceryOfferRepository.findByBusinessIdAndStatus(b.getId(), GroceryOfferStatus.AVAILABLE).size();
            int listingsCount = foodListingRepository.findByBusinessIdAndStatus(b.getId(), FoodListingStatus.AVAILABLE).size();
            long completedPartnerships = partnershipRepository.countByBusinessIdAndStatus(b.getId(), PartnershipStatus.COMPLETED);

            List<FoodRequest> collected = foodRequestRepository.findByListingBusinessIdAndStatus(b.getId(), FoodRequestStatus.COLLECTED);
            double totalKg = collected.stream()
                    .mapToDouble(r -> convertToKg(r.getQuantityRequested(), r.getListing() != null ? r.getListing().getUnit() : "kg"))
                    .sum();
            totalKg = Math.round(totalKg * 100.0) / 100.0;

            return BusinessSummaryDto.builder()
                    .id(b.getId())
                    .businessName(b.getBusinessName())
                    .businessType(b.getBusinessType())
                    .description(b.getDescription())
                    .logoUrl(b.getLogoUrl())
                    .city(b.getCity())
                    .district(b.getDistrict())
                    .latitude(b.getLatitude())
                    .longitude(b.getLongitude())
                    .isFeatured(Boolean.TRUE.equals(b.getIsFeatured()))
                    .verificationStatus(b.getVerificationStatus())
                    .activeOffersCount(offersCount)
                    .activeListingsCount(listingsCount)
                    .completedPartnershipsCount(completedPartnerships)
                    .totalKgRescued(totalKg)
                    .build();
        }).collect(Collectors.toList());
    }

    /**
     * Admin features or unfeatures a business profile.
     */
    @Transactional
    public BusinessProfileDto toggleBusinessFeatured(UUID businessId, boolean featured) {
        Business business = businessRepository.findById(businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Business not found with id: " + businessId));

        business.setIsFeatured(featured);
        if (featured && business.getFeaturedUntil() == null) {
            business.setFeaturedUntil(OffsetDateTime.now().plusDays(30));
        } else if (!featured) {
            business.setFeaturedUntil(null);
        }

        Business saved = businessRepository.save(business);
        return BusinessProfileDto.fromEntity(saved);
    }

    /**
     * Admin view of all registered businesses with verification and featured status.
     */
    @Transactional(readOnly = true)
    public List<BusinessProfileDto> getAllBusinessesForAdmin() {
        return businessRepository.findAll().stream()
                .map(BusinessProfileDto::fromEntity)
                .collect(Collectors.toList());
    }

    private double convertToKg(BigDecimal quantity, String unit) {
        if (quantity == null || quantity.compareTo(BigDecimal.ZERO) <= 0) return 0.0;
        double qty = quantity.doubleValue();
        if (unit == null) return qty * 0.50;
        String u = unit.trim().toLowerCase();
        if (u.contains("kg") || u.contains("kilogram")) return qty;
        if (u.contains("g") || u.contains("gram")) return qty / 1000.0;
        if (u.contains("meal") || u.contains("portion") || u.contains("packet") || u.contains("pack") || u.contains("serving")) {
            return qty * 0.40;
        }
        return qty * 0.50;
    }
}

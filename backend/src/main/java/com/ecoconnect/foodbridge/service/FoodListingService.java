package com.ecoconnect.foodbridge.service;

import com.ecoconnect.foodbridge.dto.FoodListingCreateRequest;
import com.ecoconnect.foodbridge.dto.FoodListingResponse;
import com.ecoconnect.foodbridge.exception.BadRequestException;
import com.ecoconnect.foodbridge.exception.ResourceNotFoundException;
import com.ecoconnect.foodbridge.model.Business;
import com.ecoconnect.foodbridge.model.FoodListing;
import com.ecoconnect.foodbridge.model.User;
import com.ecoconnect.foodbridge.model.enums.FoodListingStatus;
import com.ecoconnect.foodbridge.model.enums.FoodSuitabilityType;
import com.ecoconnect.foodbridge.repository.BusinessRepository;
import com.ecoconnect.foodbridge.repository.FoodListingRepository;
import com.ecoconnect.foodbridge.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.UUID;

@Service
public class FoodListingService {

    private static final Logger log = LoggerFactory.getLogger(FoodListingService.class);

    private final FoodListingRepository foodListingRepository;
    private final UserRepository userRepository;
    private final BusinessRepository businessRepository;
    private final VerificationGuardService verificationGuardService;

    public FoodListingService(FoodListingRepository foodListingRepository,
                              UserRepository userRepository,
                              BusinessRepository businessRepository,
                              VerificationGuardService verificationGuardService) {
        this.foodListingRepository = foodListingRepository;
        this.userRepository = userRepository;
        this.businessRepository = businessRepository;
        this.verificationGuardService = verificationGuardService;
    }

    /**
     * Creates a new food listing.
     * Enforces:
     * - Rule 2: Restaurant must be admin-VERIFIED.
     * - Rule 7: Food suitability safety guidelines.
     * - Mandatory food-safety confirmation checkbox.
     * - Valid collection window (not expired).
     */
    @Transactional
    public FoodListingResponse createListing(String userEmail, FoodListingCreateRequest request) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userEmail));

        // Rule 2 check: Must be admin-VERIFIED to publish!
        Business business = verificationGuardService.assertBusinessVerifiedForPublishing(user);

        // Required Food-Safety Confirmation
        if (!Boolean.TRUE.equals(request.getFoodSafetyConfirmed())) {
            throw new BadRequestException("You must check and confirm food-safety compliance before publishing (Rule 7).");
        }

        OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);

        // Backend validation: block expired / invalid collection windows
        if (request.getPickupEnd().isBefore(request.getPickupStart())) {
            throw new BadRequestException("Pickup end time cannot be before pickup start time");
        }

        if (request.getPickupEnd().isBefore(now)) {
            throw new BadRequestException("Collection window has already expired; pickup end must be in the future.");
        }

        if (request.getExpiryDate().isBefore(now)) {
            throw new BadRequestException("Food expiry date has already passed. Only safe, unexpired food may be listed.");
        }

        FoodListing listing = FoodListing.builder()
                .business(business)
                .title(request.getTitle())
                .description(request.getDescription())
                .imageUrl(request.getImageUrl())
                .foodSafetyConfirmed(true)
                .foodCategory(request.getFoodCategory())
                .suitabilityType(request.getSuitabilityType())
                .quantity(request.getQuantity())
                .unit(request.getUnit())
                .perishable(request.getPerishable() != null ? request.getPerishable() : true)
                .preparedAt(request.getPreparedAt())
                .expiryDate(request.getExpiryDate())
                .dietaryFlags(request.getDietaryFlags())
                .storageInstructions(request.getStorageInstructions())
                .status(FoodListingStatus.AVAILABLE)
                .pickupStart(request.getPickupStart())
                .pickupEnd(request.getPickupEnd())
                .pickupAddress(request.getPickupAddress())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .build();

        FoodListing saved = foodListingRepository.save(listing);
        return FoodListingResponse.fromEntity(saved);
    }

    /**
     * Returns active food listings belonging to the calling business.
     */
    @Transactional
    public List<FoodListingResponse> getMyListings(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userEmail));

        expirePastListings();

        return businessRepository.findByUserId(user.getId())
                .map(business -> foodListingRepository.findByBusinessIdOrderByCreatedAtDesc(business.getId())
                        .stream()
                        .map(FoodListingResponse::fromEntity)
                        .toList())
                .orElse(List.of());
    }

    /**
     * Browse available listings for verified charities.
     * Enforces:
     * - Rule 2: Charity must be admin-VERIFIED.
     * - Rule 7: Only HUMAN_CONSUMPTION listings are shown to charities.
     * - Only unexpired, AVAILABLE listings.
     */
    @Transactional
    public List<FoodListingResponse> getAvailableListingsForCharity(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userEmail));

        // Rule 2 check: Charity must be verified to browse & claim
        verificationGuardService.assertCharityVerifiedForPublishing(user);

        // Auto-expire past listings
        expirePastListings();

        OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
        return foodListingRepository.findByStatusAndSuitabilityTypeAndPickupEndAfterOrderByPickupEndAsc(
                FoodListingStatus.AVAILABLE,
                FoodSuitabilityType.HUMAN_CONSUMPTION,
                now
        ).stream()
                .map(FoodListingResponse::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public FoodListingResponse getListingById(UUID listingId) {
        FoodListing listing = foodListingRepository.findById(listingId)
                .orElseThrow(() -> new ResourceNotFoundException("Food listing not found with ID: " + listingId));
        return FoodListingResponse.fromEntity(listing);
    }

    /**
     * Auto-expires listings whose collection window has passed.
     * Runs periodically every minute and also called opportunistically on browse.
     */
    @Scheduled(fixedRate = 60000)
    @Transactional
    public int expirePastListings() {
        OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
        List<FoodListing> expiredAvailable = foodListingRepository.findByStatusAndPickupEndBefore(
                FoodListingStatus.AVAILABLE,
                now
        );

        int count = 0;
        for (FoodListing listing : expiredAvailable) {
            listing.setStatus(FoodListingStatus.EXPIRED);
            foodListingRepository.save(listing);
            count++;
        }

        if (count > 0) {
            log.info("Auto-expired {} food listings whose collection windows lapsed.", count);
        }
        return count;
    }
}

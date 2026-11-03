package com.ecoconnect.foodbridge.service;

import com.ecoconnect.foodbridge.dto.FoodRequestCreateDto;
import com.ecoconnect.foodbridge.dto.FoodRequestDecisionDto;
import com.ecoconnect.foodbridge.dto.FoodRequestResponse;
import com.ecoconnect.foodbridge.exception.BadRequestException;
import com.ecoconnect.foodbridge.exception.ResourceNotFoundException;
import com.ecoconnect.foodbridge.model.*;
import com.ecoconnect.foodbridge.model.enums.*;
import com.ecoconnect.foodbridge.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.UUID;

@Service
public class FoodRescueService {

    private static final Logger log = LoggerFactory.getLogger(FoodRescueService.class);

    private final FoodRequestRepository foodRequestRepository;
    private final FoodListingRepository foodListingRepository;
    private final UserRepository userRepository;
    private final BusinessRepository businessRepository;
    private final CharityRepository charityRepository;
    private final AnimalOrganizationRepository animalOrganizationRepository;
    private final ActivityRecordRepository activityRecordRepository;
    private final ImpactRecordRepository impactRecordRepository;
    private final VerificationGuardService verificationGuardService;
    private final EmailService emailService;
    private final FoodListingService foodListingService;

    public FoodRescueService(FoodRequestRepository foodRequestRepository,
                             FoodListingRepository foodListingRepository,
                             UserRepository userRepository,
                             BusinessRepository businessRepository,
                             CharityRepository charityRepository,
                             AnimalOrganizationRepository animalOrganizationRepository,
                             ActivityRecordRepository activityRecordRepository,
                             ImpactRecordRepository impactRecordRepository,
                             VerificationGuardService verificationGuardService,
                             EmailService emailService,
                             FoodListingService foodListingService) {
        this.foodRequestRepository = foodRequestRepository;
        this.foodListingRepository = foodListingRepository;
        this.userRepository = userRepository;
        this.businessRepository = businessRepository;
        this.charityRepository = charityRepository;
        this.animalOrganizationRepository = animalOrganizationRepository;
        this.activityRecordRepository = activityRecordRepository;
        this.impactRecordRepository = impactRecordRepository;
        this.verificationGuardService = verificationGuardService;
        this.emailService = emailService;
        this.foodListingService = foodListingService;
    }

    /**
     * Verified charities or animal organizations browse available listings and send a request.
     * Enforces Rule 7 suitability separation:
     * - Charities can ONLY request food marked for HUMAN_CONSUMPTION.
     * - Animal organizations can request food marked for ANIMAL_FEED, OR listings marked for HUMAN_CONSUMPTION that have animalSuitable = true.
     */
    @Transactional
    public FoodRequestResponse requestListing(String requesterEmail, FoodRequestCreateDto dto) {
        User user = userRepository.findByEmail(requesterEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + requesterEmail));

        // Auto-expire listings first
        foodListingService.expirePastListings();

        FoodListing listing = foodListingRepository.findById(dto.getListingId())
                .orElseThrow(() -> new ResourceNotFoundException("Food listing not found: " + dto.getListingId()));

        OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);

        // Backend validation: block expired items
        if (listing.getPickupEnd().isBefore(now) || listing.getExpiryDate().isBefore(now)) {
            listing.setStatus(FoodListingStatus.EXPIRED);
            foodListingRepository.save(listing);
            throw new BadRequestException("This food listing has already expired and cannot be requested.");
        }

        // Validate listing status
        if (listing.getStatus() != FoodListingStatus.AVAILABLE) {
            throw new BadRequestException("Listing is not available for request. Current status: " + listing.getStatus());
        }

        // Validate quantity requested
        if (dto.getQuantityRequested().compareTo(listing.getQuantity()) > 0) {
            throw new BadRequestException("Requested quantity (" + dto.getQuantityRequested() + ") exceeds available quantity (" + listing.getQuantity() + ").");
        }

        FoodRequest foodRequest;

        if (user.getRole() == Role.CHARITY) {
            // Rule 2 check: Charity must be admin-VERIFIED
            Charity charity = verificationGuardService.assertCharityVerifiedForPublishing(user);

            // Rule 7 check: Only HUMAN_CONSUMPTION for charities
            if (listing.getSuitabilityType() != FoodSuitabilityType.HUMAN_CONSUMPTION) {
                throw new BadRequestException("Charities may only request food marked for HUMAN_CONSUMPTION (Rule 7).");
            }

            // Prevent duplicate pending/accepted requests by same charity
            boolean alreadyRequested = foodRequestRepository.existsByListingIdAndCharityIdAndStatusIn(
                    listing.getId(),
                    charity.getId(),
                    List.of(FoodRequestStatus.PENDING, FoodRequestStatus.ACCEPTED)
            );
            if (alreadyRequested) {
                throw new BadRequestException("You already have an active request pending or accepted for this food listing.");
            }

            foodRequest = FoodRequest.builder()
                    .listing(listing)
                    .requesterType(RequesterType.CHARITY)
                    .charity(charity)
                    .quantityRequested(dto.getQuantityRequested())
                    .status(FoodRequestStatus.PENDING)
                    .notes(dto.getNotes())
                    .build();

            log.info("Charity [{}] requested {} {} from listing [{}]",
                    charity.getCharityName(), dto.getQuantityRequested(), listing.getUnit(), listing.getTitle());

        } else if (user.getRole() == Role.ANIMAL_ORG) {
            // Rule 2 check: Animal Org must be admin-VERIFIED
            AnimalOrganization animalOrg = verificationGuardService.assertAnimalOrgVerifiedForPublishing(user);

            // Rule 7 separation check:
            // Animal orgs can request ANIMAL_FEED, OR HUMAN_CONSUMPTION only if marked animal-suitable
            boolean isAnimalFeed = listing.getSuitabilityType() == FoodSuitabilityType.ANIMAL_FEED;
            boolean isAnimalSuitable = Boolean.TRUE.equals(listing.getAnimalSuitable());

            if (!isAnimalFeed && !isAnimalSuitable) {
                throw new BadRequestException("This listing is designated strictly for human consumption and has not been marked as animal-suitable (Rule 7).");
            }

            // Prevent duplicate pending/accepted requests by same animal org
            boolean alreadyRequested = foodRequestRepository.existsByListingIdAndAnimalOrgIdAndStatusIn(
                    listing.getId(),
                    animalOrg.getId(),
                    List.of(FoodRequestStatus.PENDING, FoodRequestStatus.ACCEPTED)
            );
            if (alreadyRequested) {
                throw new BadRequestException("You already have an active request pending or accepted for this food listing.");
            }

            foodRequest = FoodRequest.builder()
                    .listing(listing)
                    .requesterType(RequesterType.ANIMAL_ORG)
                    .animalOrg(animalOrg)
                    .quantityRequested(dto.getQuantityRequested())
                    .status(FoodRequestStatus.PENDING)
                    .notes(dto.getNotes())
                    .build();

            log.info("Animal Organization [{}] requested {} {} from listing [{}] (suitability: {}, animalSuitable: {})",
                    animalOrg.getOrganizationName(), dto.getQuantityRequested(), listing.getUnit(), listing.getTitle(),
                    listing.getSuitabilityType(), listing.getAnimalSuitable());

        } else {
            throw new BadRequestException("Only verified charities or animal organizations can request surplus food.");
        }

        FoodRequest saved = foodRequestRepository.save(foodRequest);
        return FoodRequestResponse.fromEntity(saved);
    }

    /**
     * Lists incoming requests for a restaurant's food listings.
     */
    @Transactional(readOnly = true)
    public List<FoodRequestResponse> getRequestsForRestaurant(String restaurantEmail) {
        User user = userRepository.findByEmail(restaurantEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + restaurantEmail));

        Business business = businessRepository.findByUserId(user.getId())
                .orElseThrow(() -> new BadRequestException("No business profile found for this user"));

        return foodRequestRepository.findByListingBusinessIdOrderByCreatedAtDesc(business.getId())
                .stream()
                .map(FoodRequestResponse::fromEntity)
                .toList();
    }

    /**
     * Lists outgoing requests submitted by a charity.
     */
    @Transactional(readOnly = true)
    public List<FoodRequestResponse> getRequestsForCharity(String charityEmail) {
        User user = userRepository.findByEmail(charityEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + charityEmail));

        Charity charity = charityRepository.findByUserId(user.getId())
                .orElseThrow(() -> new BadRequestException("No charity profile found for this user"));

        return foodRequestRepository.findByCharityIdOrderByCreatedAtDesc(charity.getId())
                .stream()
                .map(FoodRequestResponse::fromEntity)
                .toList();
    }

    /**
     * The restaurant approves or rejects a request;
     * on approval the listing becomes RESERVED.
     */
    @Transactional
    public FoodRequestResponse decideRequest(String restaurantEmail, UUID requestId, FoodRequestDecisionDto decisionDto) {
        User user = userRepository.findByEmail(restaurantEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + restaurantEmail));

        FoodRequest request = foodRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Food request not found: " + requestId));

        FoodListing listing = request.getListing();

        // Ensure the calling restaurant owns this listing
        if (!listing.getBusiness().getUser().getId().equals(user.getId())) {
            throw new BadRequestException("You are not authorized to decide requests for another establishment's listings.");
        }

        if (request.getStatus() != FoodRequestStatus.PENDING) {
            throw new BadRequestException("Request is not in PENDING status. Current status: " + request.getStatus());
        }

        OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
        if (listing.getPickupEnd().isBefore(now)) {
            listing.setStatus(FoodListingStatus.EXPIRED);
            foodListingRepository.save(listing);
            throw new BadRequestException("Cannot approve request; the collection window has already expired.");
        }

        String decision = decisionDto.getDecision().toUpperCase().trim();
        if ("APPROVE".equals(decision)) {
            request.setStatus(FoodRequestStatus.ACCEPTED);
            listing.setStatus(FoodListingStatus.RESERVED);
            foodListingRepository.save(listing);

            log.info("Restaurant [{}] APPROVED request [{}] for listing [{}]. Listing is now RESERVED.",
                    listing.getBusiness().getBusinessName(), request.getId(), listing.getTitle());

            // Dispatch notification & email stub to the requesting charity
            User requesterUser = request.getCharity() != null ? request.getCharity().getUser() :
                    (request.getAnimalOrg() != null ? request.getAnimalOrg().getUser() : null);
            if (requesterUser != null) {
                String pickupWindow = (listing.getPickupStart() != null && listing.getPickupEnd() != null)
                        ? listing.getPickupStart() + " to " + listing.getPickupEnd()
                        : "During scheduled business hours";
                try {
                    emailService.sendFoodRequestApprovedEmail(
                            requesterUser,
                            listing.getTitle(),
                            listing.getBusiness().getBusinessName(),
                            pickupWindow,
                            request.getId()
                    );
                } catch (Exception e) {
                    log.warn("Failed to dispatch food request approved email: {}", e.getMessage());
                }
            }

        } else if ("REJECT".equals(decision)) {
            request.setStatus(FoodRequestStatus.REJECTED);
            if (decisionDto.getReason() != null && !decisionDto.getReason().trim().isEmpty()) {
                request.setNotes((request.getNotes() != null ? request.getNotes() + " | Rejection note: " : "Rejection note: ") + decisionDto.getReason().trim());
            }

            log.info("Restaurant [{}] REJECTED request [{}] for listing [{}].",
                    listing.getBusiness().getBusinessName(), request.getId(), listing.getTitle());
        } else {
            throw new BadRequestException("Invalid decision: " + decisionDto.getDecision() + ". Must be APPROVE or REJECT.");
        }

        FoodRequest saved = foodRequestRepository.save(request);
        return FoodRequestResponse.fromEntity(saved);
    }

    /**
     * After pickup the restaurant marks COLLECTED:
     * - Request marked COLLECTED with completion timestamp.
     * - Listing marked COLLECTED.
     * - An activity_record is created (with kg quantity).
     * - An impact_record is calculated and saved (Rule 4).
     */
    @Transactional
    public FoodRequestResponse markCollected(String restaurantEmail, UUID requestId) {
        User user = userRepository.findByEmail(restaurantEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + restaurantEmail));

        FoodRequest request = foodRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Food request not found: " + requestId));

        FoodListing listing = request.getListing();

        // Authorization check
        if (!listing.getBusiness().getUser().getId().equals(user.getId())) {
            throw new BadRequestException("You are not authorized to mark collection for another establishment's listings.");
        }

        if (request.getStatus() != FoodRequestStatus.ACCEPTED) {
            throw new BadRequestException("Request must be in ACCEPTED status before marking as COLLECTED. Current status: " + request.getStatus());
        }

        OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);

        // Update request & listing statuses
        request.setStatus(FoodRequestStatus.COLLECTED);
        request.setCompletedAt(now);
        foodRequestRepository.save(request);

        listing.setStatus(FoodListingStatus.COLLECTED);
        foodListingRepository.save(listing);

        // Calculate quantity in kilograms
        BigDecimal quantityKg = convertToKg(request.getQuantityRequested(), listing.getUnit());

        // Create ActivityRecord (Rule 4)
        User verifiedBy = request.getCharity() != null ? request.getCharity().getUser() :
                (request.getAnimalOrg() != null ? request.getAnimalOrg().getUser() : null);

        String beneficiaryName = request.getCharity() != null ? request.getCharity().getCharityName() :
                (request.getAnimalOrg() != null ? request.getAnimalOrg().getOrganizationName() : "Beneficiary");

        ActivityRecord activityRecord = ActivityRecord.builder()
                .activityType("FOOD_RESCUE")
                .relatedListing(listing)
                .performedByUser(user)
                .verifiedByUser(verifiedBy)
                .status(ActivityStatus.COMPLETED)
                .quantityKg(quantityKg)
                .completionTimestamp(now)
                .notes(String.format("Surplus food rescue completed: %.2f kg of %s claimed by %s",
                        quantityKg,
                        listing.getTitle(),
                        beneficiaryName))
                .build();

        ActivityRecord savedActivity = activityRecordRepository.save(activityRecord);

        // Calculate and create ImpactRecord (Rule 4)
        int estimatedMeals = quantityKg.divide(new BigDecimal("0.40"), 0, RoundingMode.HALF_UP).intValue();
        BigDecimal co2Savings = quantityKg.multiply(new BigDecimal("2.50")).setScale(2, RoundingMode.HALF_UP);

        boolean isAnimalOrg = request.getAnimalOrg() != null;

        ImpactRecord impactRecord = ImpactRecord.builder()
                .activityRecord(savedActivity)
                .mealsRescued(estimatedMeals)
                .foodWeightKg(quantityKg)
                .co2SavingsKg(co2Savings)
                .peopleFed(isAnimalOrg ? 0 : estimatedMeals)
                .animalsFed(isAnimalOrg ? estimatedMeals : 0)
                .calculatedAt(now)
                .build();

        impactRecordRepository.save(impactRecord);

        log.info("Marked request [{}] COLLECTED. Created ActivityRecord [{}] and ImpactRecord ({} kg, {} meals, peopleFed: {}, animalsFed: {}).",
                request.getId(), savedActivity.getId(), quantityKg, estimatedMeals,
                isAnimalOrg ? 0 : estimatedMeals, isAnimalOrg ? estimatedMeals : 0);

        return FoodRequestResponse.fromEntity(request);
    }

    /**
     * Lists outgoing requests submitted by an animal organization.
     */
    @Transactional(readOnly = true)
    public List<FoodRequestResponse> getRequestsForAnimalOrg(String animalOrgEmail) {
        User user = userRepository.findByEmail(animalOrgEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + animalOrgEmail));

        AnimalOrganization org = animalOrganizationRepository.findByUserId(user.getId())
                .orElseThrow(() -> new BadRequestException("No animal organization profile found for this user"));

        return foodRequestRepository.findByAnimalOrgIdOrderByCreatedAtDesc(org.getId())
                .stream()
                .map(FoodRequestResponse::fromEntity)
                .toList();
    }

    private BigDecimal convertToKg(BigDecimal quantity, String unit) {
        if (quantity == null) {
            return BigDecimal.ZERO;
        }
        if (unit == null) {
            return quantity;
        }

        String normalizedUnit = unit.toLowerCase().trim();
        if (normalizedUnit.contains("kg") || normalizedUnit.contains("kilogram")) {
            return quantity.setScale(2, RoundingMode.HALF_UP);
        } else if (normalizedUnit.contains("portion") || normalizedUnit.contains("meal")) {
            // Approx 0.40 kg per prepared meal portion
            return quantity.multiply(new BigDecimal("0.40")).setScale(2, RoundingMode.HALF_UP);
        } else if (normalizedUnit.contains("box") || normalizedUnit.contains("tray") || normalizedUnit.contains("pack")) {
            // Approx 2.50 kg per tray/box
            return quantity.multiply(new BigDecimal("2.50")).setScale(2, RoundingMode.HALF_UP);
        } else {
            return quantity.setScale(2, RoundingMode.HALF_UP);
        }
    }
}


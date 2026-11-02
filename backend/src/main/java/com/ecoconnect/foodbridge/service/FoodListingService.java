package com.ecoconnect.foodbridge.service;

import com.ecoconnect.foodbridge.dto.FoodListingCreateRequest;
import com.ecoconnect.foodbridge.dto.FoodListingResponse;
import com.ecoconnect.foodbridge.exception.BadRequestException;
import com.ecoconnect.foodbridge.exception.ResourceNotFoundException;
import com.ecoconnect.foodbridge.model.Business;
import com.ecoconnect.foodbridge.model.FoodListing;
import com.ecoconnect.foodbridge.model.User;
import com.ecoconnect.foodbridge.model.enums.FoodListingStatus;
import com.ecoconnect.foodbridge.repository.BusinessRepository;
import com.ecoconnect.foodbridge.repository.FoodListingRepository;
import com.ecoconnect.foodbridge.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class FoodListingService {

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

    @Transactional
    public FoodListingResponse createListing(String userEmail, FoodListingCreateRequest request) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userEmail));

        // Rule 2 check: Must be admin-VERIFIED to publish!
        Business business = verificationGuardService.assertBusinessVerifiedForPublishing(user);

        if (request.getPickupEnd().isBefore(request.getPickupStart())) {
            throw new BadRequestException("Pickup end time cannot be before pickup start time");
        }

        FoodListing listing = FoodListing.builder()
                .business(business)
                .title(request.getTitle())
                .description(request.getDescription())
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

    @Transactional(readOnly = true)
    public List<FoodListingResponse> getMyListings(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userEmail));

        return businessRepository.findByUserId(user.getId())
                .map(business -> foodListingRepository.findByBusinessId(business.getId())
                        .stream()
                        .map(FoodListingResponse::fromEntity)
                        .toList())
                .orElse(List.of());
    }
}

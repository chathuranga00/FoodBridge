package com.ecoconnect.foodbridge.service;

import com.ecoconnect.foodbridge.dto.*;
import com.ecoconnect.foodbridge.exception.BadRequestException;
import com.ecoconnect.foodbridge.exception.ResourceNotFoundException;
import com.ecoconnect.foodbridge.model.*;
import com.ecoconnect.foodbridge.model.enums.*;
import com.ecoconnect.foodbridge.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AnimalWelfareService {

    private final AnimalOrganizationRepository animalOrganizationRepository;
    private final AnimalLocationRepository animalLocationRepository;
    private final AnimalFeedRequirementRepository animalFeedRequirementRepository;
    private final FoodListingRepository foodListingRepository;
    private final UserRepository userRepository;
    private final VerificationGuardService verificationGuardService;

    // =========================================================================
    // Profile Management
    // =========================================================================

    @Transactional(readOnly = true)
    public AnimalOrgProfileDto getMyProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));

        AnimalOrganization org = animalOrganizationRepository.findByUserId(user.getId())
                .orElse(null);

        return AnimalOrgProfileDto.fromEntity(org);
    }

    @Transactional
    public AnimalOrgProfileDto updateMyProfile(String email, AnimalOrgProfileDto dto) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));

        AnimalOrganization org = animalOrganizationRepository.findByUserId(user.getId())
                .orElseGet(() -> AnimalOrganization.builder()
                        .user(user)
                        .verificationStatus(VerificationStatus.PENDING)
                        .build());

        org.setOrganizationName(dto.getOrganizationName());
        org.setRegistrationNumber(dto.getRegistrationNumber());
        org.setAnimalTypes(dto.getAnimalTypes());
        org.setShelterCapacity(dto.getShelterCapacity());
        org.setContactPerson(dto.getContactPerson());
        org.setContactEmail(dto.getContactEmail() != null ? dto.getContactEmail() : email);
        org.setContactPhone(dto.getContactPhone());
        org.setAddressLine1(dto.getAddressLine1());
        org.setAddressLine2(dto.getAddressLine2());
        org.setCity(dto.getCity());
        org.setDistrict(dto.getDistrict());
        org.setLatitude(dto.getLatitude());
        org.setLongitude(dto.getLongitude());

        AnimalOrganization saved = animalOrganizationRepository.save(org);
        log.info("Updated animal organization profile for user: {}", email);
        return AnimalOrgProfileDto.fromEntity(saved);
    }

    @Transactional(readOnly = true)
    public List<AnimalOrgProfileDto> getVerifiedAnimalOrganizations() {
        return animalOrganizationRepository.findByVerificationStatus(VerificationStatus.VERIFIED)
                .stream()
                .map(AnimalOrgProfileDto::fromEntity)
                .toList();
    }

    // =========================================================================
    // Feeding Locations Management
    // =========================================================================

    @Transactional
    public AnimalLocationDto registerFeedingLocation(String email, AnimalLocationDto dto) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));

        // Rule 2 check: Must be admin-VERIFIED animal org (or ADMIN)
        AnimalOrganization org = null;
        if (user.getRole() == Role.ANIMAL_ORG) {
            org = verificationGuardService.assertAnimalOrgVerifiedForPublishing(user);
        } else if (user.getRole() != Role.ADMIN) {
            throw new BadRequestException("Only verified animal welfare organizations can register feeding points.");
        }

        AnimalLocation location = AnimalLocation.builder()
                .animalOrg(org)
                .reportedByUser(user)
                .locationName(dto.getLocationName())
                .animalType(dto.getAnimalType())
                .estimatedCount(dto.getEstimatedCount())
                .feedingRoutine(dto.getFeedingRoutine())
                .district(dto.getDistrict())
                .city(dto.getCity())
                .addressLine(dto.getAddressLine())
                .latitude(dto.getLatitude())
                .longitude(dto.getLongitude())
                .urgencyLevel(dto.getUrgencyLevel() != null ? dto.getUrgencyLevel() : "NORMAL")
                .notes(dto.getNotes())
                .isActive(dto.getIsActive() != null ? dto.getIsActive() : true)
                .build();

        AnimalLocation saved = animalLocationRepository.save(location);
        log.info("Registered animal feeding point [{}] by user [{}]", saved.getLocationName(), email);
        return AnimalLocationDto.fromEntity(saved);
    }

    @Transactional
    public AnimalLocationDto updateFeedingLocation(String email, UUID locationId, AnimalLocationDto dto) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));

        AnimalLocation location = animalLocationRepository.findById(locationId)
                .orElseThrow(() -> new ResourceNotFoundException("Feeding location not found: " + locationId));

        if (user.getRole() != Role.ADMIN) {
            if (location.getAnimalOrg() == null || !location.getAnimalOrg().getUser().getId().equals(user.getId())) {
                throw new BadRequestException("You are not authorized to update this feeding location.");
            }
        }

        location.setLocationName(dto.getLocationName());
        location.setAnimalType(dto.getAnimalType());
        location.setEstimatedCount(dto.getEstimatedCount());
        location.setFeedingRoutine(dto.getFeedingRoutine());
        location.setDistrict(dto.getDistrict());
        if (dto.getCity() != null) location.setCity(dto.getCity());
        if (dto.getAddressLine() != null) location.setAddressLine(dto.getAddressLine());
        if (dto.getLatitude() != null) location.setLatitude(dto.getLatitude());
        if (dto.getLongitude() != null) location.setLongitude(dto.getLongitude());
        if (dto.getUrgencyLevel() != null) location.setUrgencyLevel(dto.getUrgencyLevel());
        if (dto.getNotes() != null) location.setNotes(dto.getNotes());
        if (dto.getIsActive() != null) location.setIsActive(dto.getIsActive());

        AnimalLocation saved = animalLocationRepository.save(location);
        return AnimalLocationDto.fromEntity(saved);
    }

    @Transactional
    public void deleteFeedingLocation(String email, UUID locationId) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));

        AnimalLocation location = animalLocationRepository.findById(locationId)
                .orElseThrow(() -> new ResourceNotFoundException("Feeding location not found: " + locationId));

        if (user.getRole() != Role.ADMIN) {
            if (location.getAnimalOrg() == null || !location.getAnimalOrg().getUser().getId().equals(user.getId())) {
                throw new BadRequestException("You are not authorized to delete this feeding location.");
            }
        }

        location.setIsActive(false);
        animalLocationRepository.save(location);
        log.info("Deactivated feeding location [{}] by user [{}]", locationId, email);
    }

    @Transactional(readOnly = true)
    public List<AnimalLocationDto> getMyLocations(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));

        AnimalOrganization org = animalOrganizationRepository.findByUserId(user.getId())
                .orElseThrow(() -> new BadRequestException("No animal organization profile found"));

        return animalLocationRepository.findByAnimalOrgIdOrderByCreatedAtDesc(org.getId())
                .stream()
                .map(AnimalLocationDto::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<AnimalLocationDto> getPublicFeedingLocations(String district) {
        List<AnimalLocation> list;
        if (district != null && !district.isBlank() && !"ALL".equalsIgnoreCase(district)) {
            list = animalLocationRepository.findByDistrictAndIsActiveTrue(district);
        } else {
            list = animalLocationRepository.findByIsActiveTrueOrderByCreatedAtDesc();
        }
        return list.stream().map(AnimalLocationDto::fromEntity).toList();
    }

    // =========================================================================
    // Suitable Animal-Feed Requirements Management (Rule 7)
    // =========================================================================

    @Transactional
    public AnimalFeedRequirementDto createFeedRequirement(String email, AnimalFeedRequirementDto dto) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));

        // Rule 2 check: Must be admin-VERIFIED animal org
        AnimalOrganization org = verificationGuardService.assertAnimalOrgVerifiedForPublishing(user);

        AnimalFeedRequirement requirement = AnimalFeedRequirement.builder()
                .animalOrg(org)
                .title(dto.getTitle())
                .animalTypes(dto.getAnimalTypes())
                .suitableFeedTypes(dto.getSuitableFeedTypes())
                .prohibitedItems(dto.getProhibitedItems())
                .dailyQuantityNeeded(dto.getDailyQuantityNeeded())
                .unit(dto.getUnit() != null ? dto.getUnit() : "kg")
                .urgency(dto.getUrgency() != null ? dto.getUrgency() : "MEDIUM")
                .deliveryOrPickupInstructions(dto.getDeliveryOrPickupInstructions())
                .isActive(dto.getIsActive() != null ? dto.getIsActive() : true)
                .build();

        AnimalFeedRequirement saved = animalFeedRequirementRepository.save(requirement);
        log.info("Published animal feed requirement [{}] by org [{}]", saved.getTitle(), org.getOrganizationName());
        return AnimalFeedRequirementDto.fromEntity(saved);
    }

    @Transactional
    public AnimalFeedRequirementDto updateFeedRequirement(String email, UUID id, AnimalFeedRequirementDto dto) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));

        AnimalFeedRequirement requirement = animalFeedRequirementRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Feed requirement not found: " + id));

        if (user.getRole() != Role.ADMIN) {
            if (!requirement.getAnimalOrg().getUser().getId().equals(user.getId())) {
                throw new BadRequestException("You are not authorized to update this requirement.");
            }
        }

        requirement.setTitle(dto.getTitle());
        requirement.setAnimalTypes(dto.getAnimalTypes());
        requirement.setSuitableFeedTypes(dto.getSuitableFeedTypes());
        requirement.setProhibitedItems(dto.getProhibitedItems());
        requirement.setDailyQuantityNeeded(dto.getDailyQuantityNeeded());
        if (dto.getUnit() != null) requirement.setUnit(dto.getUnit());
        if (dto.getUrgency() != null) requirement.setUrgency(dto.getUrgency());
        if (dto.getDeliveryOrPickupInstructions() != null) requirement.setDeliveryOrPickupInstructions(dto.getDeliveryOrPickupInstructions());
        if (dto.getIsActive() != null) requirement.setIsActive(dto.getIsActive());

        AnimalFeedRequirement saved = animalFeedRequirementRepository.save(requirement);
        return AnimalFeedRequirementDto.fromEntity(saved);
    }

    @Transactional
    public void deleteFeedRequirement(String email, UUID id) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));

        AnimalFeedRequirement requirement = animalFeedRequirementRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Feed requirement not found: " + id));

        if (user.getRole() != Role.ADMIN) {
            if (!requirement.getAnimalOrg().getUser().getId().equals(user.getId())) {
                throw new BadRequestException("You are not authorized to delete this requirement.");
            }
        }

        requirement.setIsActive(false);
        animalFeedRequirementRepository.save(requirement);
        log.info("Deactivated feed requirement [{}] by user [{}]", id, email);
    }

    @Transactional(readOnly = true)
    public List<AnimalFeedRequirementDto> getMyFeedRequirements(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));

        AnimalOrganization org = animalOrganizationRepository.findByUserId(user.getId())
                .orElseThrow(() -> new BadRequestException("No animal organization profile found"));

        return animalFeedRequirementRepository.findByAnimalOrgIdOrderByCreatedAtDesc(org.getId())
                .stream()
                .map(AnimalFeedRequirementDto::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<AnimalFeedRequirementDto> getPublicFeedRequirements(String district) {
        List<AnimalFeedRequirement> list;
        if (district != null && !district.isBlank() && !"ALL".equalsIgnoreCase(district)) {
            list = animalFeedRequirementRepository.findByAnimalOrgDistrictAndIsActiveTrueOrderByCreatedAtDesc(district);
        } else {
            list = animalFeedRequirementRepository.findByIsActiveTrueOrderByCreatedAtDesc();
        }
        return list.stream().map(AnimalFeedRequirementDto::fromEntity).toList();
    }

    // =========================================================================
    // Available Surplus Food & Animal Feed Listings (Rule 7 Separation)
    // =========================================================================

    @Transactional(readOnly = true)
    public List<FoodListingResponse> getAvailableAnimalFeedListings() {
        OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
        return foodListingRepository.findAvailableForAnimalOrganizations(
                FoodListingStatus.AVAILABLE,
                FoodSuitabilityType.ANIMAL_FEED,
                now
        ).stream().map(FoodListingResponse::fromEntity).toList();
    }
}

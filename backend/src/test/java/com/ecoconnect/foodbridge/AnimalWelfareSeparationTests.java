package com.ecoconnect.foodbridge;

import com.ecoconnect.foodbridge.dto.*;
import com.ecoconnect.foodbridge.model.*;
import com.ecoconnect.foodbridge.model.enums.*;
import com.ecoconnect.foodbridge.repository.*;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.UUID;

import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("local")
class AnimalWelfareSeparationTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CharityRepository charityRepository;

    @Autowired
    private BusinessRepository businessRepository;

    @Autowired
    private AnimalOrganizationRepository animalOrgRepository;

    @Autowired
    private AnimalLocationRepository animalLocationRepository;

    @Autowired
    private AnimalFeedRequirementRepository animalFeedRequirementRepository;

    @Autowired
    private FoodListingRepository foodListingRepository;

    @Autowired
    private FoodRequestRepository foodRequestRepository;

    @Autowired
    private ActivityRecordRepository activityRecordRepository;

    @Autowired
    private ImpactRecordRepository impactRecordRepository;

    private String getAuthToken(String email, String password, Role role) throws Exception {
        RegisterRequest register = RegisterRequest.builder()
                .email(email)
                .password(password)
                .fullName("Test " + role.name())
                .phoneNumber("+9477" + (Math.abs(email.hashCode()) % 10000000))
                .role(role)
                .build();

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(register)));

        LoginRequest login = LoginRequest.builder()
                .email(email)
                .password(password)
                .build();

        MvcResult result = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(login)))
                .andExpect(status().isOk())
                .andReturn();

        JsonNode root = objectMapper.readTree(result.getResponse().getContentAsString());
        return root.get("accessToken").asText();
    }

    private Business createVerifiedRestaurant(User user) {
        return businessRepository.save(Business.builder()
                .user(user)
                .businessName("Galle Face Kitchens " + UUID.randomUUID().toString().substring(0, 5))
                .registrationNumber("BR-" + UUID.randomUUID().toString().substring(0, 8))
                .businessType(BusinessType.RESTAURANT)
                .district("Colombo")
                .city("Colombo 03")
                .addressLine1("12 Galle Road")
                .latitude(new BigDecimal("6.9271"))
                .longitude(new BigDecimal("79.8612"))
                .verificationStatus(VerificationStatus.VERIFIED)
                .contactPhone("+94112345678")
                .build());
    }

    private Charity createVerifiedCharity(User user) {
        return charityRepository.save(Charity.builder()
                .user(user)
                .charityName("Colombo Hope Foundation " + UUID.randomUUID().toString().substring(0, 5))
                .registrationNumber("CH-" + UUID.randomUUID().toString().substring(0, 8))
                .district("Colombo")
                .city("Colombo")
                .addressLine1("45 Ward Place")
                .latitude(new BigDecimal("6.9147"))
                .longitude(new BigDecimal("79.8732"))
                .verificationStatus(VerificationStatus.VERIFIED)
                .capacityPeople(100)
                .build());
    }

    private AnimalOrganization createAnimalOrg(User user, VerificationStatus status) {
        return animalOrgRepository.save(AnimalOrganization.builder()
                .user(user)
                .organizationName("Sri Lanka Stray Animal Care " + UUID.randomUUID().toString().substring(0, 5))
                .registrationNumber("AO-" + UUID.randomUUID().toString().substring(0, 8))
                .animalTypes("Dogs, Cats")
                .district("Colombo")
                .city("Colombo 07")
                .addressLine1("88 Horton Place")
                .latitude(new BigDecimal("6.9120"))
                .longitude(new BigDecimal("79.8700"))
                .verificationStatus(status)
                .shelterCapacity(150)
                .contactPerson("Dr. Samantha Perera")
                .contactPhone("+94112233445")
                .build());
    }

    private FoodListing createListing(Business business, String title, FoodSuitabilityType suitability, boolean animalSuitable) {
        OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
        FoodListing fl = FoodListing.builder()
                .business(business)
                .title(title)
                .description("Test surplus food listing")
                .foodCategory("Cooked Surplus")
                .suitabilityType(suitability)
                .animalSuitable(animalSuitable)
                .quantity(new BigDecimal("20.00"))
                .unit("kg")
                .status(FoodListingStatus.AVAILABLE)
                .pickupStart(now.plusHours(1))
                .pickupEnd(now.plusHours(8))
                .expiryDate(now.plusDays(1))
                .pickupAddress("12 Galle Road, Colombo")
                .latitude(new BigDecimal("6.9271"))
                .longitude(new BigDecimal("79.8612"))
                .foodSafetyConfirmed(true)
                .build();
        return foodListingRepository.save(fl);
    }

    // =========================================================================
    // Test 1: Charity CAN request listing marked HUMAN_CONSUMPTION
    // =========================================================================
    @Test
    @DisplayName("Rule 7: Charity can request human consumable surplus food")
    void testCharityCanRequestHumanFood() throws Exception {
        String restEmail = "rest_hum_" + UUID.randomUUID() + "@example.com";
        String charEmail = "char_hum_" + UUID.randomUUID() + "@example.com";
        getAuthToken(restEmail, "RestPass@2026", Role.RESTAURANT);
        String charityToken = getAuthToken(charEmail, "CharityPass@2026", Role.CHARITY);

        User restUser = userRepository.findByEmail(restEmail).orElseThrow();
        User charUser = userRepository.findByEmail(charEmail).orElseThrow();
        Business restaurant = createVerifiedRestaurant(restUser);
        createVerifiedCharity(charUser);

        FoodListing listing = createListing(restaurant, "Fresh Fried Rice & Curry", FoodSuitabilityType.HUMAN_CONSUMPTION, false);

        FoodRequestCreateDto req = FoodRequestCreateDto.builder()
                .listingId(listing.getId())
                .quantityRequested(new BigDecimal("5.00"))
                .notes("For evening meal distribution")
                .build();

        mockMvc.perform(post("/api/food-rescue/requests")
                        .header("Authorization", "Bearer " + charityToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("PENDING"))
                .andExpect(jsonPath("$.quantityRequested").value(5.0));
    }

    // =========================================================================
    // Test 2: Charity CANNOT request listing marked ANIMAL_FEED
    // =========================================================================
    @Test
    @DisplayName("Rule 7: Charity is blocked from requesting animal feed")
    void testCharityBlockedFromAnimalFeed() throws Exception {
        String restEmail = "rest_feed_" + UUID.randomUUID() + "@example.com";
        String charEmail = "char_feed_" + UUID.randomUUID() + "@example.com";
        getAuthToken(restEmail, "RestPass@2026", Role.RESTAURANT);
        String charityToken = getAuthToken(charEmail, "CharityPass@2026", Role.CHARITY);

        User restUser = userRepository.findByEmail(restEmail).orElseThrow();
        User charUser = userRepository.findByEmail(charEmail).orElseThrow();
        Business restaurant = createVerifiedRestaurant(restUser);
        createVerifiedCharity(charUser);

        FoodListing listing = createListing(restaurant, "Raw Meat Scraps & Bones", FoodSuitabilityType.ANIMAL_FEED, true);

        FoodRequestCreateDto req = FoodRequestCreateDto.builder()
                .listingId(listing.getId())
                .quantityRequested(new BigDecimal("5.00"))
                .notes("Trying to claim animal feed")
                .build();

        mockMvc.perform(post("/api/food-rescue/requests")
                        .header("Authorization", "Bearer " + charityToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("HUMAN_CONSUMPTION")));
    }

    // =========================================================================
    // Test 3: Animal Org CANNOT request HUMAN_CONSUMPTION if animalSuitable is false
    // =========================================================================
    @Test
    @DisplayName("Rule 7: Animal org blocked from human food unless marked animal-suitable")
    void testAnimalOrgBlockedFromStrictlyHumanFood() throws Exception {
        String restEmail = "rest_strict_" + UUID.randomUUID() + "@example.com";
        String animalEmail = "animal_strict_" + UUID.randomUUID() + "@example.com";
        getAuthToken(restEmail, "RestPass@2026", Role.RESTAURANT);
        String animalToken = getAuthToken(animalEmail, "AnimalPass@2026", Role.ANIMAL_ORG);

        User restUser = userRepository.findByEmail(restEmail).orElseThrow();
        User animalUser = userRepository.findByEmail(animalEmail).orElseThrow();
        Business restaurant = createVerifiedRestaurant(restUser);
        createAnimalOrg(animalUser, VerificationStatus.VERIFIED);

        // Human food NOT marked as animal-suitable (e.g. contains onions, garlic, spices)
        FoodListing listing = createListing(restaurant, "Spicy Devilled Chicken & Onions", FoodSuitabilityType.HUMAN_CONSUMPTION, false);

        FoodRequestCreateDto req = FoodRequestCreateDto.builder()
                .listingId(listing.getId())
                .quantityRequested(new BigDecimal("5.00"))
                .notes("Attempting to claim spicy human food")
                .build();

        mockMvc.perform(post("/api/food-rescue/requests")
                        .header("Authorization", "Bearer " + animalToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("designated strictly for human consumption and has not been marked as animal-suitable")));
    }

    // =========================================================================
    // Test 4: Animal Org CAN request HUMAN_CONSUMPTION if animalSuitable is true
    // =========================================================================
    @Test
    @DisplayName("Rule 7: Animal org CAN request human food when restaurant marked animalSuitable = true")
    void testAnimalOrgCanRequestAnimalSuitableHumanFood() throws Exception {
        String restEmail = "rest_safe_" + UUID.randomUUID() + "@example.com";
        String animalEmail = "animal_safe_" + UUID.randomUUID() + "@example.com";
        getAuthToken(restEmail, "RestPass@2026", Role.RESTAURANT);
        String animalToken = getAuthToken(animalEmail, "AnimalPass@2026", Role.ANIMAL_ORG);

        User restUser = userRepository.findByEmail(restEmail).orElseThrow();
        User animalUser = userRepository.findByEmail(animalEmail).orElseThrow();
        Business restaurant = createVerifiedRestaurant(restUser);
        createAnimalOrg(animalUser, VerificationStatus.VERIFIED);

        // Human surplus that restaurant confirms is mild and animal suitable (plain boiled rice & chicken broth)
        FoodListing listing = createListing(restaurant, "Plain Boiled Rice & Mild Broth", FoodSuitabilityType.HUMAN_CONSUMPTION, true);

        FoodRequestCreateDto req = FoodRequestCreateDto.builder()
                .listingId(listing.getId())
                .quantityRequested(new BigDecimal("8.00"))
                .notes("Feeding stray dogs at Viharamahadevi Park")
                .build();

        mockMvc.perform(post("/api/food-rescue/requests")
                        .header("Authorization", "Bearer " + animalToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("PENDING"))
                .andExpect(jsonPath("$.requesterType").value("ANIMAL_ORG"))
                .andExpect(jsonPath("$.quantityRequested").value(8.0));
    }

    // =========================================================================
    // Test 5: Animal Org CAN request dedicated ANIMAL_FEED
    // =========================================================================
    @Test
    @DisplayName("Rule 7: Animal org CAN request dedicated ANIMAL_FEED")
    void testAnimalOrgCanRequestAnimalFeed() throws Exception {
        String restEmail = "rest_dogfood_" + UUID.randomUUID() + "@example.com";
        String animalEmail = "animal_dogfood_" + UUID.randomUUID() + "@example.com";
        getAuthToken(restEmail, "RestPass@2026", Role.RESTAURANT);
        String animalToken = getAuthToken(animalEmail, "AnimalPass@2026", Role.ANIMAL_ORG);

        User restUser = userRepository.findByEmail(restEmail).orElseThrow();
        User animalUser = userRepository.findByEmail(animalEmail).orElseThrow();
        Business restaurant = createVerifiedRestaurant(restUser);
        createAnimalOrg(animalUser, VerificationStatus.VERIFIED);

        FoodListing listing = createListing(restaurant, "Fresh Butchery Meat Trimmings", FoodSuitabilityType.ANIMAL_FEED, false);

        FoodRequestCreateDto req = FoodRequestCreateDto.builder()
                .listingId(listing.getId())
                .quantityRequested(new BigDecimal("12.00"))
                .notes("Community dog colony feed")
                .build();

        mockMvc.perform(post("/api/food-rescue/requests")
                        .header("Authorization", "Bearer " + animalToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("PENDING"))
                .andExpect(jsonPath("$.requesterType").value("ANIMAL_ORG"))
                .andExpect(jsonPath("$.quantityRequested").value(12.0));
    }

    // =========================================================================
    // Test 6: Unverified Animal Org blocked by Rule 2
    // =========================================================================
    @Test
    @DisplayName("Rule 2: Unverified animal org cannot request food or register feeding spots")
    void testUnverifiedAnimalOrgBlocked() throws Exception {
        String restEmail = "rest_unv_" + UUID.randomUUID() + "@example.com";
        String animalEmail = "animal_unv_" + UUID.randomUUID() + "@example.com";
        getAuthToken(restEmail, "RestPass@2026", Role.RESTAURANT);
        String unverifiedToken = getAuthToken(animalEmail, "PendingPass@2026", Role.ANIMAL_ORG);

        User restUser = userRepository.findByEmail(restEmail).orElseThrow();
        User animalUser = userRepository.findByEmail(animalEmail).orElseThrow();
        Business restaurant = createVerifiedRestaurant(restUser);
        createAnimalOrg(animalUser, VerificationStatus.PENDING);

        FoodListing listing = createListing(restaurant, "Surplus Feed", FoodSuitabilityType.ANIMAL_FEED, true);

        // Attempt requesting food
        FoodRequestCreateDto req = FoodRequestCreateDto.builder()
                .listingId(listing.getId())
                .quantityRequested(new BigDecimal("5.00"))
                .notes("Unverified request")
                .build();

        mockMvc.perform(post("/api/food-rescue/requests")
                        .header("Authorization", "Bearer " + unverifiedToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("Rule 2 violation")));

        // Attempt registering feeding location
        AnimalLocationDto loc = AnimalLocationDto.builder()
                .locationName("Unauthorized Feeding Spot")
                .animalType("Dogs")
                .district("Colombo")
                .latitude(new BigDecimal("6.9271"))
                .longitude(new BigDecimal("79.8612"))
                .build();

        mockMvc.perform(post("/api/animal-welfare/locations")
                        .header("Authorization", "Bearer " + unverifiedToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loc)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("Rule 2 violation")));
    }

    // =========================================================================
    // Test 7: Feeding Location registration & Map integration
    // =========================================================================
    @Test
    @DisplayName("Explore Map & Feeding Points: Verified animal org registers feeding spot, appears on map")
    void testFeedingLocationMapIntegration() throws Exception {
        String animalEmail = "animal_map_" + UUID.randomUUID() + "@example.com";
        String animalToken = getAuthToken(animalEmail, "VerifiedPass@2026", Role.ANIMAL_ORG);

        User animalUser = userRepository.findByEmail(animalEmail).orElseThrow();
        createAnimalOrg(animalUser, VerificationStatus.VERIFIED);

        AnimalLocationDto spot = AnimalLocationDto.builder()
                .locationName("Galle Face Green Stray Pack")
                .animalType("Stray Dogs")
                .estimatedCount(35)
                .feedingRoutine("Daily 6:00 PM")
                .district("Colombo")
                .city("Colombo 03")
                .addressLine("Near Old Parliament Promenade")
                .latitude(new BigDecimal("6.9271"))
                .longitude(new BigDecimal("79.8450"))
                .urgencyLevel("HIGH")
                .notes("Pack of 35 friendly dogs, volunteers supply water and cooked rice.")
                .isActive(true)
                .build();

        // 1. Register feeding spot
        mockMvc.perform(post("/api/animal-welfare/locations")
                        .header("Authorization", "Bearer " + animalToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(spot)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.locationName").value("Galle Face Green Stray Pack"))
                .andExpect(jsonPath("$.animalType").value("Stray Dogs"))
                .andExpect(jsonPath("$.estimatedCount").value(35));

        // 2. Verify it shows up in public feeding locations
        mockMvc.perform(get("/api/animal-welfare/locations?district=Colombo"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(1))))
                .andExpect(jsonPath("$[?(@.locationName == 'Galle Face Green Stray Pack')]").exists());

        // 3. Verify it shows up on Explore Map markers with type=FEEDING_LOCATION
        mockMvc.perform(get("/api/map/explore?type=FEEDING_LOCATION&district=Colombo"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.title == 'Galle Face Green Stray Pack')]").exists())
                .andExpect(jsonPath("$[?(@.markerType == 'FEEDING_LOCATION')]").exists());
    }

    // =========================================================================
    // Test 8: Publishing Feed Requirements (Rule 7)
    // =========================================================================
    @Test
    @DisplayName("Feed Requirements: Verified animal org publishes feeding requirements")
    void testPublishFeedRequirements() throws Exception {
        String animalEmail = "animal_req_" + UUID.randomUUID() + "@example.com";
        String animalToken = getAuthToken(animalEmail, "VerifiedPass@2026", Role.ANIMAL_ORG);

        User animalUser = userRepository.findByEmail(animalEmail).orElseThrow();
        createAnimalOrg(animalUser, VerificationStatus.VERIFIED);

        AnimalFeedRequirementDto reqDto = AnimalFeedRequirementDto.builder()
                .title("Shelter Dogs Daily Cooked Meal Requirements")
                .animalTypes("Dogs")
                .suitableFeedTypes("Boiled plain rice, minced meat scraps, meat broth, canned dog food")
                .prohibitedItems("NO cooked bones, NO onions, NO spices, NO expired items")
                .dailyQuantityNeeded(new BigDecimal("40.00"))
                .unit("kg")
                .urgency("HIGH")
                .deliveryOrPickupInstructions("Drop-offs welcome between 3:00 PM and 6:00 PM daily")
                .isActive(true)
                .build();

        mockMvc.perform(post("/api/animal-welfare/requirements")
                        .header("Authorization", "Bearer " + animalToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(reqDto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.title").value("Shelter Dogs Daily Cooked Meal Requirements"))
                .andExpect(jsonPath("$.dailyQuantityNeeded").value(40.0))
                .andExpect(jsonPath("$.urgency").value("HIGH"));

        // Public retrieval
        mockMvc.perform(get("/api/animal-welfare/requirements"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.title == 'Shelter Dogs Daily Cooked Meal Requirements')]").exists());
    }

    // =========================================================================
    // Test 9: Complete Request for Animal Org records animalsFed in Impact Record
    // =========================================================================
    @Test
    @DisplayName("Impact Tracking: Completing an animal food collection credits animalsFed (not peopleFed)")
    void testAnimalOrgCollectionCreditsAnimalsFed() throws Exception {
        String restEmail = "rest_impact_" + UUID.randomUUID() + "@example.com";
        String animalEmail = "animal_impact_" + UUID.randomUUID() + "@example.com";
        String restaurantToken = getAuthToken(restEmail, "RestPass@2026", Role.RESTAURANT);
        String animalToken = getAuthToken(animalEmail, "AnimalPass@2026", Role.ANIMAL_ORG);

        User restUser = userRepository.findByEmail(restEmail).orElseThrow();
        User animalUser = userRepository.findByEmail(animalEmail).orElseThrow();
        Business restaurant = createVerifiedRestaurant(restUser);
        createAnimalOrg(animalUser, VerificationStatus.VERIFIED);

        FoodListing listing = createListing(restaurant, "Cooked Rice & Broth", FoodSuitabilityType.ANIMAL_FEED, true);

        // 1. Request
        FoodRequestCreateDto req = FoodRequestCreateDto.builder()
                .listingId(listing.getId())
                .quantityRequested(new BigDecimal("10.00"))
                .notes("Colony feeding")
                .build();

        MvcResult reqResult = mockMvc.perform(post("/api/food-rescue/requests")
                        .header("Authorization", "Bearer " + animalToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andReturn();

        UUID requestId = UUID.fromString(objectMapper.readTree(reqResult.getResponse().getContentAsString()).get("id").asText());

        // 2. Restaurant Approves
        FoodRequestDecisionDto approveDto = FoodRequestDecisionDto.builder()
                .decision("APPROVE")
                .build();

        mockMvc.perform(post("/api/food-rescue/requests/" + requestId + "/decide")
                        .header("Authorization", "Bearer " + restaurantToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(approveDto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("ACCEPTED"));

        // 3. Restaurant Marks Collected
        mockMvc.perform(post("/api/food-rescue/requests/" + requestId + "/collect")
                        .header("Authorization", "Bearer " + restaurantToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("COLLECTED"));

        // Verify Impact Record in DB
        FoodRequest completedRequest = foodRequestRepository.findById(requestId).orElseThrow();
        assertEquals(FoodRequestStatus.COLLECTED, completedRequest.getStatus());

        ActivityRecord act = activityRecordRepository.findByRelatedListingId(listing.getId()).stream()
                .findFirst()
                .orElseThrow(() -> new AssertionError("Activity record was not created for completed animal food rescue"));

        ImpactRecord impact = impactRecordRepository.findByActivityRecordId(act.getId())
                .orElseThrow(() -> new AssertionError("Impact record was not created for completed animal food rescue"));

        assertTrue(impact.getAnimalsFed() > 0, "Animals fed must be > 0");
        assertEquals(0, impact.getPeopleFed(), "People fed must be 0 for animal food rescue");
    }
}

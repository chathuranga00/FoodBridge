package com.ecoconnect.foodbridge;

import com.ecoconnect.foodbridge.dto.*;
import com.ecoconnect.foodbridge.model.ActivityRecord;
import com.ecoconnect.foodbridge.model.ImpactRecord;
import com.ecoconnect.foodbridge.model.enums.*;
import com.ecoconnect.foodbridge.repository.ActivityRecordRepository;
import com.ecoconnect.foodbridge.repository.ImpactRecordRepository;
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
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("local")
@Transactional
class FoodRescueFlowTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private ActivityRecordRepository activityRecordRepository;

    @Autowired
    private ImpactRecordRepository impactRecordRepository;

    private String getAuthToken(String email, String password, Role role) throws Exception {
        RegisterRequest register = RegisterRequest.builder()
                .email(email)
                .password(password)
                .fullName("Test " + role.name())
                .phoneNumber("+94771239999")
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

    private String getAdminToken() throws Exception {
        LoginRequest login = LoginRequest.builder()
                .email("admin@foodbridge.lk")
                .password("Admin@FoodBridge2026")
                .build();

        MvcResult result = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(login)))
                .andExpect(status().isOk())
                .andReturn();

        JsonNode root = objectMapper.readTree(result.getResponse().getContentAsString());
        return root.get("accessToken").asText();
    }

    private void verifyBusiness(String adminToken, UUID businessId) throws Exception {
        VerificationDecisionRequest decide = VerificationDecisionRequest.builder()
                .status(VerificationStatus.VERIFIED)
                .reason("Legitimate restaurant registration")
                .build();

        mockMvc.perform(post("/api/admin/verifications/BUSINESS/" + businessId + "/decide")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(decide)))
                .andExpect(status().isOk());
    }

    private void verifyCharity(String adminToken, UUID charityId) throws Exception {
        VerificationDecisionRequest decide = VerificationDecisionRequest.builder()
                .status(VerificationStatus.VERIFIED)
                .reason("Legitimate NGO registration")
                .build();

        mockMvc.perform(post("/api/admin/verifications/CHARITY/" + charityId + "/decide")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(decide)))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Restaurant creating food listing requires food-safety confirmation checkbox")
    void testCreateFoodListingRequiresFoodSafetyConfirmation() throws Exception {
        String adminToken = getAdminToken();
        String restoToken = getAuthToken("resto.safe@gmail.com", "Password123!", Role.RESTAURANT);

        BusinessProfileDto profile = BusinessProfileDto.builder()
                .businessName("Grand Safe Diner")
                .businessType(BusinessType.RESTAURANT)
                .registrationNumber("PV-SAFE-01")
                .addressLine1("10 Galle Road")
                .city("Colombo")
                .district("Colombo")
                .latitude(new BigDecimal("6.9271"))
                .longitude(new BigDecimal("79.8612"))
                .build();

        MvcResult profRes = mockMvc.perform(post("/api/profiles/business")
                        .header("Authorization", "Bearer " + restoToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(profile)))
                .andReturn();
        UUID bId = UUID.fromString(objectMapper.readTree(profRes.getResponse().getContentAsString()).get("id").asText());
        verifyBusiness(adminToken, bId);

        // Attempt creation with foodSafetyConfirmed = false
        FoodListingCreateRequest unsafeListing = FoodListingCreateRequest.builder()
                .title("Buffet Curries")
                .foodCategory("Cooked Meals")
                .suitabilityType(FoodSuitabilityType.HUMAN_CONSUMPTION)
                .quantity(new BigDecimal("15"))
                .unit("portions")
                .foodSafetyConfirmed(false) // Unconfirmed
                .pickupStart(OffsetDateTime.now(ZoneOffset.UTC).plusMinutes(30))
                .pickupEnd(OffsetDateTime.now(ZoneOffset.UTC).plusHours(2))
                .expiryDate(OffsetDateTime.now(ZoneOffset.UTC).plusHours(4))
                .pickupAddress("10 Galle Road, Colombo")
                .latitude(new BigDecimal("6.9271"))
                .longitude(new BigDecimal("79.8612"))
                .build();

        mockMvc.perform(post("/api/food-listings")
                        .header("Authorization", "Bearer " + restoToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(unsafeListing)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Backend validation blocks expired items and invalid collection windows")
    void testCreateFoodListingBlocksExpiredItems() throws Exception {
        String adminToken = getAdminToken();
        String restoToken = getAuthToken("resto.dates@gmail.com", "Password123!", Role.RESTAURANT);

        BusinessProfileDto profile = BusinessProfileDto.builder()
                .businessName("Colombo Date Bistro")
                .businessType(BusinessType.RESTAURANT)
                .registrationNumber("PV-DATE-01")
                .addressLine1("20 Union Place")
                .city("Colombo")
                .district("Colombo")
                .latitude(new BigDecimal("6.9271"))
                .longitude(new BigDecimal("79.8612"))
                .build();

        MvcResult profRes = mockMvc.perform(post("/api/profiles/business")
                        .header("Authorization", "Bearer " + restoToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(profile)))
                .andReturn();
        UUID bId = UUID.fromString(objectMapper.readTree(profRes.getResponse().getContentAsString()).get("id").asText());
        verifyBusiness(adminToken, bId);

        // Pickup end in past
        FoodListingCreateRequest expiredWindowListing = FoodListingCreateRequest.builder()
                .title("Stale Lunch Packs")
                .foodCategory("Cooked Meals")
                .suitabilityType(FoodSuitabilityType.HUMAN_CONSUMPTION)
                .quantity(new BigDecimal("10"))
                .unit("portions")
                .foodSafetyConfirmed(true)
                .pickupStart(OffsetDateTime.now(ZoneOffset.UTC).minusHours(2))
                .pickupEnd(OffsetDateTime.now(ZoneOffset.UTC).minusMinutes(10)) // Already ended
                .expiryDate(OffsetDateTime.now(ZoneOffset.UTC).plusHours(2))
                .pickupAddress("20 Union Place")
                .latitude(new BigDecimal("6.9271"))
                .longitude(new BigDecimal("79.8612"))
                .build();

        mockMvc.perform(post("/api/food-listings")
                        .header("Authorization", "Bearer " + restoToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(expiredWindowListing)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("Collection window has already expired")));
    }

    @Test
    @DisplayName("Complete Restaurant Food Rescue Status Flow: AVAILABLE -> Request PENDING -> Restaurant APPROVE (RESERVED) -> Pickup (COLLECTED) -> ActivityRecord & ImpactRecord created")
    void testCompleteFoodRescueStatusFlow() throws Exception {
        String adminToken = getAdminToken();

        // 1. Setup Verified Restaurant
        String restoToken = getAuthToken("hilton.kitchen@gmail.com", "Password123!", Role.RESTAURANT);
        BusinessProfileDto restoProfile = BusinessProfileDto.builder()
                .businessName("Hilton Colombo Dining")
                .businessType(BusinessType.RESTAURANT)
                .registrationNumber("PV-HILTON-99")
                .addressLine1("2 Sir Chittampalam A Gardiner Mawatha")
                .city("Colombo")
                .district("Colombo")
                .latitude(new BigDecimal("6.9319"))
                .longitude(new BigDecimal("79.8458"))
                .contactPhone("+94112492492")
                .build();

        MvcResult rRes = mockMvc.perform(post("/api/profiles/business")
                        .header("Authorization", "Bearer " + restoToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(restoProfile)))
                .andReturn();
        UUID bId = UUID.fromString(objectMapper.readTree(rRes.getResponse().getContentAsString()).get("id").asText());
        verifyBusiness(adminToken, bId);

        // 2. Setup Verified Charity
        String charityToken = getAuthToken("sarvodaya.food@gmail.com", "Password123!", Role.CHARITY);
        CharityProfileDto charityProfile = CharityProfileDto.builder()
                .charityName("Sarvodaya Community Relief")
                .registrationNumber("NGO-SARV-10")
                .addressLine1("98 Rawatawatte Road")
                .city("Moratuwa")
                .district("Colombo")
                .operatingArea("Colombo & Kalutara")
                .latitude(new BigDecimal("6.7731"))
                .longitude(new BigDecimal("79.8816"))
                .capacityPeople(300)
                .contactPhone("+94112655255")
                .build();

        MvcResult cRes = mockMvc.perform(post("/api/profiles/charity")
                        .header("Authorization", "Bearer " + charityToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(charityProfile)))
                .andReturn();
        UUID cId = UUID.fromString(objectMapper.readTree(cRes.getResponse().getContentAsString()).get("id").asText());
        verifyCharity(adminToken, cId);

        // 3. Restaurant creates food listing with photo, window, safety confirmation
        FoodListingCreateRequest listingReq = FoodListingCreateRequest.builder()
                .title("50 Trays Fresh Vegetable Biryani")
                .description("Packed in heat-sealed aluminium foil trays with fresh raita.")
                .imageUrl("https://foodbridge.lk/images/listings/hilton-biryani.jpg")
                .foodCategory("Cooked Meals")
                .suitabilityType(FoodSuitabilityType.HUMAN_CONSUMPTION)
                .quantity(new BigDecimal("50"))
                .unit("portions")
                .perishable(true)
                .foodSafetyConfirmed(true)
                .pickupStart(OffsetDateTime.now(ZoneOffset.UTC).plusMinutes(30))
                .pickupEnd(OffsetDateTime.now(ZoneOffset.UTC).plusHours(3))
                .expiryDate(OffsetDateTime.now(ZoneOffset.UTC).plusHours(5))
                .pickupAddress("Hilton Kitchen Dispatch, 2 Sir Chittampalam A Gardiner Mawatha")
                .latitude(new BigDecimal("6.9319"))
                .longitude(new BigDecimal("79.8458"))
                .build();

        MvcResult createListingRes = mockMvc.perform(post("/api/food-listings")
                        .header("Authorization", "Bearer " + restoToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(listingReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status", is("AVAILABLE")))
                .andExpect(jsonPath("$.imageUrl", is("https://foodbridge.lk/images/listings/hilton-biryani.jpg")))
                .andReturn();

        UUID listingId = UUID.fromString(objectMapper.readTree(createListingRes.getResponse().getContentAsString()).get("id").asText());

        // 4. Charity browses available food listings
        mockMvc.perform(get("/api/food-listings/available")
                        .header("Authorization", "Bearer " + charityToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", not(empty())))
                .andExpect(jsonPath("$[?(@.id == '" + listingId + "')].title", hasItem("50 Trays Fresh Vegetable Biryani")));

        // 5. Charity sends a request for 30 portions
        FoodRequestCreateDto reqDto = FoodRequestCreateDto.builder()
                .listingId(listingId)
                .quantityRequested(new BigDecimal("30"))
                .notes("Van will arrive at 3:30 PM with insulated food containers.")
                .build();

        MvcResult reqRes = mockMvc.perform(post("/api/food-rescue/requests")
                        .header("Authorization", "Bearer " + charityToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(reqDto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status", is("PENDING")))
                .andExpect(jsonPath("$.charityName", is("Sarvodaya Community Relief")))
                .andReturn();

        UUID requestId = UUID.fromString(objectMapper.readTree(reqRes.getResponse().getContentAsString()).get("id").asText());

        // 6. Restaurant views collection requests
        mockMvc.perform(get("/api/food-rescue/restaurant-requests")
                        .header("Authorization", "Bearer " + restoToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.id == '" + requestId + "')].status", hasItem("PENDING")));

        // 7. Restaurant approves request -> Listing becomes RESERVED
        FoodRequestDecisionDto approveDto = FoodRequestDecisionDto.builder()
                .decision("APPROVE")
                .reason("Confirmed pickup at 3:30 PM.")
                .build();

        mockMvc.perform(post("/api/food-rescue/requests/" + requestId + "/decide")
                        .header("Authorization", "Bearer " + restoToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(approveDto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("ACCEPTED")))
                .andExpect(jsonPath("$.listingStatus", is("RESERVED")));

        // Verify listing status is now RESERVED
        mockMvc.perform(get("/api/food-listings/" + listingId)
                        .header("Authorization", "Bearer " + restoToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("RESERVED")));

        // 8. Charity views "My Requests"
        mockMvc.perform(get("/api/food-rescue/charity-requests")
                        .header("Authorization", "Bearer " + charityToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.id == '" + requestId + "')].status", hasItem("ACCEPTED")));

        // 9. After pickup, restaurant marks COLLECTED
        mockMvc.perform(post("/api/food-rescue/requests/" + requestId + "/collect")
                        .header("Authorization", "Bearer " + restoToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("COLLECTED")));

        // 10. Verify listing status is now COLLECTED
        mockMvc.perform(get("/api/food-listings/" + listingId)
                        .header("Authorization", "Bearer " + restoToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("COLLECTED")));

        // 11. Verify ActivityRecord created (with kg quantity) (Rule 4)
        List<ActivityRecord> activities = activityRecordRepository.findByRelatedListingId(listingId);
        assertThat(activities).isNotEmpty();
        ActivityRecord activity = activities.get(0);
        assertThat(activity.getStatus()).isEqualTo(ActivityStatus.COMPLETED);
        assertThat(activity.getActivityType()).isEqualTo("FOOD_RESCUE");
        assertThat(activity.getQuantityKg()).isNotNull();
        // 30 portions * 0.40 kg = 12.00 kg
        assertThat(activity.getQuantityKg()).isEqualByComparingTo(new BigDecimal("12.00"));

        // 12. Verify ImpactRecord created (Rule 4)
        List<ImpactRecord> impacts = impactRecordRepository.findAll();
        boolean foundImpact = impacts.stream()
                .anyMatch(i -> i.getActivityRecord().getId().equals(activity.getId()) &&
                               i.getFoodWeightKg().compareTo(new BigDecimal("12.00")) == 0);
        assertThat(foundImpact).isTrue();
    }

    @Test
    @DisplayName("Restaurant rejection flow: Request becomes REJECTED and listing remains AVAILABLE")
    void testRestaurantRejectFlow() throws Exception {
        String adminToken = getAdminToken();

        String restoToken = getAuthToken("resto.reject@gmail.com", "Password123!", Role.RESTAURANT);
        BusinessProfileDto restoProfile = BusinessProfileDto.builder()
                .businessName("Cafe Colombo")
                .businessType(BusinessType.RESTAURANT)
                .registrationNumber("PV-REJ-01")
                .addressLine1("55 Main Street")
                .city("Colombo")
                .district("Colombo")
                .latitude(new BigDecimal("6.9271"))
                .longitude(new BigDecimal("79.8612"))
                .build();
        MvcResult rRes = mockMvc.perform(post("/api/profiles/business")
                        .header("Authorization", "Bearer " + restoToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(restoProfile)))
                .andReturn();
        UUID bId = UUID.fromString(objectMapper.readTree(rRes.getResponse().getContentAsString()).get("id").asText());
        verifyBusiness(adminToken, bId);

        String charityToken = getAuthToken("charity.reject@gmail.com", "Password123!", Role.CHARITY);
        CharityProfileDto charityProfile = CharityProfileDto.builder()
                .charityName("Community Care Center")
                .registrationNumber("NGO-REJ-01")
                .addressLine1("15 Temple Street")
                .city("Colombo")
                .district("Colombo")
                .latitude(new BigDecimal("6.9271"))
                .longitude(new BigDecimal("79.8612"))
                .build();
        MvcResult cRes = mockMvc.perform(post("/api/profiles/charity")
                        .header("Authorization", "Bearer " + charityToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(charityProfile)))
                .andReturn();
        UUID cId = UUID.fromString(objectMapper.readTree(cRes.getResponse().getContentAsString()).get("id").asText());
        verifyCharity(adminToken, cId);

        FoodListingCreateRequest listingReq = FoodListingCreateRequest.builder()
                .title("20 Sandwiches")
                .foodCategory("Bakery")
                .suitabilityType(FoodSuitabilityType.HUMAN_CONSUMPTION)
                .quantity(new BigDecimal("20"))
                .unit("portions")
                .foodSafetyConfirmed(true)
                .pickupStart(OffsetDateTime.now(ZoneOffset.UTC).plusMinutes(30))
                .pickupEnd(OffsetDateTime.now(ZoneOffset.UTC).plusHours(2))
                .expiryDate(OffsetDateTime.now(ZoneOffset.UTC).plusHours(4))
                .pickupAddress("55 Main Street")
                .latitude(new BigDecimal("6.9271"))
                .longitude(new BigDecimal("79.8612"))
                .build();

        MvcResult listRes = mockMvc.perform(post("/api/food-listings")
                        .header("Authorization", "Bearer " + restoToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(listingReq)))
                .andReturn();
        UUID listingId = UUID.fromString(objectMapper.readTree(listRes.getResponse().getContentAsString()).get("id").asText());

        FoodRequestCreateDto reqDto = FoodRequestCreateDto.builder()
                .listingId(listingId)
                .quantityRequested(new BigDecimal("10"))
                .notes("Pickup in 1 hour.")
                .build();

        MvcResult reqRes = mockMvc.perform(post("/api/food-rescue/requests")
                        .header("Authorization", "Bearer " + charityToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(reqDto)))
                .andReturn();
        UUID requestId = UUID.fromString(objectMapper.readTree(reqRes.getResponse().getContentAsString()).get("id").asText());

        // Restaurant REJECTS request
        FoodRequestDecisionDto rejectDto = FoodRequestDecisionDto.builder()
                .decision("REJECT")
                .reason("Pickup time is outside restaurant closing hours.")
                .build();

        mockMvc.perform(post("/api/food-rescue/requests/" + requestId + "/decide")
                        .header("Authorization", "Bearer " + restoToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(rejectDto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("REJECTED")));

        // Listing remains AVAILABLE
        mockMvc.perform(get("/api/food-listings/" + listingId)
                        .header("Authorization", "Bearer " + restoToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("AVAILABLE")));
    }
}

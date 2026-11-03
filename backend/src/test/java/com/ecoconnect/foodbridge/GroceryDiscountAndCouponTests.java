package com.ecoconnect.foodbridge;

import com.ecoconnect.foodbridge.dto.*;
import com.ecoconnect.foodbridge.model.enums.*;
import com.ecoconnect.foodbridge.repository.GroceryOfferRepository;
import com.ecoconnect.foodbridge.repository.GroceryReservationRepository;
import com.ecoconnect.foodbridge.service.GroceryOfferService;
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
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("local")
@Transactional
class GroceryDiscountAndCouponTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private GroceryOfferRepository groceryOfferRepository;

    @Autowired
    private GroceryReservationRepository reservationRepository;

    @Autowired
    private GroceryOfferService groceryOfferService;

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
                .reason("Legitimate grocery shop registration")
                .build();

        mockMvc.perform(post("/api/admin/verifications/BUSINESS/" + businessId + "/decide")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(decide)))
                .andExpect(status().isOk());
    }

    private BusinessProfileDto createGroceryProfile(String token, String regNo, String shopName) throws Exception {
        BusinessProfileDto profile = BusinessProfileDto.builder()
                .businessName(shopName)
                .businessType(BusinessType.GROCERY)
                .description("Quality groceries and zero-waste items")
                .registrationNumber(regNo)
                .contactPerson("Nimal Perera")
                .contactEmail("contact@" + regNo.toLowerCase() + ".lk")
                .contactPhone("+94112345678")
                .addressLine1("123 Main Street")
                .city("Colombo")
                .district("Colombo")
                .latitude(BigDecimal.valueOf(6.9271))
                .longitude(BigDecimal.valueOf(79.8612))
                .build();

        MvcResult res = mockMvc.perform(post("/api/profiles/business")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(profile)))
                .andExpect(status().isCreated())
                .andReturn();

        return objectMapper.readValue(res.getResponse().getContentAsString(), BusinessProfileDto.class);
    }

    @Test
    @DisplayName("Unverified Grocery shop is blocked from creating offers (Rule 2)")
    void unverifiedShop_cannotCreateOffer_failsRule2() throws Exception {
        String groceryToken = getAuthToken("pending.grocery@gmail.com", "GroceryPass123!", Role.GROCERY);
        createGroceryProfile(groceryToken, "PENDING-GROC-01", "Pending Supermarket");

        OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
        GroceryOfferCreateRequest offerReq = GroceryOfferCreateRequest.builder()
                .title("Organic Fresh Milk 1L")
                .description("Near best-before date pasteurized fresh milk")
                .category("Dairy")
                .originalPrice(BigDecimal.valueOf(500.00))
                .discountedPrice(BigDecimal.valueOf(250.00))
                .availableQuantity(10)
                .bestBeforeDate(now.plusDays(2))
                .pickupStart(now.plusHours(1))
                .pickupEnd(now.plusHours(8))
                .safetyConfirmed(true)
                .build();

        mockMvc.perform(post("/api/grocery/offers")
                        .header("Authorization", "Bearer " + groceryToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(offerReq)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("Rule 2 violation: Business account must be admin-VERIFIED")));
    }

    @Test
    @DisplayName("Grocery offer creation fails if food-safety and best-before compliance is not confirmed")
    void verifiedShop_failsWithoutSafetyConfirmation() throws Exception {
        String groceryToken = getAuthToken("safety.grocery@gmail.com", "GroceryPass123!", Role.GROCERY);
        BusinessProfileDto profile = createGroceryProfile(groceryToken, "SAFE-GROC-01", "Safety Supermarket");

        String adminToken = getAdminToken();
        verifyBusiness(adminToken, profile.getId());

        OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
        GroceryOfferCreateRequest offerReq = GroceryOfferCreateRequest.builder()
                .title("Artisan Sourdough Loaf")
                .description("Fresh bakery loaf")
                .category("Bakery")
                .originalPrice(BigDecimal.valueOf(600.00))
                .discountedPrice(BigDecimal.valueOf(300.00))
                .availableQuantity(5)
                .bestBeforeDate(now.plusDays(1))
                .pickupStart(now.plusHours(1))
                .pickupEnd(now.plusHours(6))
                .safetyConfirmed(false) // Not confirmed!
                .build();

        mockMvc.perform(post("/api/grocery/offers")
                        .header("Authorization", "Bearer " + groceryToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(offerReq)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Verified Grocery shop publishes offer and public browse with filters works")
    void verifiedShop_createsOffer_andPublicBrowseSucceeds() throws Exception {
        String groceryToken = getAuthToken("verified.grocery@gmail.com", "GroceryPass123!", Role.GROCERY);
        BusinessProfileDto profile = createGroceryProfile(groceryToken, "VERIFIED-GROC-01", "Colombo Green Grocer");

        String adminToken = getAdminToken();
        verifyBusiness(adminToken, profile.getId());

        OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
        GroceryOfferCreateRequest offerReq = GroceryOfferCreateRequest.builder()
                .title("Ceylon Highland Tea 500g")
                .description("Quality tea packs close to best-before date")
                .category("Beverages")
                .originalPrice(BigDecimal.valueOf(1000.00))
                .discountedPrice(BigDecimal.valueOf(500.00))
                .availableQuantity(8)
                .bestBeforeDate(now.plusDays(10))
                .pickupStart(now.plusHours(1))
                .pickupEnd(now.plusDays(2))
                .safetyConfirmed(true)
                .build();

        MvcResult createRes = mockMvc.perform(post("/api/grocery/offers")
                        .header("Authorization", "Bearer " + groceryToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(offerReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.title", is("Ceylon Highland Tea 500g")))
                .andExpect(jsonPath("$.discountPercentage", is(50)))
                .andExpect(jsonPath("$.availableQuantity", is(8)))
                .andExpect(jsonPath("$.status", is("AVAILABLE")))
                .andReturn();

        JsonNode createdNode = objectMapper.readTree(createRes.getResponse().getContentAsString());
        String offerId = createdNode.get("id").asText();

        // Public browse without authentication
        mockMvc.perform(get("/api/grocery/offers")
                        .param("category", "Beverages")
                        .param("district", "Colombo"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(1))))
                .andExpect(jsonPath("$[0].title", containsString("Ceylon Highland Tea")));

        // Single offer lookup
        mockMvc.perform(get("/api/grocery/offers/" + offerId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(offerId)));
    }

    @Test
    @DisplayName("Customer reserves offer atomically, unique redemption code issued, and overselling prevented")
    void customerReserve_atomicDeduction_andNoOverselling() throws Exception {
        String groceryToken = getAuthToken("stock.grocery@gmail.com", "GroceryPass123!", Role.GROCERY);
        BusinessProfileDto profile = createGroceryProfile(groceryToken, "STOCK-GROC-01", "Stock Mart");
        verifyBusiness(getAdminToken(), profile.getId());

        OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
        GroceryOfferCreateRequest offerReq = GroceryOfferCreateRequest.builder()
                .title("Cheddar Cheese Block 250g")
                .category("Dairy")
                .originalPrice(BigDecimal.valueOf(800.00))
                .discountedPrice(BigDecimal.valueOf(400.00))
                .availableQuantity(3) // Only 3 items!
                .bestBeforeDate(now.plusDays(5))
                .pickupStart(now.plusHours(1))
                .pickupEnd(now.plusHours(12))
                .safetyConfirmed(true)
                .build();

        MvcResult createRes = mockMvc.perform(post("/api/grocery/offers")
                        .header("Authorization", "Bearer " + groceryToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(offerReq)))
                .andExpect(status().isCreated())
                .andReturn();

        String offerId = objectMapper.readTree(createRes.getResponse().getContentAsString()).get("id").asText();

        String userToken = getAuthToken("shopper1@gmail.com", "UserPass123!", Role.USER);

        // Reserve 2 items
        GroceryReservationRequest resReq = GroceryReservationRequest.builder()
                .quantity(2)
                .build();

        MvcResult reserveRes = mockMvc.perform(post("/api/grocery/offers/" + offerId + "/reserve")
                        .header("Authorization", "Bearer " + userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(resReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.redemptionCode", startsWith("GROC-")))
                .andExpect(jsonPath("$.quantity", is(2)))
                .andExpect(jsonPath("$.totalPrice", is(800.00)))
                .andExpect(jsonPath("$.status", is("RESERVED")))
                .andReturn();

        JsonNode resNode = objectMapper.readTree(reserveRes.getResponse().getContentAsString());
        String code = resNode.get("redemptionCode").asText();
        assertThat(code).startsWith("GROC-");

        // Verify offer's available quantity was decremented to 1
        mockMvc.perform(get("/api/grocery/offers/" + offerId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.availableQuantity", is(1)))
                .andExpect(jsonPath("$.status", is("AVAILABLE")));

        // Attempting to reserve 2 items when only 1 is left must fail (Atomic overselling protection)
        mockMvc.perform(post("/api/grocery/offers/" + offerId + "/reserve")
                        .header("Authorization", "Bearer " + userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(resReq)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("exceeds available stock or offer is sold out")));
    }

    @Test
    @DisplayName("Customer cancellation releases stock atomically back to offer")
    void cancelReservation_releasesStockAtomically() throws Exception {
        String groceryToken = getAuthToken("cancel.grocery@gmail.com", "GroceryPass123!", Role.GROCERY);
        BusinessProfileDto profile = createGroceryProfile(groceryToken, "CANCEL-GROC-01", "Cancel Mart");
        verifyBusiness(getAdminToken(), profile.getId());

        OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
        GroceryOfferCreateRequest offerReq = GroceryOfferCreateRequest.builder()
                .title("Organic Strawberries 250g")
                .category("Produce")
                .originalPrice(BigDecimal.valueOf(1200.00))
                .discountedPrice(BigDecimal.valueOf(600.00))
                .availableQuantity(4)
                .bestBeforeDate(now.plusDays(1))
                .pickupStart(now.plusHours(1))
                .pickupEnd(now.plusHours(6))
                .safetyConfirmed(true)
                .build();

        MvcResult createRes = mockMvc.perform(post("/api/grocery/offers")
                        .header("Authorization", "Bearer " + groceryToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(offerReq)))
                .andExpect(status().isCreated())
                .andReturn();

        String offerId = objectMapper.readTree(createRes.getResponse().getContentAsString()).get("id").asText();

        String userToken = getAuthToken("shopper2@gmail.com", "UserPass123!", Role.USER);
        GroceryReservationRequest resReq = GroceryReservationRequest.builder().quantity(3).build();

        MvcResult reserveRes = mockMvc.perform(post("/api/grocery/offers/" + offerId + "/reserve")
                        .header("Authorization", "Bearer " + userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(resReq)))
                .andExpect(status().isCreated())
                .andReturn();

        String reservationId = objectMapper.readTree(reserveRes.getResponse().getContentAsString()).get("id").asText();

        // Available quantity is now 1
        mockMvc.perform(get("/api/grocery/offers/" + offerId))
                .andExpect(jsonPath("$.availableQuantity", is(1)));

        // User cancels reservation
        mockMvc.perform(post("/api/grocery/reservations/" + reservationId + "/cancel")
                        .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("CANCELLED")));

        // Available quantity is restored to 4 (1 + 3)
        mockMvc.perform(get("/api/grocery/offers/" + offerId))
                .andExpect(jsonPath("$.availableQuantity", is(4)))
                .andExpect(jsonPath("$.status", is("AVAILABLE")));
    }

    @Test
    @DisplayName("Shop enters redemption code to verify and confirm customer pickup")
    void shopRedeemsCode_successAndPreventsDoubleRedeem() throws Exception {
        String groceryToken = getAuthToken("redeem.grocery@gmail.com", "GroceryPass123!", Role.GROCERY);
        BusinessProfileDto profile = createGroceryProfile(groceryToken, "REDEEM-GROC-01", "City Fresh Mart");
        verifyBusiness(getAdminToken(), profile.getId());

        OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
        GroceryOfferCreateRequest offerReq = GroceryOfferCreateRequest.builder()
                .title("Dark Chocolate Bar 100g")
                .category("Snacks")
                .originalPrice(BigDecimal.valueOf(450.00))
                .discountedPrice(BigDecimal.valueOf(200.00))
                .availableQuantity(5)
                .bestBeforeDate(now.plusMonths(1))
                .pickupStart(now.plusHours(1))
                .pickupEnd(now.plusDays(1))
                .safetyConfirmed(true)
                .build();

        MvcResult createRes = mockMvc.perform(post("/api/grocery/offers")
                        .header("Authorization", "Bearer " + groceryToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(offerReq)))
                .andExpect(status().isCreated())
                .andReturn();

        String offerId = objectMapper.readTree(createRes.getResponse().getContentAsString()).get("id").asText();

        String userToken = getAuthToken("shopper3@gmail.com", "UserPass123!", Role.USER);
        GroceryReservationRequest resReq = GroceryReservationRequest.builder().quantity(1).build();

        MvcResult reserveRes = mockMvc.perform(post("/api/grocery/offers/" + offerId + "/reserve")
                        .header("Authorization", "Bearer " + userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(resReq)))
                .andExpect(status().isCreated())
                .andReturn();

        String code = objectMapper.readTree(reserveRes.getResponse().getContentAsString()).get("redemptionCode").asText();

        // 1. Shop verifies the code first
        RedeemCodeRequest redeemReq = RedeemCodeRequest.builder().redemptionCode(code).build();
        mockMvc.perform(post("/api/grocery/redemptions/verify")
                        .header("Authorization", "Bearer " + groceryToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(redeemReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.offerTitle", is("Dark Chocolate Bar 100g")))
                .andExpect(jsonPath("$.quantity", is(1)))
                .andExpect(jsonPath("$.status", is("RESERVED")));

        // 2. Shop confirms redemption
        mockMvc.perform(post("/api/grocery/redemptions/confirm")
                        .header("Authorization", "Bearer " + groceryToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(redeemReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("REDEEMED")))
                .andExpect(jsonPath("$.redeemedAt", notNullValue()));

        // 3. Trying to redeem again must be rejected
        mockMvc.perform(post("/api/grocery/redemptions/confirm")
                        .header("Authorization", "Bearer " + groceryToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(redeemReq)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("already redeemed")));
    }

    @Test
    @DisplayName("Auto-expiry releases stock for unredeemed expired reservations")
    void autoExpiry_releasesReservedStock() throws Exception {
        String groceryToken = getAuthToken("expiry.grocery@gmail.com", "GroceryPass123!", Role.GROCERY);
        BusinessProfileDto profile = createGroceryProfile(groceryToken, "EXPIRY-GROC-01", "Daily Super");
        verifyBusiness(getAdminToken(), profile.getId());

        OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
        GroceryOfferCreateRequest offerReq = GroceryOfferCreateRequest.builder()
                .title("Organic Yoghurt 500g")
                .category("Dairy")
                .originalPrice(BigDecimal.valueOf(350.00))
                .discountedPrice(BigDecimal.valueOf(175.00))
                .availableQuantity(5)
                .bestBeforeDate(now.plusDays(3))
                .pickupStart(now.plusHours(1))
                .pickupEnd(now.plusHours(2))
                .safetyConfirmed(true)
                .build();

        MvcResult createRes = mockMvc.perform(post("/api/grocery/offers")
                        .header("Authorization", "Bearer " + groceryToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(offerReq)))
                .andExpect(status().isCreated())
                .andReturn();

        String offerId = objectMapper.readTree(createRes.getResponse().getContentAsString()).get("id").asText();
        UUID offerUuid = UUID.fromString(offerId);

        String userToken = getAuthToken("shopper4@gmail.com", "UserPass123!", Role.USER);
        GroceryReservationRequest resReq = GroceryReservationRequest.builder().quantity(2).build();

        MvcResult reserveRes = mockMvc.perform(post("/api/grocery/offers/" + offerId + "/reserve")
                        .header("Authorization", "Bearer " + userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(resReq)))
                .andExpect(status().isCreated())
                .andReturn();

        String reservationId = objectMapper.readTree(reserveRes.getResponse().getContentAsString()).get("id").asText();
        UUID resUuid = UUID.fromString(reservationId);

        // Stock is now 3
        assertThat(groceryOfferRepository.findById(offerUuid).orElseThrow().getAvailableQuantity()).isEqualTo(3);

        // Manually artificially simulate past expiresAt for this reservation
        var resEntity = reservationRepository.findById(resUuid).orElseThrow();
        resEntity.setExpiresAt(now.minusMinutes(10));
        reservationRepository.saveAndFlush(resEntity);

        // Run auto-expiry
        int expiredCount = groceryOfferService.expirePastReservationsAndOffers();
        assertThat(expiredCount).isGreaterThanOrEqualTo(1);

        // Reservation should now be EXPIRED
        var updatedRes = reservationRepository.findById(resUuid).orElseThrow();
        assertThat(updatedRes.getStatus()).isEqualTo(GroceryReservationStatus.EXPIRED);

        // Stock was atomically released back to offer (3 + 2 = 5)
        var updatedOffer = groceryOfferRepository.findById(offerUuid).orElseThrow();
        assertThat(updatedOffer.getAvailableQuantity()).isEqualTo(5);
    }
}

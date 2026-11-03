package com.ecoconnect.foodbridge;

import com.ecoconnect.foodbridge.dto.*;
import com.ecoconnect.foodbridge.model.enums.*;
import com.ecoconnect.foodbridge.security.RateLimitingFilter;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
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
class SecurityAndIdorTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        RateLimitingFilter.resetLimitForTesting();
    }

    @AfterEach
    void tearDown() {
        RateLimitingFilter.resetLimitForTesting();
    }

    private String getAuthToken(String email, String password, Role role, String name) throws Exception {
        RegisterRequest register = RegisterRequest.builder()
                .email(email)
                .password(password)
                .fullName(name)
                .phoneNumber("+94771230000")
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

    private UUID setupBusiness(String token, String adminToken, String name, String regNo, BusinessType type) throws Exception {
        BusinessProfileDto profile = BusinessProfileDto.builder()
                .businessName(name)
                .businessType(type)
                .registrationNumber(regNo)
                .contactPhone("+94112345678")
                .city("Colombo")
                .district("Colombo")
                .addressLine1("10 Galle Road, Colombo 03")
                .latitude(new BigDecimal("6.9271"))
                .longitude(new BigDecimal("79.8612"))
                .build();

        MvcResult result = mockMvc.perform(put("/api/profiles/business")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(profile)))
                .andExpect(status().isOk())
                .andReturn();

        JsonNode root = objectMapper.readTree(result.getResponse().getContentAsString());
        UUID businessId = UUID.fromString(root.get("id").asText());

        VerificationDecisionRequest decide = VerificationDecisionRequest.builder()
                .status(VerificationStatus.VERIFIED)
                .reason("Legitimate establishment")
                .build();

        mockMvc.perform(post("/api/admin/verifications/BUSINESS/" + businessId + "/decide")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(decide)))
                .andExpect(status().isOk());

        return businessId;
    }

    private UUID setupCharity(String token, String adminToken, String name, String regNo) throws Exception {
        CharityProfileDto profile = CharityProfileDto.builder()
                .charityName(name)
                .registrationNumber(regNo)
                .operatingArea("Western Province")
                .contactPhone("+94117654321")
                .city("Colombo")
                .district("Colombo")
                .addressLine1("50 Havelock Road, Colombo 05")
                .latitude(new BigDecimal("6.8833"))
                .longitude(new BigDecimal("79.8667"))
                .build();

        MvcResult result = mockMvc.perform(put("/api/profiles/charity")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(profile)))
                .andExpect(status().isOk())
                .andReturn();

        JsonNode root = objectMapper.readTree(result.getResponse().getContentAsString());
        UUID charityId = UUID.fromString(root.get("id").asText());

        VerificationDecisionRequest decide = VerificationDecisionRequest.builder()
                .status(VerificationStatus.VERIFIED)
                .reason("Legitimate charity")
                .build();

        mockMvc.perform(post("/api/admin/verifications/CHARITY/" + charityId + "/decide")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(decide)))
                .andExpect(status().isOk());

        return charityId;
    }

    @Test
    @DisplayName("Security Headers: Responses include X-Content-Type-Options, X-Frame-Options, and Referrer-Policy")
    void testSecurityHeadersPresent() throws Exception {
        mockMvc.perform(get("/api/health"))
                .andExpect(status().isOk())
                .andExpect(header().string("X-Content-Type-Options", "nosniff"))
                .andExpect(header().string("X-Frame-Options", "SAMEORIGIN"))
                .andExpect(header().string("Referrer-Policy", "strict-origin-when-cross-origin"));
    }

    @Test
    @DisplayName("Rate Limiting: Exceeding auth endpoint request threshold returns 429 Too Many Requests")
    void testAuthenticationRateLimiting() throws Exception {
        RateLimitingFilter.setMaxRequestsForTesting(3);

        LoginRequest login = LoginRequest.builder()
                .email("admin@foodbridge.lk")
                .password("Admin@FoodBridge2026")
                .build();

        String body = objectMapper.writeValueAsString(login);

        // Requests 1 to 3 should succeed
        for (int i = 0; i < 3; i++) {
            mockMvc.perform(post("/api/auth/login")
                            .header("X-Forwarded-For", "203.0.113.195")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(body))
                    .andExpect(status().isOk());
        }

        // Request 4 from same IP exceeds rate limit -> 429
        mockMvc.perform(post("/api/auth/login")
                        .header("X-Forwarded-For", "203.0.113.195")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isTooManyRequests())
                .andExpect(header().string("Retry-After", "60"))
                .andExpect(jsonPath("$.status", is(429)))
                .andExpect(jsonPath("$.error", is("Too Many Requests")))
                .andExpect(jsonPath("$.message", containsString("Rate limit exceeded")));

        // Different IP is NOT rate-limited
        mockMvc.perform(post("/api/auth/login")
                        .header("X-Forwarded-For", "198.51.100.42")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("IDOR Prevention: Restaurant B cannot approve/reject or mark collected Restaurant A's food requests")
    void testIdor_RestaurantCannotDecideOrCollectOtherRestaurantFoodRequest() throws Exception {
        String adminToken = getAdminToken();
        String restAToken = getAuthToken("restA_idor@foodbridge.lk", "RestA@Secure123", Role.RESTAURANT, "Restaurant Alpha");
        String restBToken = getAuthToken("restB_idor@foodbridge.lk", "RestB@Secure123", Role.RESTAURANT, "Restaurant Beta");
        String charityToken = getAuthToken("charity_idor@foodbridge.lk", "Charity@Secure123", Role.CHARITY, "Charity Trust");

        setupBusiness(restAToken, adminToken, "Restaurant Alpha", "PV-SEC-001", BusinessType.RESTAURANT);
        setupBusiness(restBToken, adminToken, "Restaurant Beta", "PV-SEC-002", BusinessType.RESTAURANT);
        setupCharity(charityToken, adminToken, "Charity Trust", "CH-SEC-001");

        // Restaurant A creates a food listing
        OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
        FoodListingCreateRequest listingReq = FoodListingCreateRequest.builder()
                .title("Fresh Curries & Rice")
                .description("Surplus hot meal trays")
                .foodCategory("Cooked Meals")
                .quantity(new BigDecimal("15.00"))
                .unit("kg")
                .suitabilityType(FoodSuitabilityType.HUMAN_CONSUMPTION)
                .foodSafetyConfirmed(true)
                .preparedAt(now.minusHours(2))
                .expiryDate(now.plusHours(8))
                .pickupStart(now.plusHours(1))
                .pickupEnd(now.plusHours(5))
                .pickupAddress("10 Galle Road, Colombo 03")
                .latitude(new BigDecimal("6.9271"))
                .longitude(new BigDecimal("79.8612"))
                .build();

        MvcResult listingResult = mockMvc.perform(post("/api/food-listings")
                        .header("Authorization", "Bearer " + restAToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(listingReq)))
                .andExpect(status().isCreated())
                .andReturn();

        UUID listingId = UUID.fromString(objectMapper.readTree(listingResult.getResponse().getContentAsString()).get("id").asText());

        // Charity requests the food listing
        FoodRequestCreateDto reqDto = FoodRequestCreateDto.builder()
                .listingId(listingId)
                .quantityRequested(new BigDecimal("10.00"))
                .notes("For evening meal distribution")
                .build();

        MvcResult reqResult = mockMvc.perform(post("/api/food-rescue/requests")
                        .header("Authorization", "Bearer " + charityToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(reqDto)))
                .andExpect(status().isCreated())
                .andReturn();

        UUID requestId = UUID.fromString(objectMapper.readTree(reqResult.getResponse().getContentAsString()).get("id").asText());

        // IDOR Attack: Restaurant B attempts to APPROVE Restaurant A's request
        FoodRequestDecisionDto attackDecision = FoodRequestDecisionDto.builder()
                .decision("APPROVE")
                .build();

        mockMvc.perform(post("/api/food-rescue/requests/" + requestId + "/decide")
                        .header("Authorization", "Bearer " + restBToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(attackDecision)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("not authorized to decide requests for another establishment")));

        // IDOR Attack: Restaurant B attempts to mark COLLECTED
        mockMvc.perform(post("/api/food-rescue/requests/" + requestId + "/collect")
                        .header("Authorization", "Bearer " + restBToken))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("not authorized to mark collection for another establishment")));

        // Legitimate Restaurant A approves successfully
        mockMvc.perform(post("/api/food-rescue/requests/" + requestId + "/decide")
                        .header("Authorization", "Bearer " + restAToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(attackDecision)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("ACCEPTED")));
    }

    @Test
    @DisplayName("IDOR Prevention: Customer B cannot cancel Customer A's grocery reservation")
    void testIdor_CustomerCannotCancelOtherCustomerReservation() throws Exception {
        String adminToken = getAdminToken();
        String storeToken = getAuthToken("store_idor@foodbridge.lk", "Store@Secure123", Role.GROCERY, "Fresh Supermarket");
        String customerAToken = getAuthToken("customerA_idor@foodbridge.lk", "CustA@Secure123", Role.USER, "Perera A");
        String customerBToken = getAuthToken("customerB_idor@foodbridge.lk", "CustB@Secure123", Role.USER, "Silva B");

        setupBusiness(storeToken, adminToken, "Fresh Supermarket", "PV-SEC-003", BusinessType.GROCERY);

        // Store creates a grocery offer
        OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
        GroceryOfferCreateRequest offerReq = GroceryOfferCreateRequest.builder()
                .title("Discounted Milk Cartons")
                .category("Dairy")
                .originalPrice(new BigDecimal("600.00"))
                .discountedPrice(new BigDecimal("350.00"))
                .availableQuantity(10)
                .bestBeforeDate(now.plusDays(3))
                .pickupStart(now)
                .pickupEnd(now.plusDays(2))
                .pickupAddress("12 Peradeniya Road, Kandy")
                .safetyConfirmed(true)
                .build();

        MvcResult offerResult = mockMvc.perform(post("/api/grocery/offers")
                        .header("Authorization", "Bearer " + storeToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(offerReq)))
                .andExpect(status().isCreated())
                .andReturn();

        UUID offerId = UUID.fromString(objectMapper.readTree(offerResult.getResponse().getContentAsString()).get("id").asText());

        // Customer A reserves the offer
        GroceryReservationRequest resReq = GroceryReservationRequest.builder()
                .quantity(2)
                .build();

        MvcResult resResult = mockMvc.perform(post("/api/grocery/offers/" + offerId + "/reserve")
                        .header("Authorization", "Bearer " + customerAToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(resReq)))
                .andExpect(status().isCreated())
                .andReturn();

        UUID resId = UUID.fromString(objectMapper.readTree(resResult.getResponse().getContentAsString()).get("id").asText());

        // IDOR Attack: Customer B attempts to cancel Customer A's reservation -> 403 Forbidden
        mockMvc.perform(post("/api/grocery/reservations/" + resId + "/cancel")
                        .header("Authorization", "Bearer " + customerBToken))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.error", is("Forbidden")));

        // Legitimate Customer A cancels their own reservation -> 200 OK
        mockMvc.perform(post("/api/grocery/reservations/" + resId + "/cancel")
                        .header("Authorization", "Bearer " + customerAToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("CANCELLED")));
    }

    @Test
    @DisplayName("IDOR Prevention: Store B cannot redeem coupon belonging to Store A")
    void testIdor_StoreCannotRedeemOtherStoreCoupon() throws Exception {
        String adminToken = getAdminToken();
        String storeAToken = getAuthToken("storeA_idor@foodbridge.lk", "StoreA@Secure123", Role.GROCERY, "Store Alpha");
        String storeBToken = getAuthToken("storeB_idor@foodbridge.lk", "StoreB@Secure123", Role.GROCERY, "Store Beta");
        String customerToken = getAuthToken("customer_coupon@foodbridge.lk", "Cust@Secure123", Role.USER, "Customer Citizen");

        setupBusiness(storeAToken, adminToken, "Store Alpha", "PV-SEC-004", BusinessType.GROCERY);
        setupBusiness(storeBToken, adminToken, "Store Beta", "PV-SEC-005", BusinessType.GROCERY);

        OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
        GroceryOfferCreateRequest offerReq = GroceryOfferCreateRequest.builder()
                .title("Bakery Bread Loaves")
                .category("Bakery")
                .originalPrice(new BigDecimal("400.00"))
                .discountedPrice(new BigDecimal("200.00"))
                .availableQuantity(5)
                .bestBeforeDate(now.plusDays(2))
                .pickupStart(now)
                .pickupEnd(now.plusDays(1))
                .pickupAddress("15 Main Street, Colombo")
                .safetyConfirmed(true)
                .build();

        MvcResult offerResult = mockMvc.perform(post("/api/grocery/offers")
                        .header("Authorization", "Bearer " + storeAToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(offerReq)))
                .andExpect(status().isCreated())
                .andReturn();

        UUID offerId = UUID.fromString(objectMapper.readTree(offerResult.getResponse().getContentAsString()).get("id").asText());

        // Customer reserves
        GroceryReservationRequest resReq = GroceryReservationRequest.builder().quantity(1).build();
        MvcResult resResult = mockMvc.perform(post("/api/grocery/offers/" + offerId + "/reserve")
                        .header("Authorization", "Bearer " + customerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(resReq)))
                .andExpect(status().isCreated())
                .andReturn();

        String redemptionCode = objectMapper.readTree(resResult.getResponse().getContentAsString()).get("redemptionCode").asText();

        RedeemCodeRequest redeemReq = RedeemCodeRequest.builder()
                .redemptionCode(redemptionCode)
                .build();

        // IDOR Attack: Store B attempts to verify or redeem Store A's coupon code -> 403 Forbidden
        mockMvc.perform(post("/api/grocery/redemptions/verify")
                        .header("Authorization", "Bearer " + storeBToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(redeemReq)))
                .andExpect(status().isForbidden());

        mockMvc.perform(post("/api/grocery/redemptions/confirm")
                        .header("Authorization", "Bearer " + storeBToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(redeemReq)))
                .andExpect(status().isForbidden());

        // Store A redeems its own coupon successfully -> 200 OK
        mockMvc.perform(post("/api/grocery/redemptions/confirm")
                        .header("Authorization", "Bearer " + storeAToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(redeemReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("REDEEMED")));
    }

    @Test
    @DisplayName("File Upload Security: Rejects dangerous extensions, directory traversal, and enforces magic bytes")
    void testFileUploadSecurity() throws Exception {
        String userToken = getAuthToken("uploader_sec@foodbridge.lk", "Upload@Secure123", Role.RESTAURANT, "File Uploader");

        // 1. Rejected extension & MIME (executable)
        MockMultipartFile maliciousExe = new MockMultipartFile(
                "file", "script.exe", "application/x-msdownload", "MALICIOUS_EXE_CONTENT".getBytes()
        );

        mockMvc.perform(multipart("/api/upload")
                        .file(maliciousExe)
                        .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("Unsupported file type")));

        // 2. Directory traversal attempt in filename
        byte[] pngHeader = new byte[]{(byte) 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D};
        MockMultipartFile pathTraversalFile = new MockMultipartFile(
                "file", "../../etc/passwd.png", "image/png", pngHeader
        );

        mockMvc.perform(multipart("/api/upload")
                        .file(pathTraversalFile)
                        .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("directory traversal")));

        // 3. Valid PNG with authentic magic bytes
        MockMultipartFile validPng = new MockMultipartFile(
                "file", "registration_proof.png", "image/png", pngHeader
        );

        mockMvc.perform(multipart("/api/upload")
                        .file(validPng)
                        .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("UPLOADED")))
                .andExpect(jsonPath("$.fileName", not(containsString("registration_proof.png"))))
                .andExpect(jsonPath("$.fileName", endsWith(".png")));
    }

    @Test
    @DisplayName("Input Validation: Invalid payloads (blank email, short password) rejected with 400 and field errors")
    void testInputValidation_RejectsMalformedPayload() throws Exception {
        RegisterRequest invalidRegister = RegisterRequest.builder()
                .email("not-a-valid-email")
                .password("short")
                .fullName("")
                .role(Role.USER)
                .build();

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidRegister)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors", notNullValue()));
    }

    @Test
    @DisplayName("Sensitive Data Privacy: Password hash is never exposed in authentication responses or profiles")
    void testSensitiveDataPrivacy_NoPasswordHashLeaked() throws Exception {
        String token = getAuthToken("privacy_test@foodbridge.lk", "Privacy@Secure123", Role.USER, "Privacy Member");

        MvcResult meResult = mockMvc.perform(get("/api/auth/me")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.passwordHash").doesNotExist())
                .andExpect(jsonPath("$.password").doesNotExist())
                .andExpect(jsonPath("$.email", is("privacy_test@foodbridge.lk")))
                .andReturn();

        String rawContent = meResult.getResponse().getContentAsString();
        assertThat(rawContent).doesNotContain("passwordHash");
        assertThat(rawContent).doesNotContain("Privacy@Secure123");
    }
}

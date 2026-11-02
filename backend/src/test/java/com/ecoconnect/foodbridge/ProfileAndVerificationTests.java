package com.ecoconnect.foodbridge;

import com.ecoconnect.foodbridge.dto.*;
import com.ecoconnect.foodbridge.model.AuditLog;
import com.ecoconnect.foodbridge.model.Notification;
import com.ecoconnect.foodbridge.model.enums.BusinessType;
import com.ecoconnect.foodbridge.model.enums.FoodSuitabilityType;
import com.ecoconnect.foodbridge.model.enums.Role;
import com.ecoconnect.foodbridge.model.enums.VerificationStatus;
import com.ecoconnect.foodbridge.repository.AuditLogRepository;
import com.ecoconnect.foodbridge.repository.NotificationRepository;
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
class ProfileAndVerificationTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    private String getAuthToken(String email, String password, Role role) throws Exception {
        RegisterRequest register = RegisterRequest.builder()
                .email(email)
                .password(password)
                .fullName("Test Owner")
                .phoneNumber("+94771122334")
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

    @Test
    @DisplayName("Restaurant/Grocery users can create and edit business profile starting with PENDING status")
    void testBusinessProfileCreationAndEditing() throws Exception {
        String token = getAuthToken("resto.kandy@gmail.com", "SecretPass123!", Role.RESTAURANT);

        BusinessProfileDto createDto = BusinessProfileDto.builder()
                .businessName("Hill Country Bakers")
                .businessType(BusinessType.RESTAURANT)
                .registrationNumber("PV-123456")
                .description("Artisan bakery in Kandy city center offering surplus baked goods.")
                .logoUrl("https://foodbridge.lk/uploads/logos/hill-bakers.png")
                .documentUrl("https://foodbridge.lk/uploads/docs/br-pv-123456.pdf")
                .contactPerson("Sunil Perera")
                .contactEmail("sunil@hillcountrybakers.lk")
                .contactPhone("+94812233445")
                .addressLine1("42 Dalada Veediya")
                .city("Kandy")
                .district("Kandy")
                .latitude(new BigDecimal("7.2905715"))
                .longitude(new BigDecimal("80.6337262"))
                .build();

        // 1. Create Business Profile
        MvcResult createResult = mockMvc.perform(post("/api/profiles/business")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createDto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.businessName", is("Hill Country Bakers")))
                .andExpect(jsonPath("$.registrationNumber", is("PV-123456")))
                .andExpect(jsonPath("$.verificationStatus", is("PENDING")))
                .andExpect(jsonPath("$.logoUrl", is("https://foodbridge.lk/uploads/logos/hill-bakers.png")))
                .andExpect(jsonPath("$.documentUrl", is("https://foodbridge.lk/uploads/docs/br-pv-123456.pdf")))
                .andReturn();

        JsonNode createdNode = objectMapper.readTree(createResult.getResponse().getContentAsString());
        assertThat(createdNode.get("id").asText()).isNotBlank();

        // 2. Fetch Business Profile
        mockMvc.perform(get("/api/profiles/business")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.businessName", is("Hill Country Bakers")))
                .andExpect(jsonPath("$.verificationStatus", is("PENDING")));

        // 3. Edit Business Profile
        createDto.setAddressLine1("45 Dalada Veediya, Floor 2");
        mockMvc.perform(put("/api/profiles/business")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createDto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.addressLine1", is("45 Dalada Veediya, Floor 2")))
                .andExpect(jsonPath("$.verificationStatus", is("PENDING")));
    }

    @Test
    @DisplayName("Charity user can create charity profile starting with PENDING status")
    void testCharityProfileCreation() throws Exception {
        String token = getAuthToken("hope.foundation@gmail.com", "CharityPass123!", Role.CHARITY);

        CharityProfileDto charityDto = CharityProfileDto.builder()
                .charityName("Hope Community Kitchen")
                .registrationNumber("NGO-998877")
                .description("Feeding families and low-income elder homes in Colombo North.")
                .operatingArea("Colombo District")
                .logoUrl("https://foodbridge.lk/logos/hope.png")
                .documentUrl("https://foodbridge.lk/docs/ngo-cert-998877.pdf")
                .contactPerson("Fatima Rameez")
                .contactEmail("contact@hopekitchen.lk")
                .contactPhone("+94112345678")
                .addressLine1("12 Kotahena Street")
                .city("Colombo")
                .district("Colombo")
                .latitude(new BigDecimal("6.9497000"))
                .longitude(new BigDecimal("79.8656000"))
                .capacityPeople(250)
                .build();

        mockMvc.perform(post("/api/profiles/charity")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(charityDto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.charityName", is("Hope Community Kitchen")))
                .andExpect(jsonPath("$.registrationNumber", is("NGO-998877")))
                .andExpect(jsonPath("$.operatingArea", is("Colombo District")))
                .andExpect(jsonPath("$.verificationStatus", is("PENDING")));
    }

    @Test
    @DisplayName("Rule 2 Enforcement: Unverified accounts are strictly blocked from publishing food listings")
    void testRule2UnverifiedBlockedFromPublishing() throws Exception {
        String token = getAuthToken("unverified.resto@gmail.com", "Pass12345!", Role.RESTAURANT);

        // Submit business profile (status: PENDING)
        BusinessProfileDto createDto = BusinessProfileDto.builder()
                .businessName("Galle Fort Cafe")
                .businessType(BusinessType.RESTAURANT)
                .registrationNumber("PV-776655")
                .addressLine1("15 Church Street")
                .city("Galle")
                .district("Galle")
                .latitude(new BigDecimal("6.0328"))
                .longitude(new BigDecimal("80.2170"))
                .build();

        mockMvc.perform(post("/api/profiles/business")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createDto)))
                .andExpect(status().isCreated());

        // Attempt to publish a food listing while PENDING
        FoodListingCreateRequest listingRequest = FoodListingCreateRequest.builder()
                .title("Fresh Vegetable Fried Rice (10 portions)")
                .description("Freshly cooked surplus from buffet, safely packaged.")
                .foodCategory("Cooked Meals")
                .suitabilityType(FoodSuitabilityType.HUMAN_CONSUMPTION)
                .quantity(new BigDecimal("10.00"))
                .unit("portions")
                .foodSafetyConfirmed(true)
                .perishable(true)
                .pickupStart(OffsetDateTime.now(ZoneOffset.UTC).plusHours(1))
                .pickupEnd(OffsetDateTime.now(ZoneOffset.UTC).plusHours(3))
                .expiryDate(OffsetDateTime.now(ZoneOffset.UTC).plusHours(6))
                .pickupAddress("15 Church Street, Galle")
                .latitude(new BigDecimal("6.0328"))
                .longitude(new BigDecimal("80.2170"))
                .build();

        mockMvc.perform(post("/api/food-listings")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(listingRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("Rule 2 violation: Business account must be admin-VERIFIED before publishing")));
    }

    @Test
    @DisplayName("Admin verification workflow: list pending, view details, approve, record audit log and email stub, allow publishing")
    void testAdminApprovalWorkflowAndPublishing() throws Exception {
        String restoToken = getAuthToken("verified.resto@gmail.com", "Pass12345!", Role.RESTAURANT);

        BusinessProfileDto profileDto = BusinessProfileDto.builder()
                .businessName("Colombo Spice Restaurant")
                .businessType(BusinessType.RESTAURANT)
                .registrationNumber("PV-554433")
                .description("Buffet and dining restaurant in Colombo 03.")
                .documentUrl("https://foodbridge.lk/docs/br-colombo-spice.pdf")
                .addressLine1("88 Galle Road")
                .city("Colombo")
                .district("Colombo")
                .latitude(new BigDecimal("6.9010"))
                .longitude(new BigDecimal("79.8540"))
                .build();

        MvcResult profileResult = mockMvc.perform(post("/api/profiles/business")
                        .header("Authorization", "Bearer " + restoToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(profileDto)))
                .andExpect(status().isCreated())
                .andReturn();

        UUID businessId = UUID.fromString(objectMapper.readTree(profileResult.getResponse().getContentAsString()).get("id").asText());

        // Admin logs in
        String adminToken = getAdminToken();

        // 1. Admin lists pending queue
        mockMvc.perform(get("/api/admin/verifications/pending")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", not(empty())))
                .andExpect(jsonPath("$[?(@.id == '" + businessId + "')].name", hasItem("Colombo Spice Restaurant")));

        // 2. Admin views details of the business
        mockMvc.perform(get("/api/admin/verifications/BUSINESS/" + businessId)
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name", is("Colombo Spice Restaurant")))
                .andExpect(jsonPath("$.documentUrl", is("https://foodbridge.lk/docs/br-colombo-spice.pdf")));

        // 3. Admin approves verification
        VerificationDecisionRequest approveRequest = VerificationDecisionRequest.builder()
                .status(VerificationStatus.VERIFIED)
                .reason("Business registration verified against ROC database.")
                .build();

        mockMvc.perform(post("/api/admin/verifications/BUSINESS/" + businessId + "/decide")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(approveRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.verificationStatus", is("VERIFIED")));

        // 4. Verify Audit Log entry created
        List<AuditLog> auditLogs = auditLogRepository.findByActionOrderByCreatedAtDesc("ADMIN_APPROVE_VERIFICATION");
        assertThat(auditLogs).isNotEmpty();
        assertThat(auditLogs.get(0).getEntityId()).isEqualTo(businessId);
        assertThat(auditLogs.get(0).getEntityName()).isEqualTo("BUSINESS");

        // 5. Verify In-App Notification created for business owner
        List<Notification> notifications = notificationRepository.findAll();
        boolean foundNotification = notifications.stream()
                .anyMatch(n -> "VERIFICATION_APPROVED".equals(n.getType()) && businessId.equals(n.getReferenceId()));
        assertThat(foundNotification).isTrue();

        // 6. Now verified business CAN publish food listing!
        FoodListingCreateRequest listingRequest = FoodListingCreateRequest.builder()
                .title("Buffet Curries and Roti (25 portions)")
                .description("Quality vegetarian and chicken curries with roti.")
                .foodCategory("Cooked Meals")
                .suitabilityType(FoodSuitabilityType.HUMAN_CONSUMPTION)
                .quantity(new BigDecimal("25.00"))
                .unit("portions")
                .foodSafetyConfirmed(true)
                .perishable(true)
                .pickupStart(OffsetDateTime.now(ZoneOffset.UTC).plusHours(1))
                .pickupEnd(OffsetDateTime.now(ZoneOffset.UTC).plusHours(3))
                .expiryDate(OffsetDateTime.now(ZoneOffset.UTC).plusHours(5))
                .pickupAddress("88 Galle Road, Colombo 03")
                .latitude(new BigDecimal("6.9010"))
                .longitude(new BigDecimal("79.8540"))
                .build();

        mockMvc.perform(post("/api/food-listings")
                        .header("Authorization", "Bearer " + restoToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(listingRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", notNullValue()))
                .andExpect(jsonPath("$.title", is("Buffet Curries and Roti (25 portions)")))
                .andExpect(jsonPath("$.status", is("AVAILABLE")));

        // 7. Verify listing in my-listings
        mockMvc.perform(get("/api/food-listings/my-listings")
                        .header("Authorization", "Bearer " + restoToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].title", is("Buffet Curries and Roti (25 portions)")));
    }

    @Test
    @DisplayName("Admin verification workflow: rejection requires reason, records audit log and dispatches rejection email/notification")
    void testAdminRejectionWorkflow() throws Exception {
        String charityToken = getAuthToken("reject.charity@gmail.com", "Pass12345!", Role.CHARITY);

        CharityProfileDto charityDto = CharityProfileDto.builder()
                .charityName("Shelter Helpers")
                .registrationNumber("NGO-112233")
                .addressLine1("10 Temple Road")
                .city("Negombo")
                .district("Gampaha")
                .latitude(new BigDecimal("7.2008"))
                .longitude(new BigDecimal("79.8737"))
                .build();

        MvcResult charityResult = mockMvc.perform(post("/api/profiles/charity")
                        .header("Authorization", "Bearer " + charityToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(charityDto)))
                .andExpect(status().isCreated())
                .andReturn();

        UUID charityId = UUID.fromString(objectMapper.readTree(charityResult.getResponse().getContentAsString()).get("id").asText());

        String adminToken = getAdminToken();

        // 1. Rejection without reason must fail
        VerificationDecisionRequest noReasonRequest = VerificationDecisionRequest.builder()
                .status(VerificationStatus.REJECTED)
                .reason("")
                .build();

        mockMvc.perform(post("/api/admin/verifications/CHARITY/" + charityId + "/decide")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(noReasonRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("A rejection reason is required")));

        // 2. Rejection with valid reason succeeds
        VerificationDecisionRequest rejectRequest = VerificationDecisionRequest.builder()
                .status(VerificationStatus.REJECTED)
                .reason("Registration document is blurry and missing page 2. Please re-upload official NGO certificate.")
                .build();

        mockMvc.perform(post("/api/admin/verifications/CHARITY/" + charityId + "/decide")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(rejectRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.verificationStatus", is("REJECTED")))
                .andExpect(jsonPath("$.verificationNotes", containsString("Registration document is blurry")));

        // 3. Verify Audit Log entry created
        List<AuditLog> auditLogs = auditLogRepository.findByActionOrderByCreatedAtDesc("ADMIN_REJECT_VERIFICATION");
        assertThat(auditLogs).isNotEmpty();
        assertThat(auditLogs.get(0).getEntityId()).isEqualTo(charityId);
        assertThat(auditLogs.get(0).getEntityName()).isEqualTo("CHARITY");

        // 4. Verify Rejection Notification dispatched
        List<Notification> notifications = notificationRepository.findAll();
        boolean foundNotification = notifications.stream()
                .anyMatch(n -> "VERIFICATION_REJECTED".equals(n.getType()) && charityId.equals(n.getReferenceId()));
        assertThat(foundNotification).isTrue();
    }
}

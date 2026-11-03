package com.ecoconnect.foodbridge;

import com.ecoconnect.foodbridge.dto.*;
import com.ecoconnect.foodbridge.model.enums.*;
import com.ecoconnect.foodbridge.repository.AuditLogRepository;
import com.ecoconnect.foodbridge.repository.CampaignContributionRepository;
import com.ecoconnect.foodbridge.repository.PartnershipRepository;
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
import java.time.LocalDate;
import java.util.UUID;

import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("local")
class PartnershipWorkflowTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private PartnershipRepository partnershipRepository;

    @Autowired
    private CampaignContributionRepository contributionRepository;

    @Autowired
    private AuditLogRepository auditLogRepository;

    private String getAuthToken(String email, String password, Role role) throws Exception {
        RegisterRequest register = RegisterRequest.builder()
                .email(email)
                .password(password)
                .fullName("Test " + role.name())
                .phoneNumber("+9477" + (Math.abs(email.hashCode()) % 1000000))
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

        return objectMapper.readTree(result.getResponse().getContentAsString()).get("accessToken").asText();
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

        return objectMapper.readTree(result.getResponse().getContentAsString()).get("accessToken").asText();
    }

    private String createVerifiedCharity(String email, String name, String regNo) throws Exception {
        String token = getAuthToken(email, "CharityPass123!", Role.CHARITY);

        CharityProfileDto req = CharityProfileDto.builder()
                .charityName(name)
                .registrationNumber(regNo)
                .description("Dedicated community relief organization in Sri Lanka.")
                .operatingArea("Monaragala and Badulla Districts")
                .contactPerson("Dr. Relief Coordinator")
                .contactPhone("+94771234567")
                .contactEmail(email)
                .addressLine1("45 Temple Road")
                .city("Monaragala")
                .district("Monaragala")
                .latitude(BigDecimal.valueOf(6.8714))
                .longitude(BigDecimal.valueOf(81.3487))
                .capacityPeople(250)
                .documentUrl("https://storage.googleapis.com/test-docs/charity-cert.pdf")
                .build();

        MvcResult profileRes = mockMvc.perform(post("/api/profiles/charity")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andReturn();

        String charityId = objectMapper.readTree(profileRes.getResponse().getContentAsString()).get("id").asText();

        // Admin approves charity
        VerificationDecisionRequest decision = VerificationDecisionRequest.builder()
                .status(VerificationStatus.VERIFIED)
                .reason("NGO registration verified with Ministry of Social Services.")
                .build();

        mockMvc.perform(post("/api/admin/verifications/CHARITY/" + charityId + "/decide")
                        .header("Authorization", "Bearer " + getAdminToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(decision)))
                .andExpect(status().isOk());

        return token;
    }

    private String createVerifiedBusiness(String email, String name, String regNo, Role role) throws Exception {
        String token = getAuthToken(email, "BusinessPass123!", role);

        BusinessProfileDto req = BusinessProfileDto.builder()
                .businessName(name)
                .businessType(role == Role.GROCERY ? BusinessType.GROCERY : BusinessType.RESTAURANT)
                .description("Responsible sustainable business participating in community CSR.")
                .registrationNumber(regNo)
                .addressLine1("123 Galle Road")
                .city("Colombo")
                .district("Colombo")
                .latitude(BigDecimal.valueOf(6.9271))
                .longitude(BigDecimal.valueOf(79.8612))
                .contactPerson("Director of CSR")
                .contactEmail(email)
                .contactPhone("+94112345678")
                .documentUrl("https://storage.googleapis.com/test-docs/brc-sample.pdf")
                .logoUrl("https://images.unsplash.com/photo-1542838132-92c53300491e")
                .build();

        MvcResult profileRes = mockMvc.perform(post("/api/profiles/business")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andReturn();

        String businessId = objectMapper.readTree(profileRes.getResponse().getContentAsString()).get("id").asText();

        // Admin approves business
        VerificationDecisionRequest decision = VerificationDecisionRequest.builder()
                .status(VerificationStatus.VERIFIED)
                .reason("BRC verified with Department of Registrar of Companies.")
                .build();

        mockMvc.perform(post("/api/admin/verifications/BUSINESS/" + businessId + "/decide")
                        .header("Authorization", "Bearer " + getAdminToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(decision)))
                .andExpect(status().isOk());

        return token;
    }

    private String createApprovedCampaign(String charityToken, String title) throws Exception {
        CampaignCreateRequest campReq = CampaignCreateRequest.builder()
                .title(title)
                .description("Urgent distribution of dry ration food packs and water purification kits.")
                .needType(CampaignNeedType.FOOD)
                .district("Monaragala")
                .targetQuantity(100)
                .targetUnit("Relief Kits")
                .startDate(LocalDate.now())
                .endDate(LocalDate.now().plusMonths(2))
                .evidenceUrl("https://storage.googleapis.com/foodbridge-docs/ds-office-letter.pdf")
                .coverImageUrl("https://images.unsplash.com/photo-1488521787991-ed7bbaae773c")
                .paymentInstructions("Bank of Ceylon, Monaragala Branch, A/C: 11223344")
                .handoverInstructions("Drop off at Monaragala Community Hall, 9AM-4PM")
                .build();

        MvcResult campResult = mockMvc.perform(post("/api/campaigns")
                        .header("Authorization", "Bearer " + charityToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(campReq)))
                .andExpect(status().isCreated())
                .andReturn();

        String campaignId = objectMapper.readTree(campResult.getResponse().getContentAsString()).get("id").asText();

        // Admin approves campaign
        mockMvc.perform(post("/api/admin/campaigns/" + campaignId + "/moderate")
                        .header("Authorization", "Bearer " + getAdminToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(CampaignModerationRequest.builder().decision("APPROVE").build())))
                .andExpect(status().isOk());

        return campaignId;
    }

    @Test
    @DisplayName("Complete Partnership Workflow: Proposal -> Counter -> Agreed (Immutable) -> Delivered -> Completed -> Recognition Active")
    void testCompletePartnershipWorkflow() throws Exception {
        String charityToken = createVerifiedCharity("charity.partner@gmail.com", "Sarvodaya Rural Aid", "NGO-CSR-2026");
        String businessToken = createVerifiedBusiness("keells.csr@keells.lk", "Keells Supermarkets CSR", "BRC-KEELLS-001", Role.GROCERY);
        String campaignId = createApprovedCampaign(charityToken, "Clean Water & Nutrition for 100 Families");

        // 1. Business Proposes Partnership
        PartnershipProposeRequest proposeReq = PartnershipProposeRequest.builder()
                .campaignId(UUID.fromString(campaignId))
                .contributionType(ContributionType.MONETARY_PLEDGE)
                .monetaryAmount(BigDecimal.valueOf(50000.00))
                .requestedRecognition("Official Corporate Sustainability Patron")
                .initialMessage("Keells CSR wishes to sponsor 50 water filtration kits with corporate branding on the relief banner.")
                .proposedDeliveryDate(LocalDate.now().plusWeeks(1))
                .build();

        MvcResult proposeRes = mockMvc.perform(post("/api/partnerships/propose")
                        .header("Authorization", "Bearer " + businessToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(proposeReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("PROPOSED"))
                .andExpect(jsonPath("$.recognitionActive").value(false))
                .andExpect(jsonPath("$.monetaryAmount").value(50000.00))
                .andExpect(jsonPath("$.requestedRecognition").value("Official Corporate Sustainability Patron"))
                .andExpect(jsonPath("$.messages", hasSize(1)))
                .andExpect(jsonPath("$.timeline", hasSize(greaterThanOrEqualTo(1))))
                .andReturn();

        String partnershipId = objectMapper.readTree(proposeRes.getResponse().getContentAsString()).get("id").asText();

        // Verify recognition is NOT active initially
        mockMvc.perform(get("/api/partnerships/campaign/" + campaignId + "/recognitions"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(0)));

        // 2. Charity Counter-Proposes terms (increase to 65,000 for logistics and adjust recognition)
        PartnershipCounterRequest counterReq = PartnershipCounterRequest.builder()
                .message("Thank you Keells! Due to transport costs to rural Monaragala, could you sponsor LKR 65,000? We will grant Platinum Impact Partner recognition.")
                .counterContributionType(ContributionType.MONETARY_PLEDGE)
                .counterMonetaryAmount(BigDecimal.valueOf(65000.00))
                .counterRecognition("Platinum Corporate Impact Partner")
                .build();

        mockMvc.perform(post("/api/partnerships/" + partnershipId + "/counter")
                        .header("Authorization", "Bearer " + charityToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(counterReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("COUNTERED"))
                .andExpect(jsonPath("$.lastCounterByRole").value("CHARITY"))
                .andExpect(jsonPath("$.monetaryAmount").value(65000.00))
                .andExpect(jsonPath("$.requestedRecognition").value("Platinum Corporate Impact Partner"))
                .andExpect(jsonPath("$.messages", hasSize(2)));

        // 3. Business Accepts the Counter Terms -> Status becomes AGREED (terms immutable)
        PartnershipAcceptRequest acceptReq = PartnershipAcceptRequest.builder()
                .message("Keells accepts LKR 65,000 for Platinum Corporate Impact Partner.")
                .build();

        MvcResult agreedRes = mockMvc.perform(post("/api/partnerships/" + partnershipId + "/accept")
                        .header("Authorization", "Bearer " + businessToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(acceptReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("AGREED"))
                .andExpect(jsonPath("$.agreedRecognition").value("Platinum Corporate Impact Partner"))
                .andExpect(jsonPath("$.agreedTermsSnapshot").isNotEmpty())
                .andReturn();

        String snapshot = objectMapper.readTree(agreedRes.getResponse().getContentAsString()).get("agreedTermsSnapshot").asText();
        assertTrue(snapshot.contains("\"immutable\":true"));
        assertTrue(snapshot.contains("Platinum Corporate Impact Partner"));

        // 4. Verification that terms cannot be modified once AGREED
        mockMvc.perform(post("/api/partnerships/" + partnershipId + "/counter")
                        .header("Authorization", "Bearer " + charityToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(counterReq)))
                .andExpect(status().isBadRequest());

        // Recognition still not active before completion
        mockMvc.perform(get("/api/partnerships/campaign/" + campaignId + "/recognitions"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(0)));

        // 5. Business Dispatches / Delivers Support
        PartnershipDeliverRequest deliverReq = PartnershipDeliverRequest.builder()
                .deliveryNotes("Bank transfer of LKR 65,000 initiated from Commercial Bank. Ref #TXN-KEELLS-99881.")
                .build();

        mockMvc.perform(post("/api/partnerships/" + partnershipId + "/deliver")
                        .header("Authorization", "Bearer " + businessToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(deliverReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("DELIVERED"))
                .andExpect(jsonPath("$.deliveryNotes").value(containsString("TXN-KEELLS-99881")));

        // 6. Charity Confirms Receipt -> COMPLETED and Platform Activates Recognition!
        PartnershipCompleteRequest completeReq = PartnershipCompleteRequest.builder()
                .completionNotes("Funds verified in Sarvodaya Monaragala account. Water filtration kits ordered for village distribution.")
                .evidenceUrl("https://images.unsplash.com/photo-1542838132-92c53300491e")
                .build();

        mockMvc.perform(post("/api/partnerships/" + partnershipId + "/complete")
                        .header("Authorization", "Bearer " + charityToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(completeReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("COMPLETED"))
                .andExpect(jsonPath("$.recognitionActive").value(true))
                .andExpect(jsonPath("$.agreedRecognition").value("Platinum Corporate Impact Partner"))
                .andExpect(jsonPath("$.campaignContributionId").isNotEmpty());

        // 7. Verify Public Promotional Recognition is now ACTIVE on Campaign Page
        mockMvc.perform(get("/api/partnerships/campaign/" + campaignId + "/recognitions"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].businessName").value("Keells Supermarkets CSR"))
                .andExpect(jsonPath("$[0].recognitionBadge").value("Platinum Corporate Impact Partner"));

        // 8. Verify Admin Monitoring Endpoint can see the partnership
        String adminToken = getAdminToken();
        mockMvc.perform(get("/api/partnerships/admin")
                        .header("Authorization", "Bearer " + adminToken)
                        .param("status", "COMPLETED"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(1))))
                .andExpect(jsonPath("$[0].recognitionActive").value(true));
    }

    @Test
    @DisplayName("Unverified Business cannot propose partnerships (Rule 2 Block)")
    void testUnverifiedBusinessCannotProposePartnership() throws Exception {
        String charityToken = createVerifiedCharity("charity.guard@gmail.com", "Lanka Hope Foundation", "NGO-LH-2026");
        String campaignId = createApprovedCampaign(charityToken, "Clean School Water Campaign");

        // Register business and create profile, but do NOT admin-verify it (status is PENDING)
        String unverifiedBizToken = getAuthToken("unverified.cafe@gmail.com", "CafePass123!", Role.RESTAURANT);

        BusinessProfileDto req = BusinessProfileDto.builder()
                .businessName("Unverified Cafe")
                .businessType(BusinessType.RESTAURANT)
                .description("Pending verification cafe")
                .registrationNumber("BRC-UNVERIFIED-99")
                .addressLine1("123 Street")
                .city("Colombo")
                .district("Colombo")
                .latitude(BigDecimal.valueOf(6.9271))
                .longitude(BigDecimal.valueOf(79.8612))
                .contactPerson("Cafe Owner")
                .contactEmail("unverified.cafe@gmail.com")
                .contactPhone("+94112345678")
                .documentUrl("https://storage.googleapis.com/test-docs/brc-sample.pdf")
                .build();

        mockMvc.perform(post("/api/profiles/business")
                        .header("Authorization", "Bearer " + unverifiedBizToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated());

        PartnershipProposeRequest proposeReq = PartnershipProposeRequest.builder()
                .campaignId(UUID.fromString(campaignId))
                .contributionType(ContributionType.FOOD_ITEMS)
                .quantity(100)
                .unit("Lunch Packs")
                .itemDescription("Nutritious school lunches")
                .requestedRecognition("Official Meal Sponsor")
                .initialMessage("We want to partner!")
                .build();

        mockMvc.perform(post("/api/partnerships/propose")
                        .header("Authorization", "Bearer " + unverifiedBizToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(proposeReq)))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Non-owning Charity cannot accept or complete someone else's partnership")
    void testNonOwningCharityBlocked() throws Exception {
        String charity1Token = createVerifiedCharity("charity.one@gmail.com", "Charity One Relief", "NGO-001");
        String charity2Token = createVerifiedCharity("charity.two@gmail.com", "Charity Two Relief", "NGO-002");
        String businessToken = createVerifiedBusiness("cargills.csr@cargills.lk", "Cargills Food CSR", "BRC-CARG-001", Role.GROCERY);

        String campaignId = createApprovedCampaign(charity1Token, "Charity One Community Mission");

        // Business proposes to Charity 1's campaign
        PartnershipProposeRequest proposeReq = PartnershipProposeRequest.builder()
                .campaignId(UUID.fromString(campaignId))
                .contributionType(ContributionType.FOOD_ITEMS)
                .quantity(50)
                .unit("Dry Ration Bags")
                .itemDescription("Rice and lentils bags")
                .requestedRecognition("Community Nutrition Partner")
                .initialMessage("Cargills wishes to support Charity 1.")
                .build();

        MvcResult res = mockMvc.perform(post("/api/partnerships/propose")
                        .header("Authorization", "Bearer " + businessToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(proposeReq)))
                .andExpect(status().isCreated())
                .andReturn();

        String partnershipId = objectMapper.readTree(res.getResponse().getContentAsString()).get("id").asText();

        // Charity 2 attempts to accept Charity 1's partnership -> 403 Forbidden
        PartnershipAcceptRequest acceptReq = PartnershipAcceptRequest.builder()
                .message("Charity 2 illegally attempting to hijack partnership")
                .build();

        mockMvc.perform(post("/api/partnerships/" + partnershipId + "/accept")
                        .header("Authorization", "Bearer " + charity2Token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(acceptReq)))
                .andExpect(status().isForbidden());
    }
}

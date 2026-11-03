package com.ecoconnect.foodbridge;

import com.ecoconnect.foodbridge.dto.*;
import com.ecoconnect.foodbridge.model.enums.*;
import com.ecoconnect.foodbridge.repository.CampaignContributionRepository;
import com.ecoconnect.foodbridge.repository.SubscriptionRepository;
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
class ContributionTrackingWorkflowTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private CampaignContributionRepository contributionRepository;

    @Autowired
    private SubscriptionRepository subscriptionRepository;

    private String getAuthToken(String email, String password, Role role) throws Exception {
        RegisterRequest register = RegisterRequest.builder()
                .email(email)
                .password(password)
                .fullName("Test " + role.name())
                .phoneNumber("+9477000" + (Math.abs(email.hashCode()) % 10000))
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
                .capacityPeople(500)
                .documentUrl("https://foodbridge-docs.lk/official-cert.pdf")
                .build();

        MvcResult profileRes = mockMvc.perform(post("/api/profiles/charity")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andReturn();

        String charityId = objectMapper.readTree(profileRes.getResponse().getContentAsString()).get("id").asText();

        // Admin verifies the charity
        VerificationDecisionRequest decision = VerificationDecisionRequest.builder()
                .status(VerificationStatus.VERIFIED)
                .reason("Official registration documents verified by Administrator.")
                .build();

        mockMvc.perform(post("/api/admin/verifications/CHARITY/" + charityId + "/decide")
                        .header("Authorization", "Bearer " + getAdminToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(decision)))
                .andExpect(status().isOk());

        return token;
    }

    private String createAndApproveCampaign(String charityToken, String title, int targetQty, String targetUnit) throws Exception {
        CampaignCreateRequest campReq = CampaignCreateRequest.builder()
                .title(title)
                .description("Providing essential relief supplies to rural schools and hamlets.")
                .needType(CampaignNeedType.CLEAN_WATER)
                .district("Monaragala")
                .targetQuantity(targetQty)
                .targetUnit(targetUnit)
                .startDate(LocalDate.now())
                .endDate(LocalDate.now().plusMonths(1))
                .evidenceUrl("https://foodbridge-docs.lk/grama-niladhari-request.pdf")
                .paymentInstructions("Direct Bank Deposit: Bank of Ceylon Monaragala, Acc: 77889900. Email deposit receipt.")
                .handoverInstructions("Drop off at Monaragala Relief Center, Mon-Fri 8am-4pm. Contact: +94771234567.")
                .build();

        MvcResult createRes = mockMvc.perform(post("/api/campaigns")
                        .header("Authorization", "Bearer " + charityToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(campReq)))
                .andExpect(status().isCreated())
                .andReturn();

        String campaignId = objectMapper.readTree(createRes.getResponse().getContentAsString()).get("id").asText();

        // Admin approves campaign (Rule 3)
        mockMvc.perform(post("/api/admin/campaigns/" + campaignId + "/moderate")
                        .header("Authorization", "Bearer " + getAdminToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(CampaignModerationRequest.builder().decision("APPROVE").build())))
                .andExpect(status().isOk());

        return campaignId;
    }

    @Test
    @DisplayName("Complete Contribution Lifecycle: Pledge -> Charity Confirmation (Advances Progress) -> Distribution with Evidence")
    void testCompleteContributionLifecycle() throws Exception {
        String charityToken = createVerifiedCharity("wellawaya.aid@gmail.com", "Wellawaya Care Foundation", "NGO-MO-9001");
        String campaignId = createAndApproveCampaign(charityToken, "Clean Water Filters for 50 Families", 50, "Filters");

        String citizenToken = getAuthToken("citizen.donor2@gmail.com", "Password123!", Role.USER);

        // 1. User pledges a contribution (Money or resources)
        ContributionCreateRequest pledgeReq = ContributionCreateRequest.builder()
                .contributionType(ContributionType.MONETARY_PLEDGE)
                .quantity(20)
                .unit("Filters")
                .monetaryAmount(new BigDecimal("30000.00"))
                .itemDescription("Direct funding pledge for 20 ceramic water filters")
                .notes("Will transfer via online banking today. Reference: DONOR-CW20")
                .build();

        MvcResult pledgeRes = mockMvc.perform(post("/api/campaigns/" + campaignId + "/contributions")
                        .header("Authorization", "Bearer " + citizenToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(pledgeReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status", is("PLEDGED")))
                .andExpect(jsonPath("$.quantity", is(20)))
                .andExpect(jsonPath("$.paymentInstructions", containsString("Bank of Ceylon Monaragala")))
                .andExpect(jsonPath("$.handoverInstructions", containsString("Monaragala Relief Center")))
                .andReturn();

        String contributionId = objectMapper.readTree(pledgeRes.getResponse().getContentAsString()).get("id").asText();

        // 2. CRITICAL RULE: Campaign progress MUST NOT increase while in PLEDGED status
        mockMvc.perform(get("/api/campaigns/" + campaignId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.currentQuantity", is(0)))
                .andExpect(jsonPath("$.progressPercentage", is(0)));

        // 3. Contributor views 'My Contributions'
        mockMvc.perform(get("/api/contributions/my")
                        .header("Authorization", "Bearer " + citizenToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(1))))
                .andExpect(jsonPath("$[0].id", is(contributionId)))
                .andExpect(jsonPath("$[0].status", is("PLEDGED")))
                .andExpect(jsonPath("$[0].campaignTitle", is("Clean Water Filters for 50 Families")));

        // 4. Receiving charity views incoming contributions
        mockMvc.perform(get("/api/charity/contributions?status=PLEDGED")
                        .header("Authorization", "Bearer " + charityToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(1))))
                .andExpect(jsonPath("$[0].id", is(contributionId)));

        // 5. Receiving charity confirms receipt of funds/supplies
        ContributionConfirmRequest confirmReq = ContributionConfirmRequest.builder()
                .notes("Bank deposit verified with transaction ref TXN9988.")
                .build();

        mockMvc.perform(post("/api/contributions/" + contributionId + "/confirm")
                        .header("Authorization", "Bearer " + charityToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(confirmReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("CONFIRMED")))
                .andExpect(jsonPath("$.confirmedByName", notNullValue()))
                .andExpect(jsonPath("$.confirmedAt", notNullValue()));

        // 6. CRITICAL RULE: Campaign progress is updated ONLY from CONFIRMED contributions!
        mockMvc.perform(get("/api/campaigns/" + campaignId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.currentQuantity", is(20)))
                .andExpect(jsonPath("$.progressPercentage", is(40))); // 20/50 = 40%

        // 7. Receiving charity delivers aid and uploads distribution evidence
        ContributionDistributeRequest distributeReq = ContributionDistributeRequest.builder()
                .evidenceUrl("https://storage.foodbridge.lk/distribution-wellawaya-filters.jpg")
                .notes("Handed over 20 ceramic filter units to Wellawaya North Grama Niladhari division.")
                .distributionDate(LocalDate.now())
                .build();

        mockMvc.perform(post("/api/contributions/" + contributionId + "/distribute")
                        .header("Authorization", "Bearer " + charityToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(distributeReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("DISTRIBUTED")))
                .andExpect(jsonPath("$.distributionEvidenceUrl", is("https://storage.foodbridge.lk/distribution-wellawaya-filters.jpg")))
                .andExpect(jsonPath("$.distributionNotes", containsString("Handed over 20 ceramic filter units")));

        // 8. Contributor can see the distribution evidence in My Contributions
        mockMvc.perform(get("/api/contributions/" + contributionId)
                        .header("Authorization", "Bearer " + citizenToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("DISTRIBUTED")))
                .andExpect(jsonPath("$.distributionEvidenceUrl", is("https://storage.foodbridge.lk/distribution-wellawaya-filters.jpg")));
    }

    @Test
    @DisplayName("Pledges to Unapproved (PENDING) Campaigns are strictly rejected")
    void testPledgeToUnapprovedCampaignBlocked() throws Exception {
        String charityToken = createVerifiedCharity("polon.aid@gmail.com", "Polonnaruwa Flood Aid", "NGO-PO-5511");

        CampaignCreateRequest campReq = CampaignCreateRequest.builder()
                .title("Dry Rations for Polonnaruwa")
                .description("Pending flood relief campaign.")
                .needType(CampaignNeedType.FOOD)
                .district("Polonnaruwa")
                .targetQuantity(100)
                .targetUnit("Packs")
                .startDate(LocalDate.now())
                .endDate(LocalDate.now().plusMonths(1))
                .evidenceUrl("https://foodbridge-docs.lk/polon-flood.pdf")
                .build();

        MvcResult res = mockMvc.perform(post("/api/campaigns")
                        .header("Authorization", "Bearer " + charityToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(campReq)))
                .andExpect(status().isCreated())
                .andReturn();

        String campaignId = objectMapper.readTree(res.getResponse().getContentAsString()).get("id").asText();

        String userToken = getAuthToken("citizen.pledger@gmail.com", "Password123!", Role.USER);
        ContributionCreateRequest pledgeReq = ContributionCreateRequest.builder()
                .contributionType(ContributionType.FOOD_ITEMS)
                .quantity(10)
                .build();

        // Attempting to pledge to campaign still in PENDING_APPROVAL status must fail
        mockMvc.perform(post("/api/campaigns/" + campaignId + "/contributions")
                        .header("Authorization", "Bearer " + userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(pledgeReq)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("Contributions can only be pledged to active approved campaigns")));
    }

    @Test
    @DisplayName("Non-owning charity is blocked from confirming or distributing other charities' campaign pledges")
    void testNonOwningCharityBlockedFromConfirming() throws Exception {
        String charity1Token = createVerifiedCharity("charity1@gmail.com", "Kandy Relief Trust", "NGO-KD-1111");
        String charity2Token = createVerifiedCharity("charity2@gmail.com", "Galle Foundation", "NGO-GL-2222");

        String campaignId = createAndApproveCampaign(charity1Token, "Kandy Book Drive", 100, "Books");

        String userToken = getAuthToken("citizen.books@gmail.com", "Password123!", Role.USER);
        ContributionCreateRequest pledgeReq = ContributionCreateRequest.builder()
                .contributionType(ContributionType.OTHER_RESOURCES)
                .quantity(30)
                .unit("Books")
                .itemDescription("30 Sinhala/English storybooks for primary grade")
                .build();

        MvcResult res = mockMvc.perform(post("/api/campaigns/" + campaignId + "/contributions")
                        .header("Authorization", "Bearer " + userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(pledgeReq)))
                .andExpect(status().isCreated())
                .andReturn();

        String contributionId = objectMapper.readTree(res.getResponse().getContentAsString()).get("id").asText();

        // Charity 2 attempts to confirm contribution for Charity 1's campaign -> must be 403 Forbidden
        mockMvc.perform(post("/api/contributions/" + contributionId + "/confirm")
                        .header("Authorization", "Bearer " + charity2Token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(ContributionConfirmRequest.builder().notes("Unauthorized").build())))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Business Donors (RESTAURANT / GROCERY) can pledge corporate contributions and track in My Contributions")
    void testBusinessDonorPledgeAndTracking() throws Exception {
        String charityToken = createVerifiedCharity("jaffna.charity@gmail.com", "Jaffna Care Team", "NGO-JF-3333");
        String campaignId = createAndApproveCampaign(charityToken, "Nutritional Meals for Children", 80, "Meals");

        String businessToken = getAuthToken("freshgrocer.colombo@gmail.com", "BizPass123!", Role.GROCERY);

        ContributionCreateRequest pledgeReq = ContributionCreateRequest.builder()
                .contributionType(ContributionType.FOOD_ITEMS)
                .quantity(25)
                .unit("Fresh Meal Packs")
                .itemDescription("25 Fresh fruit and nutritional meal packs from Colombo grocery store")
                .contributorName("Fresh Grocer PLC (CSR Division)")
                .notes("Corporate CSR donation. Handover via refrigerated transport.")
                .build();

        MvcResult pledgeRes = mockMvc.perform(post("/api/campaigns/" + campaignId + "/contributions")
                        .header("Authorization", "Bearer " + businessToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(pledgeReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status", is("PLEDGED")))
                .andExpect(jsonPath("$.contributorName", is("Fresh Grocer PLC (CSR Division)")))
                .andReturn();

        String contributionId = objectMapper.readTree(pledgeRes.getResponse().getContentAsString()).get("id").asText();

        // Business views My Contributions
        mockMvc.perform(get("/api/contributions/my")
                        .header("Authorization", "Bearer " + businessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(1))))
                .andExpect(jsonPath("$[0].id", is(contributionId)))
                .andExpect(jsonPath("$[0].contributorName", is("Fresh Grocer PLC (CSR Division)")));
    }

    @Test
    @DisplayName("Rule 8: Contribution records are completely isolated from platform subscription revenue")
    void testContributionsSeparateFromPlatformRevenue() throws Exception {
        long initialSubscriptionsCount = subscriptionRepository.count();

        String charityToken = createVerifiedCharity("anuradhapura.aid@gmail.com", "Anuradhapura Farmers Aid", "NGO-AN-7700");
        String campaignId = createAndApproveCampaign(charityToken, "Emergency Drought Relief", 100, "Water Cans");

        String userToken = getAuthToken("revenue.isolation.user@gmail.com", "Pass12345!", Role.USER);
        ContributionCreateRequest pledgeReq = ContributionCreateRequest.builder()
                .contributionType(ContributionType.MONETARY_PLEDGE)
                .quantity(50)
                .monetaryAmount(new BigDecimal("50000.00"))
                .unit("Water Cans")
                .itemDescription("Direct funding for 50 water distribution tanks")
                .build();

        MvcResult pledgeRes = mockMvc.perform(post("/api/campaigns/" + campaignId + "/contributions")
                        .header("Authorization", "Bearer " + userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(pledgeReq)))
                .andExpect(status().isCreated())
                .andReturn();

        String contributionId = objectMapper.readTree(pledgeRes.getResponse().getContentAsString()).get("id").asText();

        // Charity confirms receipt
        mockMvc.perform(post("/api/contributions/" + contributionId + "/confirm")
                        .header("Authorization", "Bearer " + charityToken))
                .andExpect(status().isOk());

        // Platform subscriptions count must remain completely unchanged
        long currentSubscriptionsCount = subscriptionRepository.count();
        assertEquals(initialSubscriptionsCount, currentSubscriptionsCount,
                "Campaign contributions must not create or alter platform subscriptions or revenue ledgers");

        // Contribution must be present in campaign_contributions table
        assertTrue(contributionRepository.findById(UUID.fromString(contributionId)).isPresent(),
                "Contribution must be stored in campaign_contributions table");
    }
}

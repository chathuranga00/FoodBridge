package com.ecoconnect.foodbridge;

import com.ecoconnect.foodbridge.dto.*;
import com.ecoconnect.foodbridge.model.AuditLog;
import com.ecoconnect.foodbridge.model.enums.*;
import com.ecoconnect.foodbridge.repository.AuditLogRepository;
import com.ecoconnect.foodbridge.repository.CampaignRepository;
import com.ecoconnect.foodbridge.repository.CampaignUpdateRepository;
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
import java.time.LocalDate;
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
class CampaignWorkflowTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private CampaignRepository campaignRepository;

    @Autowired
    private CampaignUpdateRepository campaignUpdateRepository;

    @Autowired
    private AuditLogRepository auditLogRepository;

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

    private CharityProfileDto createCharityProfile(String token, String regNo, String name) throws Exception {
        CharityProfileDto profile = CharityProfileDto.builder()
                .charityName(name)
                .registrationNumber(regNo)
                .description("Dedicated to rural community upliftment and zero hunger")
                .operatingArea("Monaragala and Uva Province")
                .documentUrl("https://foodbridge-docs.lk/" + regNo + ".pdf")
                .contactPerson("Dr. Sarath Gunawardena")
                .contactEmail("info@" + regNo.toLowerCase() + ".org")
                .contactPhone("+94552233444")
                .addressLine1("45 Temple Road")
                .city("Monaragala")
                .district("Monaragala")
                .latitude(BigDecimal.valueOf(6.8714))
                .longitude(BigDecimal.valueOf(81.3487))
                .capacityPeople(500)
                .build();

        MvcResult res = mockMvc.perform(post("/api/profiles/charity")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(profile)))
                .andExpect(status().isCreated())
                .andReturn();

        return objectMapper.readValue(res.getResponse().getContentAsString(), CharityProfileDto.class);
    }

    private void verifyCharity(String adminToken, UUID charityId) throws Exception {
        VerificationDecisionRequest decide = VerificationDecisionRequest.builder()
                .status(VerificationStatus.VERIFIED)
                .reason("Legitimate registered NGO with verified community track record")
                .build();

        mockMvc.perform(post("/api/admin/verifications/CHARITY/" + charityId + "/decide")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(decide)))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Unverified Charity cannot create campaigns (Rule 2)")
    void unverifiedCharity_cannotCreateCampaign_failsRule2() throws Exception {
        String charityToken = getAuthToken("pending.charity@gmail.com", "CharityPass123!", Role.CHARITY);
        createCharityProfile(charityToken, "NGO-PENDING-01", "Pending Rural Aid");

        CampaignCreateRequest req = CampaignCreateRequest.builder()
                .title("Monaragala Dry Zone Drinking Water Relief")
                .description("Distributing 200 water purification filters to dry zone villages")
                .needType(CampaignNeedType.CLEAN_WATER)
                .district("Monaragala")
                .targetQuantity(200)
                .targetUnit("water filters")
                .startDate(LocalDate.now())
                .endDate(LocalDate.now().plusMonths(1))
                .evidenceUrl("https://foodbridge-docs.lk/grama-niladhari-request.pdf")
                .build();

        mockMvc.perform(post("/api/campaigns")
                        .header("Authorization", "Bearer " + charityToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("Rule 2 violation: Charity account must be admin-VERIFIED")));
    }

    @Test
    @DisplayName("Verified Charity creates campaign; starts PENDING_APPROVAL and hidden from public (Rule 3)")
    void verifiedCharity_createsCampaign_startsPending() throws Exception {
        String charityToken = getAuthToken("verified.charity@gmail.com", "CharityPass123!", Role.CHARITY);
        CharityProfileDto profile = createCharityProfile(charityToken, "NGO-VERIFIED-01", "Lanka Rural Care");
        verifyCharity(getAdminToken(), profile.getId());

        CampaignCreateRequest req = CampaignCreateRequest.builder()
                .title("Bibile Remote School Supplies & Book Drive")
                .description("Providing essential stationery, exercise books, and school kits for 350 rural primary students.")
                .needType(CampaignNeedType.SCHOOL_SUPPLIES)
                .district("Monaragala")
                .targetQuantity(350)
                .targetUnit("stationery kits")
                .startDate(LocalDate.now())
                .endDate(LocalDate.now().plusMonths(2))
                .coverImageUrl("https://foodbridge-images.lk/school-drive.jpg")
                .evidenceUrl("https://foodbridge-docs.lk/bibile-school-letter.pdf")
                .targetBeneficiariesCount(350)
                .build();

        MvcResult res = mockMvc.perform(post("/api/campaigns")
                        .header("Authorization", "Bearer " + charityToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.title", is("Bibile Remote School Supplies & Book Drive")))
                .andExpect(jsonPath("$.status", is("PENDING_APPROVAL")))
                .andExpect(jsonPath("$.charityVerified", is(true)))
                .andExpect(jsonPath("$.progressPercentage", is(0)))
                .andExpect(jsonPath("$.district", is("Monaragala")))
                .andReturn();

        String campaignId = objectMapper.readTree(res.getResponse().getContentAsString()).get("id").asText();

        // Must NOT appear in public browse while PENDING
        mockMvc.perform(get("/api/campaigns"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.id == '" + campaignId + "')]", hasSize(0)));
    }

    @Test
    @DisplayName("Admin moderates campaign with approval and audit log entry, making it public")
    void adminModeration_approvesCampaign_appearsPublicly() throws Exception {
        String charityToken = getAuthToken("admin.mod.charity@gmail.com", "CharityPass123!", Role.CHARITY);
        CharityProfileDto profile = createCharityProfile(charityToken, "NGO-MOD-01", "Highland Community Support");
        verifyCharity(getAdminToken(), profile.getId());

        CampaignCreateRequest req = CampaignCreateRequest.builder()
                .title("Nuwara Eliya Estate Family Nutrition Kits")
                .description("Delivering family nutrition packs of dhal, rice, soya, and dry milk to tea plantation communities.")
                .needType(CampaignNeedType.FOOD)
                .district("Nuwara Eliya")
                .targetQuantity(500)
                .targetUnit("food packs")
                .startDate(LocalDate.now())
                .endDate(LocalDate.now().plusMonths(1))
                .evidenceUrl("https://foodbridge-docs.lk/divisional-secretary-request.pdf")
                .build();

        MvcResult createRes = mockMvc.perform(post("/api/campaigns")
                        .header("Authorization", "Bearer " + charityToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andReturn();

        String campaignId = objectMapper.readTree(createRes.getResponse().getContentAsString()).get("id").asText();

        String adminToken = getAdminToken();

        // 1. Admin checks pending campaigns
        mockMvc.perform(get("/api/admin/campaigns/pending")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.id == '" + campaignId + "')]", hasSize(1)));

        // 2. Admin approves campaign
        CampaignModerationRequest modReq = CampaignModerationRequest.builder()
                .decision("APPROVE")
                .reason("Verified with Nuwara Eliya Divisional Secretariat letter. Legitimate need.")
                .build();

        mockMvc.perform(post("/api/admin/campaigns/" + campaignId + "/moderate")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(modReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("ACTIVE")))
                .andExpect(jsonPath("$.approvalNotes", containsString("Divisional Secretariat")));

        // 3. Verify audit log entry
        List<AuditLog> logs = auditLogRepository.findByEntityNameAndEntityIdOrderByCreatedAtDesc("CAMPAIGN", UUID.fromString(campaignId));
        assertThat(logs).isNotEmpty();
        assertThat(logs.get(0).getAction()).isEqualTo("CAMPAIGN_MODERATION_APPROVE");

        // 4. Verify public visibility with filters
        mockMvc.perform(get("/api/campaigns")
                        .param("needType", "FOOD")
                        .param("district", "Nuwara Eliya"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.id == '" + campaignId + "')]", hasSize(1)))
                .andExpect(jsonPath("$[0].charityVerified", is(true)))
                .andExpect(jsonPath("$[0].district", is("Nuwara Eliya")));
    }

    @Test
    @DisplayName("Charity posts field distribution updates with photos, updating campaign progress")
    void charityPostsDistributionUpdates_updatesProgress() throws Exception {
        String charityToken = getAuthToken("update.charity@gmail.com", "CharityPass123!", Role.CHARITY);
        CharityProfileDto profile = createCharityProfile(charityToken, "NGO-UPDATE-01", "Batticaloa Welfare Network");
        verifyCharity(getAdminToken(), profile.getId());

        CampaignCreateRequest req = CampaignCreateRequest.builder()
                .title("Batticaloa Coastal Family Essentials Drive")
                .description("Providing hygiene products and family survival kits following flash floods.")
                .needType(CampaignNeedType.FAMILY_ESSENTIALS)
                .district("Batticaloa")
                .targetQuantity(400)
                .targetUnit("hygiene kits")
                .startDate(LocalDate.now())
                .endDate(LocalDate.now().plusMonths(1))
                .evidenceUrl("https://foodbridge-docs.lk/disaster-management-center.pdf")
                .build();

        MvcResult createRes = mockMvc.perform(post("/api/campaigns")
                        .header("Authorization", "Bearer " + charityToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andReturn();

        String campaignId = objectMapper.readTree(createRes.getResponse().getContentAsString()).get("id").asText();
        UUID campaignUuid = UUID.fromString(campaignId);

        // Approve campaign
        String adminToken = getAdminToken();
        CampaignModerationRequest modReq = CampaignModerationRequest.builder().decision("APPROVE").build();
        mockMvc.perform(post("/api/admin/campaigns/" + campaignId + "/moderate")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(modReq)))
                .andExpect(status().isOk());

        // Charity posts Phase 1 field distribution update
        CampaignUpdateRequest updateReq = CampaignUpdateRequest.builder()
                .title("Phase 1: 100 Kits Handed to Vakarai Families")
                .description("Successfully distributed 100 emergency hygiene kits with local volunteer support.")
                .photoUrl("https://foodbridge-photos.lk/vakarai-distribution.jpg")
                .quantityDistributed(100)
                .distributionDate(LocalDate.now())
                .build();

        mockMvc.perform(post("/api/campaigns/" + campaignId + "/updates")
                        .header("Authorization", "Bearer " + charityToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.title", containsString("Phase 1")))
                .andExpect(jsonPath("$.quantityDistributed", is(100)));

        // Check campaign progress updated (100 / 400 = 25%)
        mockMvc.perform(get("/api/campaigns/" + campaignId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.currentQuantity", is(100)))
                .andExpect(jsonPath("$.progressPercentage", is(25)));

        // Verify public updates endpoint
        mockMvc.perform(get("/api/campaigns/" + campaignId + "/updates"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].title", containsString("Phase 1")));
    }

    @Test
    @DisplayName("Community member pledges support, incrementing campaign progress")
    void communityMemberPledges_incrementsProgress() throws Exception {
        String charityToken = getAuthToken("pledge.charity@gmail.com", "CharityPass123!", Role.CHARITY);
        CharityProfileDto profile = createCharityProfile(charityToken, "NGO-PLEDGE-01", "Sabaragamuwa Aid");
        verifyCharity(getAdminToken(), profile.getId());

        CampaignCreateRequest req = CampaignCreateRequest.builder()
                .title("Ratnapura Community Clean Water Filters")
                .description("Providing gravity water filters for flood-prone village clinics.")
                .needType(CampaignNeedType.CLEAN_WATER)
                .district("Ratnapura")
                .targetQuantity(100)
                .targetUnit("gravity filters")
                .startDate(LocalDate.now())
                .endDate(LocalDate.now().plusMonths(1))
                .evidenceUrl("https://foodbridge-docs.lk/clinic-request.pdf")
                .build();

        MvcResult createRes = mockMvc.perform(post("/api/campaigns")
                        .header("Authorization", "Bearer " + charityToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andReturn();

        String campaignId = objectMapper.readTree(createRes.getResponse().getContentAsString()).get("id").asText();

        // Approve campaign
        mockMvc.perform(post("/api/admin/campaigns/" + campaignId + "/moderate")
                        .header("Authorization", "Bearer " + getAdminToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(CampaignModerationRequest.builder().decision("APPROVE").build())))
                .andExpect(status().isOk());

        String userToken = getAuthToken("citizen.donor@gmail.com", "UserPass123!", Role.USER);
        CampaignPledgeRequest pledgeReq = CampaignPledgeRequest.builder()
                .pledgeQuantity(15)
                .itemDescription("15 Ceramic filter candles with buckets")
                .notes("Will drop off at Monaragala collection center on Saturday.")
                .build();

        mockMvc.perform(post("/api/campaigns/" + campaignId + "/pledge")
                        .header("Authorization", "Bearer " + userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(pledgeReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.currentQuantity", is(15)))
                .andExpect(jsonPath("$.progressPercentage", is(15)));
    }
}

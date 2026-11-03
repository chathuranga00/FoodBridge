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
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("local")
class BusinessSubscriptionTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BusinessRepository businessRepository;

    @Autowired
    private CharityRepository charityRepository;

    @Autowired
    private CampaignRepository campaignRepository;

    @Autowired
    private CampaignContributionRepository contributionRepository;

    @Autowired
    private PromotionRepository promotionRepository;

    @Autowired
    private BusinessSubscriptionRepository subscriptionRepository;

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

        JsonNode root = objectMapper.readTree(result.getResponse().getContentAsString());
        return root.has("accessToken") ? root.get("accessToken").asText() : (root.has("token") ? root.get("token").asText() : "");
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

    private Business createTestBusiness(String email, String name, BusinessType type) throws Exception {
        getAuthToken(email, "Password123!", Role.RESTAURANT);
        User user = userRepository.findByEmail(email).orElseThrow();

        Business b = Business.builder()
                .user(user)
                .businessName(name)
                .businessType(type)
                .registrationNumber("BR-" + UUID.randomUUID().toString().substring(0, 8))
                .description("Sustainable culinary and grocery establishment in Sri Lanka")
                .addressLine1("123 Galle Road")
                .city("Colombo 03")
                .district("Colombo")
                .latitude(BigDecimal.valueOf(6.9271))
                .longitude(BigDecimal.valueOf(79.8612))
                .contactPerson("Chef Silva")
                .contactPhone("+94112345678")
                .contactEmail(email)
                .verificationStatus(VerificationStatus.VERIFIED)
                .isFeatured(false)
                .build();

        return businessRepository.save(b);
    }

    private Charity createTestCharity(String email, String name) throws Exception {
        getAuthToken(email, "Password123!", Role.CHARITY);
        User user = userRepository.findByEmail(email).orElseThrow();

        Charity c = Charity.builder()
                .user(user)
                .charityName(name)
                .registrationNumber("CH-" + UUID.randomUUID().toString().substring(0, 8))
                .description("Rural food security trust")
                .addressLine1("45 Temple Road")
                .city("Kandy")
                .district("Kandy")
                .latitude(BigDecimal.valueOf(7.2906))
                .longitude(BigDecimal.valueOf(80.6337))
                .contactPerson("Dr. Perera")
                .contactPhone("+94812345678")
                .contactEmail(email)
                .verificationStatus(VerificationStatus.VERIFIED)
                .build();

        return charityRepository.save(c);
    }

    private Campaign createTestCampaign(Charity charity, String title) {
        Campaign campaign = Campaign.builder()
                .charity(charity)
                .organizerType(CampaignOrganizerType.CHARITY)
                .title(title)
                .description("Emergency nutrition assistance for rural communities")
                .needType(CampaignNeedType.FOOD)
                .district("Kandy")
                .targetQuantity(100)
                .currentQuantity(0)
                .targetUnit("packs")
                .startDate(LocalDate.now())
                .endDate(LocalDate.now().plusDays(30))
                .status(CampaignStatus.ACTIVE)
                .build();

        return campaignRepository.save(campaign);
    }

    @Test
    @DisplayName("Public packages endpoint: returns available tiers (Free, Promotion, Premium)")
    void getPackages_returnsAvailableTiers() throws Exception {
        mockMvc.perform(get("/api/subscriptions/packages"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(3)))
                .andExpect(jsonPath("$[0].plan").value("FREE"))
                .andExpect(jsonPath("$[0].maxPromotions").value(1))
                .andExpect(jsonPath("$[1].plan").value("PROMOTION"))
                .andExpect(jsonPath("$[1].maxPromotions").value(5))
                .andExpect(jsonPath("$[2].plan").value("PREMIUM"))
                .andExpect(jsonPath("$[2].hasSponsoredCampaigns").value(true));
    }

    @Test
    @DisplayName("Default Subscription: new business defaults to FREE package with 1 active promo limit")
    void defaultSubscription_isFreeStarter() throws Exception {
        String email = "free.biz." + UUID.randomUUID() + "@foodbridge.lk";
        createTestBusiness(email, "Free Cafe", BusinessType.RESTAURANT);
        String token = getAuthToken(email, "Password123!", Role.RESTAURANT);

        mockMvc.perform(get("/api/subscriptions/current")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.plan").value("FREE"))
                .andExpect(jsonPath("$.maxPromotions").value(1))
                .andExpect(jsonPath("$.hasAnalytics").value(false))
                .andExpect(jsonPath("$.hasFeaturedPlacement").value(false))
                .andExpect(jsonPath("$.hasSponsoredCampaigns").value(false))
                .andExpect(jsonPath("$.isActive").value(true));
    }

    @Test
    @DisplayName("Feature Gating: Free tier can create 1 active promo, but 2nd active promo is rejected with 400")
    void freeTier_exceedingPromoLimit_isRejected() throws Exception {
        String email = "limit.biz." + UUID.randomUUID() + "@foodbridge.lk";
        createTestBusiness(email, "Limit Bakery", BusinessType.RESTAURANT);
        String token = getAuthToken(email, "Password123!", Role.RESTAURANT);

        // 1st active promotion succeeds
        PromotionRequestDto promo1 = PromotionRequestDto.builder()
                .title("First 20% Off Promo")
                .promotionType(PromotionType.PROMOTIONAL_OFFER)
                .startDate(OffsetDateTime.now())
                .endDate(OffsetDateTime.now().plusDays(14))
                .isActive(true)
                .build();

        mockMvc.perform(post("/api/promotions")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(promo1)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.title").value("First 20% Off Promo"));

        // 2nd active promotion rejected with 400 Bad Request
        PromotionRequestDto promo2 = PromotionRequestDto.builder()
                .title("Second Promo Attempt")
                .promotionType(PromotionType.PROMOTIONAL_OFFER)
                .startDate(OffsetDateTime.now())
                .endDate(OffsetDateTime.now().plusDays(14))
                .isActive(true)
                .build();

        mockMvc.perform(post("/api/promotions")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(promo2)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("maximum of 1 active promotion")));
    }

    @Test
    @DisplayName("Feature Gating: Free tier cannot create or update to FEATURED_PROFILE")
    void freeTier_featuredProfilePlacement_isBlocked() throws Exception {
        String email = "featured.biz." + UUID.randomUUID() + "@foodbridge.lk";
        createTestBusiness(email, "Featured Bistro", BusinessType.RESTAURANT);
        String token = getAuthToken(email, "Password123!", Role.RESTAURANT);

        PromotionRequestDto featuredPromo = PromotionRequestDto.builder()
                .title("Featured Placement Attempt")
                .promotionType(PromotionType.FEATURED_PROFILE)
                .startDate(OffsetDateTime.now())
                .endDate(OffsetDateTime.now().plusDays(30))
                .isActive(true)
                .build();

        mockMvc.perform(post("/api/promotions")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(featuredPromo)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("Featured profile placement requires a Promotion or Premium subscription")));
    }

    @Test
    @DisplayName("Feature Gating: Free tier analytics is gated with zeroed CTR and detailed endpoint throws 400")
    void freeTier_analyticsGating_masksMetricsAndRejectsDetailed() throws Exception {
        String email = "analytics.biz." + UUID.randomUUID() + "@foodbridge.lk";
        createTestBusiness(email, "Analytics Cafe", BusinessType.RESTAURANT);
        String token = getAuthToken(email, "Password123!", Role.RESTAURANT);

        // Standard analytics returns isGated = true and masked metrics
        mockMvc.perform(get("/api/promotions/analytics")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.isGated").value(true))
                .andExpect(jsonPath("$.currentPlan").value("FREE"))
                .andExpect(jsonPath("$.totalViews").value(0))
                .andExpect(jsonPath("$.totalClicks").value(0))
                .andExpect(jsonPath("$.averageCtr").value(0.0));

        // Detailed analytics endpoint throws 400
        mockMvc.perform(get("/api/promotions/analytics/detailed")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("Detailed promotional analytics require an active Promotion or Premium subscription")));
    }

    @Test
    @DisplayName("Subscription Lifecycle: Subscribe (Pending) -> Admin Activate -> Admin Renew -> Admin Cancel")
    void subscriptionLifecycle_fullWorkflow() throws Exception {
        String bizEmail = "upgrade.biz." + UUID.randomUUID() + "@foodbridge.lk";
        Business business = createTestBusiness(bizEmail, "Upgrade Supermarket", BusinessType.GROCERY);
        String bizToken = getAuthToken(bizEmail, "Password123!", Role.GROCERY);
        String adminToken = getAdminToken();

        // 1. Business subscribes to PROMOTION plan
        SubscribeRequestDto subReq = SubscribeRequestDto.builder()
                .plan(SubscriptionPlan.PROMOTION)
                .billingCycle(BillingCycle.MONTHLY)
                .paymentReference("BOC-TRANSFER-884920")
                .notes("Payment slip uploaded for monthly growth package")
                .build();

        MvcResult subResult = mockMvc.perform(post("/api/subscriptions/subscribe")
                        .header("Authorization", "Bearer " + bizToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(subReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.plan").value("PROMOTION"))
                .andExpect(jsonPath("$.status").value("PENDING_ACTIVATION"))
                .andExpect(jsonPath("$.priceLkr").value(4500.00))
                .andExpect(jsonPath("$.invoiceNumber", startsWith("INV-SUB-")))
                .andReturn();

        UUID subId = UUID.fromString(objectMapper.readTree(subResult.getResponse().getContentAsString()).get("id").asText());

        // 2. Admin views pending subscriptions
        mockMvc.perform(get("/api/admin/subscriptions")
                        .header("Authorization", "Bearer " + adminToken)
                        .param("status", "PENDING_ACTIVATION"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[*].id", hasItem(subId.toString())));

        // 3. Admin activates subscription
        AdminSubscriptionActionDto activateAction = AdminSubscriptionActionDto.builder()
                .notes("Bank transfer verified in platform account")
                .build();

        mockMvc.perform(post("/api/admin/subscriptions/" + subId + "/activate")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(activateAction)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("ACTIVE"))
                .andExpect(jsonPath("$.maxPromotions").value(5))
                .andExpect(jsonPath("$.hasAnalytics").value(true));

        // 4. Now business has unlocked 5 active promotions and detailed analytics!
        mockMvc.perform(get("/api/promotions/analytics/detailed")
                        .header("Authorization", "Bearer " + bizToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.isGated").value(false))
                .andExpect(jsonPath("$.currentPlan").value("PROMOTION"))
                .andExpect(jsonPath("$.maxAllowedPromotions").value(5));

        // 5. Admin renews subscription by +30 days
        AdminSubscriptionActionDto renewAction = AdminSubscriptionActionDto.builder()
                .extensionDays(30)
                .notes("Renewed for next billing cycle")
                .build();

        mockMvc.perform(post("/api/admin/subscriptions/" + subId + "/renew")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(renewAction)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("ACTIVE"));

        // 6. Admin cancels subscription
        mockMvc.perform(post("/api/admin/subscriptions/" + subId + "/cancel")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(AdminSubscriptionActionDto.builder().notes("Cancelled by user request").build())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CANCELLED"));
    }

    @Test
    @DisplayName("Sponsored Sustainability Campaigns: Only PREMIUM subscribers can sponsor community campaigns")
    void sponsoredCampaigns_premiumGating() throws Exception {
        Charity charity = createTestCharity("charity." + UUID.randomUUID() + "@foodbridge.lk", "Vulnerable Children Relief");
        Campaign campaign = createTestCampaign(charity, "Rural Child Nutrition Support 2026");

        String nonPremEmail = "standard.biz." + UUID.randomUUID() + "@foodbridge.lk";
        createTestBusiness(nonPremEmail, "Standard Restaurant", BusinessType.RESTAURANT);
        String nonPremToken = getAuthToken(nonPremEmail, "Password123!", Role.RESTAURANT);

        CampaignSponsorRequest sponsorReq = CampaignSponsorRequest.builder()
                .message("Proudly sponsored by Standard Restaurant")
                .amountLkr(BigDecimal.valueOf(15000.00))
                .build();

        // 1. Free/non-premium tier rejected with 400
        mockMvc.perform(post("/api/campaigns/" + campaign.getId() + "/sponsor")
                        .header("Authorization", "Bearer " + nonPremToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(sponsorReq)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("exclusive to Premium subscription partners")));

        // 2. Upgrade to PREMIUM and activate
        String premEmail = "premium.biz." + UUID.randomUUID() + "@foodbridge.lk";
        Business premBiz = createTestBusiness(premEmail, "Ceylon Royal Tea & Spices", BusinessType.RESTAURANT);
        String premToken = getAuthToken(premEmail, "Password123!", Role.RESTAURANT);
        String adminToken = getAdminToken();

        MvcResult subRes = mockMvc.perform(post("/api/subscriptions/subscribe")
                        .header("Authorization", "Bearer " + premToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(SubscribeRequestDto.builder()
                                .plan(SubscriptionPlan.PREMIUM)
                                .billingCycle(BillingCycle.ANNUAL)
                                .paymentReference("TRANSFER-PREM-9912")
                                .build())))
                .andExpect(status().isCreated())
                .andReturn();

        UUID premSubId = UUID.fromString(objectMapper.readTree(subRes.getResponse().getContentAsString()).get("id").asText());
        mockMvc.perform(post("/api/admin/subscriptions/" + premSubId + "/activate")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk());

        // 3. Premium business can sponsor campaign!
        CampaignSponsorRequest validSponsor = CampaignSponsorRequest.builder()
                .message("Proudly sponsored by Ceylon Royal Tea & Spices - Fueling Green Sri Lanka")
                .amountLkr(BigDecimal.valueOf(50000.00))
                .build();

        mockMvc.perform(post("/api/campaigns/" + campaign.getId() + "/sponsor")
                        .header("Authorization", "Bearer " + premToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validSponsor)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.isSponsored").value(true))
                .andExpect(jsonPath("$.sponsorBusinessName").value("Ceylon Royal Tea & Spices"))
                .andExpect(jsonPath("$.sponsorshipMessage").value("Proudly sponsored by Ceylon Royal Tea & Spices - Fueling Green Sri Lanka"));
    }

    @Test
    @DisplayName("Financial Segregation (Rule 8): Subscription fees are strictly segregated from charity donations")
    void financialSegregation_subscriptionFeesNeverMixWithCharityContributions() throws Exception {
        long charityContributionsBefore = contributionRepository.count();

        String bizEmail = "segregation.biz." + UUID.randomUUID() + "@foodbridge.lk";
        createTestBusiness(bizEmail, "Segregation Test Bakery", BusinessType.RESTAURANT);
        String bizToken = getAuthToken(bizEmail, "Password123!", Role.RESTAURANT);
        String adminToken = getAdminToken();

        // 1. Subscribe to PREMIUM
        MvcResult subRes = mockMvc.perform(post("/api/subscriptions/subscribe")
                        .header("Authorization", "Bearer " + bizToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(SubscribeRequestDto.builder()
                                .plan(SubscriptionPlan.PREMIUM)
                                .billingCycle(BillingCycle.MONTHLY)
                                .paymentReference("SLIP-SEG-1002")
                                .build())))
                .andExpect(status().isCreated())
                .andReturn();

        UUID subId = UUID.fromString(objectMapper.readTree(subRes.getResponse().getContentAsString()).get("id").asText());

        // 2. Admin activates
        mockMvc.perform(post("/api/admin/subscriptions/" + subId + "/activate")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk());

        // 3. Verify in database:
        // Subscription record exists in business_subscriptions
        assertTrue(subscriptionRepository.findById(subId).isPresent());
        BusinessSubscription sub = subscriptionRepository.findById(subId).get();
        assertEquals(SubscriptionPlan.PREMIUM, sub.getPlan());
        assertEquals(SubscriptionStatus.ACTIVE, sub.getStatus());
        assertEquals(0, new BigDecimal("12000.00").compareTo(sub.getPriceLkr()));

        // Crucial Rule 8 verification: Charity contributions table count remains unchanged!
        long charityContributionsAfter = contributionRepository.count();
        assertEquals(charityContributionsBefore, charityContributionsAfter,
                "Platform subscription fees must NEVER create or pollute records in campaign_contributions!");
    }
}

package com.ecoconnect.foodbridge;

import com.ecoconnect.foodbridge.dto.LoginRequest;
import com.ecoconnect.foodbridge.dto.PromotionRequestDto;
import com.ecoconnect.foodbridge.dto.RegisterRequest;
import com.ecoconnect.foodbridge.model.*;
import com.ecoconnect.foodbridge.model.enums.*;
import com.ecoconnect.foodbridge.repository.*;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
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
class BusinessProfileAndPromotionsTests {

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
    private PartnershipRepository partnershipRepository;

    @Autowired
    private PromotionRepository promotionRepository;

    @Autowired
    private GroceryOfferRepository groceryOfferRepository;

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

    private Business createTestBusiness(String email, String name, BusinessType type, boolean verified, boolean featured) throws Exception {
        String token = getAuthToken(email, "Password123!", Role.RESTAURANT);
        User user = userRepository.findByEmail(email).orElseThrow();

        Business b = Business.builder()
                .user(user)
                .businessName(name)
                .businessType(type)
                .registrationNumber("BR-" + UUID.randomUUID().toString().substring(0, 8))
                .description("Sustainable culinary and surplus grocery rescue establishment in Sri Lanka")
                .logoUrl("https://foodbridge.lk/images/partners/" + UUID.randomUUID() + ".png")
                .addressLine1("123 Galle Road")
                .city("Colombo 03")
                .district("Colombo")
                .latitude(BigDecimal.valueOf(6.9271))
                .longitude(BigDecimal.valueOf(79.8612))
                .contactPerson("Chef Silva")
                .contactPhone("+94112345678")
                .contactEmail(email)
                .verificationStatus(verified ? VerificationStatus.VERIFIED : VerificationStatus.PENDING)
                .isFeatured(featured)
                .featuredUntil(featured ? OffsetDateTime.now().plusDays(30) : null)
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
                .description("Verified rural community welfare trust")
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
                .description("Emergency nutrition assistance for rural families")
                .needType(CampaignNeedType.FOOD)
                .district("Kandy")
                .targetQuantity(100)
                .currentQuantity(0)
                .targetUnit("food packages")
                .startDate(LocalDate.now())
                .endDate(LocalDate.now().plusDays(30))
                .status(CampaignStatus.ACTIVE)
                .build();

        return campaignRepository.save(campaign);
    }

    @Test
    @DisplayName("Public Business Profile: returns details, location, and active grocery offers")
    void publicBusinessProfile_returnsDetailsAndOffers() throws Exception {
        Business business = createTestBusiness("spice.garden@foodbridge.lk", "Spice Garden Colombo", BusinessType.RESTAURANT, true, true);

        // Add an active grocery discount offer
        GroceryOffer offer = GroceryOffer.builder()
                .business(business)
                .title("50% Off Fresh Vegetable Basket")
                .category("PRODUCE")
                .originalPrice(BigDecimal.valueOf(2500.00))
                .discountedPrice(BigDecimal.valueOf(1250.00))
                .availableQuantity(15)
                .status(GroceryOfferStatus.AVAILABLE)
                .expiryDate(OffsetDateTime.now().plusDays(2))
                .build();
        groceryOfferRepository.save(offer);

        mockMvc.perform(get("/api/public/businesses/" + business.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(business.getId().toString())))
                .andExpect(jsonPath("$.businessName", is("Spice Garden Colombo")))
                .andExpect(jsonPath("$.businessType", is("RESTAURANT")))
                .andExpect(jsonPath("$.district", is("Colombo")))
                .andExpect(jsonPath("$.isFeatured", is(true)))
                .andExpect(jsonPath("$.activeGroceryOffers", hasSize(1)))
                .andExpect(jsonPath("$.activeGroceryOffers[0].title", is("50% Off Fresh Vegetable Basket")));
    }

    @Test
    @DisplayName("Recognition Integrity Rule: uncompleted/agreed partnerships DO NOT show recognition; only COMPLETED partnerships show recognition")
    void recognitionIntegrity_onlyCompletedPartnershipsShowRecognition() throws Exception {
        Business business = createTestBusiness("lanka.bistro@foodbridge.lk", "Lanka Bistro CSR", BusinessType.RESTAURANT, true, false);
        Charity charity = createTestCharity("kandy.relief@gmail.com", "Kandy Relief Society");
        Campaign campaign = createTestCampaign(charity, "Rural Flood Relief 2026");

        // 1. Create an AGREED partnership (mutual terms agreed, but NOT yet delivered or completed!)
        Partnership agreedPartnership = Partnership.builder()
                .business(business)
                .charity(charity)
                .campaign(campaign)
                .partnerType(RequesterType.CHARITY)
                .contributionType(ContributionType.FOOD_ITEMS)
                .quantity(150)
                .unit("packed meals")
                .agreedRecognition("Gold Hunger Relief Partner Badge")
                .status(PartnershipStatus.AGREED)
                .recognitionActive(false) // Inactive until completed!
                .build();
        partnershipRepository.save(agreedPartnership);

        // Verify public profile: recognition must be EMPTY because partnership is only AGREED, not completed
        mockMvc.perform(get("/api/public/businesses/" + business.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.verifiedRecognitions", hasSize(0)))
                .andExpect(jsonPath("$.completedPartnershipsCount", is(0)));

        // 2. Now complete and verify the partnership
        agreedPartnership.setStatus(PartnershipStatus.COMPLETED);
        agreedPartnership.setRecognitionActive(true);
        agreedPartnership.setCompletedAt(OffsetDateTime.now());
        partnershipRepository.save(agreedPartnership);

        // Verify public profile again: recognition MUST NOW BE VISIBLE!
        mockMvc.perform(get("/api/public/businesses/" + business.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.verifiedRecognitions", hasSize(1)))
                .andExpect(jsonPath("$.verifiedRecognitions[0].recognitionBadge", is("Gold Hunger Relief Partner Badge")))
                .andExpect(jsonPath("$.verifiedRecognitions[0].campaignTitle", is("Rural Flood Relief 2026")))
                .andExpect(jsonPath("$.completedPartnershipsCount", is(1)));
    }

    @Test
    @DisplayName("Public Business Directory: filters by district and prioritizes featured businesses")
    void publicBusinessDirectory_filtersAndPrioritizesFeatured() throws Exception {
        createTestBusiness("normal.cafe@foodbridge.lk", "Normal Colombo Cafe", BusinessType.RESTAURANT, true, false);
        Business featured = createTestBusiness("premier.bakery@foodbridge.lk", "Premier Colombo Bakery", BusinessType.GROCERY, true, true);

        // Query district=Colombo
        MvcResult result = mockMvc.perform(get("/api/public/businesses")
                        .param("district", "Colombo"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(2))))
                .andReturn();

        JsonNode list = objectMapper.readTree(result.getResponse().getContentAsString());
        // First item should be a featured business
        assertTrue(list.get(0).get("isFeatured").asBoolean(), "First listed business should be featured");
    }

    @Test
    @DisplayName("Promotion Management: business can create, view, update, and manage promotions")
    void businessPromotionManagement_crudAndToggle() throws Exception {
        String email = "resto.promos@foodbridge.lk";
        Business business = createTestBusiness(email, "Promotions Test Bistro", BusinessType.RESTAURANT, true, false);
        String token = getAuthToken(email, "Password123!", Role.RESTAURANT);

        // 1. Create Promotion
        PromotionRequestDto createDto = PromotionRequestDto.builder()
                .title("20% Off Weekend Diners")
                .description("Special weekend community coupon for all volunteers")
                .promotionType(PromotionType.PROMOTIONAL_OFFER)
                .bannerUrl("https://foodbridge.lk/banners/promo-20.jpg")
                .promoCode("SAVE20")
                .discountDetails("20% off any meal over LKR 3,000")
                .startDate(OffsetDateTime.now())
                .endDate(OffsetDateTime.now().plusDays(14))
                .costLkr(BigDecimal.valueOf(3500.00))
                .isActive(true)
                .build();

        MvcResult createRes = mockMvc.perform(post("/api/promotions")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createDto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.title", is("20% Off Weekend Diners")))
                .andExpect(jsonPath("$.promoCode", is("SAVE20")))
                .andExpect(jsonPath("$.viewsCount", is(0)))
                .andExpect(jsonPath("$.clicksCount", is(0)))
                .andExpect(jsonPath("$.redemptionsCount", is(0)))
                .andReturn();

        UUID promoId = UUID.fromString(objectMapper.readTree(createRes.getResponse().getContentAsString()).get("id").asText());

        // 2. Fetch My Promotions
        mockMvc.perform(get("/api/promotions/my")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].id", is(promoId.toString())));

        // 3. Toggle Status (Pause)
        mockMvc.perform(patch("/api/promotions/" + promoId + "/toggle-status")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.isActive", is(false)));

        // 4. Toggle Status (Resume)
        mockMvc.perform(patch("/api/promotions/" + promoId + "/toggle-status")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.isActive", is(true)));
    }

    @Test
    @DisplayName("Promo Analytics: tracking endpoints increment views, clicks, and redemptions")
    void promoAnalytics_incrementsEventsCorrectly() throws Exception {
        String email = "analytics.resto@foodbridge.lk";
        Business business = createTestBusiness(email, "Analytics Bistro", BusinessType.RESTAURANT, true, true);
        String token = getAuthToken(email, "Password123!", Role.RESTAURANT);

        Promotion promotion = Promotion.builder()
                .business(business)
                .title("Family Feast Voucher")
                .promotionType(PromotionType.PROMOTIONAL_OFFER)
                .promoCode("FAMILYFEAST")
                .startDate(OffsetDateTime.now())
                .endDate(OffsetDateTime.now().plusDays(30))
                .costLkr(BigDecimal.valueOf(5000.00))
                .paymentStatus(PaymentStatus.PAID)
                .isActive(true)
                .isFeatured(false)
                .viewsCount(0L)
                .clicksCount(0L)
                .redemptionsCount(0L)
                .build();
        Promotion saved = promotionRepository.save(promotion);
        UUID promoId = saved.getId();

        // Simulate 3 public views
        mockMvc.perform(post("/api/public/promotions/" + promoId + "/view")).andExpect(status().isOk());
        mockMvc.perform(post("/api/public/promotions/" + promoId + "/view")).andExpect(status().isOk());
        mockMvc.perform(post("/api/public/promotions/" + promoId + "/view")).andExpect(status().isOk());

        // Simulate 2 public clicks
        mockMvc.perform(post("/api/public/promotions/" + promoId + "/click")).andExpect(status().isOk());
        mockMvc.perform(post("/api/public/promotions/" + promoId + "/click")).andExpect(status().isOk());

        // Simulate 1 redemption
        mockMvc.perform(post("/api/public/promotions/" + promoId + "/redeem")).andExpect(status().isOk());

        // Check Analytics endpoint for the business owner
        mockMvc.perform(get("/api/promotions/analytics")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalViews", is(3)))
                .andExpect(jsonPath("$.totalClicks", is(2)))
                .andExpect(jsonPath("$.totalRedemptions", is(1)))
                .andExpect(jsonPath("$.promotions[0].viewsCount", is(3)))
                .andExpect(jsonPath("$.promotions[0].clicksCount", is(2)))
                .andExpect(jsonPath("$.promotions[0].redemptionsCount", is(1)))
                .andExpect(jsonPath("$.promotions[0].ctr", is(66.67))) // 2/3 * 100%
                .andExpect(jsonPath("$.promotions[0].redemptionRate", is(50.0))); // 1/2 * 100%
    }

    @Test
    @DisplayName("Admin Controls: admin can feature/unfeature businesses and promotions")
    void adminControls_featureAndUnfeature() throws Exception {
        Business business = createTestBusiness("regular.shop@foodbridge.lk", "Regular Grocery Mart", BusinessType.GROCERY, true, false);
        String adminToken = getAdminToken();
        String userToken = getAuthToken("citizen.user@gmail.com", "Password123!", Role.USER);

        // 1. Feature business profile
        mockMvc.perform(put("/api/admin/businesses/" + business.getId() + "/feature?featured=true")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.isFeatured", is(true)));

        // Verify in public business profile
        mockMvc.perform(get("/api/public/businesses/" + business.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.isFeatured", is(true)));

        // 2. Unfeature business profile
        mockMvc.perform(put("/api/admin/businesses/" + business.getId() + "/feature?featured=false")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.isFeatured", is(false)));

        // 3. Regular user is forbidden from admin feature endpoint
        mockMvc.perform(put("/api/admin/businesses/" + business.getId() + "/feature?featured=true")
                        .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isForbidden());
    }
}

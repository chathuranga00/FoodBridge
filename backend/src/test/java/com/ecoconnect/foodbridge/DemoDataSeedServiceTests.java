package com.ecoconnect.foodbridge;

import com.ecoconnect.foodbridge.dto.LoginRequest;
import com.ecoconnect.foodbridge.model.enums.*;
import com.ecoconnect.foodbridge.repository.*;
import com.ecoconnect.foodbridge.service.DemoDataSeedService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Map;

import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("local")
@Transactional
class DemoDataSeedServiceTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private DemoDataSeedService demoDataSeedService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BusinessRepository businessRepository;

    @Autowired
    private CharityRepository charityRepository;

    @Autowired
    private AnimalOrganizationRepository animalOrgRepository;

    @Autowired
    private CampaignRepository campaignRepository;

    @Autowired
    private FoodListingRepository foodListingRepository;

    @Autowired
    private GroceryOfferRepository groceryOfferRepository;

    @Autowired
    private PartnershipRepository partnershipRepository;

    @Autowired
    private VolunteerOpportunityRepository volunteerOpportunityRepository;

    @Autowired
    private ImpactRecordRepository impactRecordRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @BeforeEach
    void setUp() {
        demoDataSeedService.seedAllDemoData(false);
    }

    @Test
    @DisplayName("Verify Kandy demo dataset contains all required entities and counts")
    void testDemoDataCountsAndEntities() {
        Map<String, Object> status = demoDataSeedService.getDemoDataStatus();
        assertTrue((Boolean) status.get("isSeeded"));

        // Verify 4 demo restaurants exist by registration number
        assertTrue(businessRepository.findByRegistrationNumber("BRC-KND-REST-001").isPresent(), "Restaurant 1 present");
        assertTrue(businessRepository.findByRegistrationNumber("BRC-KND-REST-002").isPresent(), "Restaurant 2 present");
        assertTrue(businessRepository.findByRegistrationNumber("BRC-KND-REST-003").isPresent(), "Restaurant 3 present");
        assertTrue(businessRepository.findByRegistrationNumber("BRC-KND-REST-004").isPresent(), "Restaurant 4 present");

        // Verify 3 demo groceries exist by registration number
        assertTrue(businessRepository.findByRegistrationNumber("BRC-KND-GROC-001").isPresent(), "Grocery 1 present");
        assertTrue(businessRepository.findByRegistrationNumber("BRC-KND-GROC-002").isPresent(), "Grocery 2 present");
        assertTrue(businessRepository.findByRegistrationNumber("BRC-KND-GROC-003").isPresent(), "Grocery 3 present");

        // 2 verified charities
        assertTrue(charityRepository.findByRegistrationNumber("NGO-KND-001").isPresent(), "Charity 1 present");
        assertTrue(charityRepository.findByRegistrationNumber("NGO-KND-002").isPresent(), "Charity 2 present");

        // 1 verified animal organization
        assertTrue(animalOrgRepository.findByRegistrationNumber("AW-KND-001").isPresent(), "Animal org present");

        // 5 campaigns with varied progress
        assertTrue(campaignRepository.count() >= 5, "Must have at least 5 campaigns");

        // Sample food listings & grocery offers
        assertTrue(foodListingRepository.count() >= 4, "Must have sample food listings");
        assertTrue(groceryOfferRepository.count() >= 5, "Must have sample grocery offers");

        // Completed CSR partnership
        assertTrue(partnershipRepository.count() >= 1, "Must have completed CSR partnership");

        // Volunteer events
        assertTrue(volunteerOpportunityRepository.count() >= 3, "Must have volunteer opportunities");

        // Impact records generating meaningful numbers
        assertTrue(impactRecordRepository.count() >= 5, "Must have completed impact records");
    }

    @Test
    @DisplayName("Seeding is idempotent: running multiple times does not duplicate records")
    void testIdempotentSeeding() {
        long initialUsers = userRepository.count();
        long initialBusinesses = businessRepository.count();
        long initialCampaigns = campaignRepository.count();

        // Run seed again
        demoDataSeedService.seedAllDemoData(false);

        assertEquals(initialUsers, userRepository.count());
        assertEquals(initialBusinesses, businessRepository.count());
        assertEquals(initialCampaigns, campaignRepository.count());
    }

    @Test
    @DisplayName("Every platform role from README can authenticate with documented demo credentials")
    void testDemoAccountLogins() throws Exception {
        // 1. ADMIN
        assertLoginSuccess("admin@foodbridge.lk", DemoDataSeedService.ADMIN_PASSWORD, "ADMIN");

        // 2. RESTAURANT
        assertLoginSuccess("restaurant@foodbridge.lk", DemoDataSeedService.DEFAULT_DEMO_PASSWORD, "RESTAURANT");

        // 3. GROCERY
        assertLoginSuccess("grocery@foodbridge.lk", DemoDataSeedService.DEFAULT_DEMO_PASSWORD, "GROCERY");

        // 4. CHARITY
        assertLoginSuccess("charity@foodbridge.lk", DemoDataSeedService.DEFAULT_DEMO_PASSWORD, "CHARITY");

        // 5. ANIMAL_ORG
        assertLoginSuccess("animalorg@foodbridge.lk", DemoDataSeedService.DEFAULT_DEMO_PASSWORD, "ANIMAL_ORG");

        // 6. USER / Volunteer
        assertLoginSuccess("volunteer@foodbridge.lk", DemoDataSeedService.DEFAULT_DEMO_PASSWORD, "USER");
    }

    @Test
    @DisplayName("GET /api/public/demo-data/status returns seeded state and metrics")
    void testDemoDataStatusEndpoint() throws Exception {
        mockMvc.perform(get("/api/public/demo-data/status"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.isSeeded", is(true)))
                .andExpect(jsonPath("$.businesses", greaterThanOrEqualTo(7)))
                .andExpect(jsonPath("$.charities", greaterThanOrEqualTo(2)))
                .andExpect(jsonPath("$.animalOrgs", greaterThanOrEqualTo(1)))
                .andExpect(jsonPath("$.campaigns", greaterThanOrEqualTo(5)));
    }

    @Test
    @DisplayName("POST /api/public/demo-data/seed endpoint triggers seed successfully")
    void testDemoDataSeedEndpoint() throws Exception {
        mockMvc.perform(post("/api/public/demo-data/seed?force=false"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.isSeeded", is(true)))
                .andExpect(jsonPath("$.businesses", greaterThanOrEqualTo(7)));
    }

    @Test
    @DisplayName("Impact metrics are meaningful and exceed target baseline")
    void testImpactMetricsMeaningful() {
        BigDecimal totalFoodRescued = impactRecordRepository.findAll().stream()
                .map(r -> r.getFoodWeightKg() != null ? r.getFoodWeightKg() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        int totalMeals = impactRecordRepository.findAll().stream()
                .mapToInt(r -> r.getMealsRescued() != null ? r.getMealsRescued() : 0)
                .sum();

        assertTrue(totalFoodRescued.compareTo(new BigDecimal("1000")) >= 0,
                "Total food rescued should exceed 1000 kg, was: " + totalFoodRescued);
        assertTrue(totalMeals >= 2000,
                "Total meals served should exceed 2000, was: " + totalMeals);
    }

    private void assertLoginSuccess(String email, String password, String expectedRole) throws Exception {
        LoginRequest request = new LoginRequest();
        request.setEmail(email);
        request.setPassword(password);

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken", notNullValue()))
                .andExpect(jsonPath("$.user.role", is(expectedRole)))
                .andExpect(jsonPath("$.user.email", is(email)));
    }
}

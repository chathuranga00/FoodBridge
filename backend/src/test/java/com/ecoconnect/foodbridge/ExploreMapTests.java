package com.ecoconnect.foodbridge;

import com.ecoconnect.foodbridge.model.*;
import com.ecoconnect.foodbridge.model.enums.*;
import com.ecoconnect.foodbridge.repository.*;
import com.ecoconnect.foodbridge.util.GeoUtils;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("local")
public class ExploreMapTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BusinessRepository businessRepository;

    @Autowired
    private CharityRepository charityRepository;

    @Autowired
    private CampaignRepository campaignRepository;

    @Autowired
    private FoodListingRepository foodListingRepository;

    @Autowired
    private GroceryOfferRepository groceryOfferRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private Business testBusiness;
    private Charity testCharity;
    private Campaign testCampaign;
    private FoodListing testListing;
    private GroceryOffer testGroceryOffer;

    @BeforeEach
    public void setup() {
        foodListingRepository.deleteAll();
        groceryOfferRepository.deleteAll();
        campaignRepository.deleteAll();
        businessRepository.deleteAll();
        charityRepository.deleteAll();

        // 1. Create a verified Business in Colombo
        User busUser = userRepository.save(User.builder()
                .email("map.biz." + UUID.randomUUID() + "@test.com")
                .passwordHash(passwordEncoder.encode("Password123!"))
                .fullName("Green Leaf Bistro")
                .role(Role.RESTAURANT)
                .build());

        testBusiness = businessRepository.save(Business.builder()
                .user(busUser)
                .businessName("Green Leaf Bistro Colombo")
                .businessType(BusinessType.RESTAURANT)
                .registrationNumber("BR-COL-9901")
                .verificationStatus(VerificationStatus.VERIFIED)
                .district("Colombo")
                .city("Colombo 03")
                .addressLine1("123 Galle Road")
                .latitude(BigDecimal.valueOf(6.9034))
                .longitude(BigDecimal.valueOf(79.8540))
                .build());

        // 2. Create a verified Charity in Kandy
        User charUser = userRepository.save(User.builder()
                .email("map.charity." + UUID.randomUUID() + "@test.com")
                .passwordHash(passwordEncoder.encode("Password123!"))
                .fullName("Hill Country Relief Foundation")
                .role(Role.CHARITY)
                .build());

        testCharity = charityRepository.save(Charity.builder()
                .user(charUser)
                .charityName("Hill Country Relief Foundation")
                .registrationNumber("NGO-KDY-8812")
                .verificationStatus(VerificationStatus.VERIFIED)
                .district("Kandy")
                .city("Kandy City")
                .addressLine1("45 Peradeniya Road")
                .operatingArea("Central Province")
                .capacityPeople(250)
                .latitude(BigDecimal.valueOf(7.2906))
                .longitude(BigDecimal.valueOf(80.6337))
                .build());

        // 3. Create an active Campaign in Anuradhapura
        testCampaign = campaignRepository.save(Campaign.builder()
                .organizerType(CampaignOrganizerType.CHARITY)
                .charity(testCharity)
                .title("Dry Zone Safe Drinking Water Initiative")
                .description("Providing clean water filtration units to drought-affected families.")
                .needType(CampaignNeedType.CLEAN_WATER)
                .district("Anuradhapura")
                .targetQuantity(100)
                .targetUnit("Filters")
                .currentQuantity(35)
                .startDate(LocalDate.now().minusDays(5))
                .endDate(LocalDate.now().plusDays(20))
                .status(CampaignStatus.ACTIVE)
                .build());

        // 4. Create available Food Listing in Colombo
        testListing = foodListingRepository.save(FoodListing.builder()
                .business(testBusiness)
                .title("Surplus Rice & Vegetable Curries")
                .foodCategory("Cooked Meals")
                .suitabilityType(FoodSuitabilityType.HUMAN_CONSUMPTION)
                .quantity(BigDecimal.valueOf(15.0))
                .unit("portions")
                .pickupStart(OffsetDateTime.now().plusHours(1))
                .pickupEnd(OffsetDateTime.now().plusHours(4))
                .expiryDate(OffsetDateTime.now().plusHours(6))
                .pickupAddress("123 Galle Road, Colombo 03")
                .status(FoodListingStatus.AVAILABLE)
                .foodSafetyConfirmed(true)
                .latitude(BigDecimal.valueOf(6.9034))
                .longitude(BigDecimal.valueOf(79.8540))
                .build());

        // 5. Create available Grocery Offer in Colombo
        testGroceryOffer = groceryOfferRepository.save(GroceryOffer.builder()
                .business(testBusiness)
                .title("Highland Full Cream Milk Packets")
                .category("Dairy & Eggs")
                .originalPrice(new BigDecimal("1200.00"))
                .discountedPrice(new BigDecimal("600.00"))
                .availableQuantity(20)
                .bestBeforeDate(OffsetDateTime.now().plusDays(2))
                .expiryDate(OffsetDateTime.now().plusDays(3))
                .pickupStart(OffsetDateTime.now().plusHours(1))
                .pickupEnd(OffsetDateTime.now().plusDays(1))
                .pickupAddress("123 Galle Road, Colombo 03")
                .status(GroceryOfferStatus.AVAILABLE)
                .safetyConfirmed(true)
                .build());
    }

    @Test
    public void testPublicExploreEndpoint_ReturnsAllActiveMarkersWithoutAuth() throws Exception {
        mockMvc.perform(get("/api/map/explore"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(4))))
                .andExpect(jsonPath("$[*].markerType", hasItems("BUSINESS", "FOOD_LISTING", "GROCERY_OFFER", "CAMPAIGN", "CHARITY")));
    }

    @Test
    public void testCampaignMarkers_EnforceAreaLevelDistrictLocation_NoPrivateAddressesLeaked() throws Exception {
        mockMvc.perform(get("/api/map/explore")
                        .param("type", "CAMPAIGN"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].title", is("Dry Zone Safe Drinking Water Initiative")))
                .andExpect(jsonPath("$[0].district", is("Anuradhapura")))
                .andExpect(jsonPath("$[0].latitude", closeTo(8.3114, 0.05))) // Anuradhapura centroid
                .andExpect(jsonPath("$[0].longitude", closeTo(80.4037, 0.05)))
                // Verify no private email, contact phone, or secret street addresses are returned
                .andExpect(jsonPath("$[0].contactPhone").doesNotExist())
                .andExpect(jsonPath("$[0].contactEmail").doesNotExist())
                .andExpect(jsonPath("$[0].passwordHash").doesNotExist());
    }

    @Test
    public void testTypeFiltering_ReturnsOnlyRequestedMarkerType() throws Exception {
        // Query GROCERY_OFFER only
        mockMvc.perform(get("/api/map/explore")
                        .param("type", "GROCERY_OFFER"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[*].markerType", everyItem(is("GROCERY_OFFER"))))
                .andExpect(jsonPath("$[0].title", is("Highland Full Cream Milk Packets")))
                .andExpect(jsonPath("$[0].priceInfo", containsString("600")));
    }

    @Test
    public void testDistanceCalculationAndRadiusFilter_NearMe() throws Exception {
        // User coordinates in Colombo Fort: [6.9344, 79.8428]
        // Colombo items should be ~3.5km away
        // Anuradhapura campaign is ~180km away
        mockMvc.perform(get("/api/map/explore")
                        .param("userLat", "6.9344")
                        .param("userLng", "79.8428")
                        .param("radiusKm", "10.0"))
                .andExpect(status().isOk())
                // Only Colombo items within 10km should be returned
                .andExpect(jsonPath("$[*].district", everyItem(is("Colombo"))))
                .andExpect(jsonPath("$[0].distanceKm", notNullValue()))
                .andExpect(jsonPath("$[0].distanceKm", lessThan(10.0)));

        // If radius is expanded to 250km, Anuradhapura campaign and Kandy charity should be returned
        mockMvc.perform(get("/api/map/explore")
                        .param("userLat", "6.9344")
                        .param("userLng", "79.8428")
                        .param("radiusKm", "250.0"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[*].district", hasItems("Colombo", "Kandy", "Anuradhapura")));
    }

    @Test
    public void testDistrictCentroidCoordinates_MatchKnownSriLankaLocations() {
        GeoUtils.Coordinates colombo = GeoUtils.getDistrictCentroid("Colombo");
        org.junit.jupiter.api.Assertions.assertEquals(6.9271, colombo.latitude(), 0.001);
        org.junit.jupiter.api.Assertions.assertEquals(79.8612, colombo.longitude(), 0.001);

        GeoUtils.Coordinates jaffna = GeoUtils.getDistrictCentroid("Jaffna");
        org.junit.jupiter.api.Assertions.assertEquals(9.6615, jaffna.latitude(), 0.001);
        org.junit.jupiter.api.Assertions.assertEquals(80.0255, jaffna.longitude(), 0.001);

        double distKm = GeoUtils.haversineKm(6.9271, 79.8612, 7.2906, 80.6337); // Colombo to Kandy ~94km
        org.junit.jupiter.api.Assertions.assertTrue(distKm > 80 && distKm < 115);
    }
}

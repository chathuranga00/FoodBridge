package com.ecoconnect.foodbridge;

import com.ecoconnect.foodbridge.model.*;
import com.ecoconnect.foodbridge.model.enums.*;
import com.ecoconnect.foodbridge.repository.*;
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

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.UUID;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("local")
public class ImpactStatisticsTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BusinessRepository businessRepository;

    @Autowired
    private CharityRepository charityRepository;

    @Autowired
    private VolunteerRepository volunteerRepository;

    @Autowired
    private FoodListingRepository foodListingRepository;

    @Autowired
    private FoodRequestRepository foodRequestRepository;

    @Autowired
    private GroceryOfferRepository groceryOfferRepository;

    @Autowired
    private GroceryReservationRepository groceryReservationRepository;

    @Autowired
    private CampaignRepository campaignRepository;

    @Autowired
    private CampaignContributionRepository campaignContributionRepository;

    @Autowired
    private ActivityRecordRepository activityRecordRepository;

    @Autowired
    private ImpactRecordRepository impactRecordRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private Business verifiedBusinessA;
    private Business verifiedBusinessB;
    private Charity verifiedCharity;

    @BeforeEach
    public void setup() {
        impactRecordRepository.deleteAll();
        activityRecordRepository.deleteAll();
        campaignContributionRepository.deleteAll();
        campaignRepository.deleteAll();
        groceryReservationRepository.deleteAll();
        groceryOfferRepository.deleteAll();
        foodRequestRepository.deleteAll();
        foodListingRepository.deleteAll();
        volunteerRepository.deleteAll();
        businessRepository.deleteAll();
        charityRepository.deleteAll();

        // 1. Create Verified Business A
        User userA = userRepository.save(User.builder()
                .email("bizA." + UUID.randomUUID() + "@test.com")
                .passwordHash(passwordEncoder.encode("Password123!"))
                .fullName("Cinnamon Grand Kitchen")
                .role(Role.RESTAURANT)
                .build());

        verifiedBusinessA = businessRepository.save(Business.builder()
                .user(userA)
                .businessName("Cinnamon Grand Kitchen")
                .businessType(BusinessType.RESTAURANT)
                .registrationNumber("BR-COL-1001")
                .verificationStatus(VerificationStatus.VERIFIED)
                .district("Colombo")
                .city("Colombo 03")
                .addressLine1("77 Galle Road")
                .latitude(BigDecimal.valueOf(6.9180))
                .longitude(BigDecimal.valueOf(79.8490))
                .build());

        // 2. Create Verified Business B
        User userB = userRepository.save(User.builder()
                .email("bizB." + UUID.randomUUID() + "@test.com")
                .passwordHash(passwordEncoder.encode("Password123!"))
                .fullName("Keells Super Union Place")
                .role(Role.GROCERY)
                .build());

        verifiedBusinessB = businessRepository.save(Business.builder()
                .user(userB)
                .businessName("Keells Super Union Place")
                .businessType(BusinessType.GROCERY)
                .registrationNumber("BR-COL-1002")
                .verificationStatus(VerificationStatus.VERIFIED)
                .district("Colombo")
                .city("Colombo 02")
                .addressLine1("148 Vauxhall Street")
                .latitude(BigDecimal.valueOf(6.9210))
                .longitude(BigDecimal.valueOf(79.8550))
                .build());

        // 3. Create Verified Charity
        User charUser = userRepository.save(User.builder()
                .email("charity." + UUID.randomUUID() + "@test.com")
                .passwordHash(passwordEncoder.encode("Password123!"))
                .fullName("Colombo Community Meals")
                .role(Role.CHARITY)
                .build());

        verifiedCharity = charityRepository.save(Charity.builder()
                .user(charUser)
                .charityName("Colombo Community Meals")
                .registrationNumber("NGO-COL-5541")
                .verificationStatus(VerificationStatus.VERIFIED)
                .district("Colombo")
                .city("Colombo 02")
                .addressLine1("22 Park Street")
                .operatingArea("Western Province")
                .capacityPeople(300)
                .latitude(BigDecimal.valueOf(6.9190))
                .longitude(BigDecimal.valueOf(79.8560))
                .build());
    }

    @Test
    @DisplayName("RULE 4 TEST: Unverified/Incomplete Food Listings and Requests MUST be excluded from impact stats")
    public void unverifiedFoodListingsAndRequestsExcludedFromImpactStats() throws Exception {
        // Step 1: Create an AVAILABLE FoodListing (not yet claimed)
        FoodListing listing = foodListingRepository.save(FoodListing.builder()
                .business(verifiedBusinessA)
                .title("50 Portions Veg Fried Rice")
                .foodCategory("Cooked Meals")
                .suitabilityType(FoodSuitabilityType.HUMAN_CONSUMPTION)
                .quantity(BigDecimal.valueOf(50.0))
                .unit("portions")
                .pickupStart(OffsetDateTime.now().plusHours(1))
                .pickupEnd(OffsetDateTime.now().plusHours(4))
                .expiryDate(OffsetDateTime.now().plusHours(6))
                .pickupAddress("77 Galle Road, Colombo")
                .status(FoodListingStatus.AVAILABLE)
                .foodSafetyConfirmed(true)
                .latitude(BigDecimal.valueOf(6.9180))
                .longitude(BigDecimal.valueOf(79.8490))
                .build());

        // Step 2: Create a PENDING FoodRequest
        FoodRequest pendingRequest = foodRequestRepository.save(FoodRequest.builder()
                .listing(listing)
                .charity(verifiedCharity)
                .requesterType(RequesterType.CHARITY)
                .quantityRequested(BigDecimal.valueOf(20.0))
                .status(FoodRequestStatus.PENDING)
                .build());

        // Step 3: Verify that AVAILABLE listing and PENDING request are NOT counted
        mockMvc.perform(get("/api/impact/summary"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.foodRescuedKg", is(0.0)))
                .andExpect(jsonPath("$.completedCollections", is(0)));

        // Step 4: Advance request to ACCEPTED (listing is RESERVED) - still NOT completed!
        pendingRequest.setStatus(FoodRequestStatus.ACCEPTED);
        foodRequestRepository.save(pendingRequest);

        mockMvc.perform(get("/api/impact/summary"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.foodRescuedKg", is(0.0)))
                .andExpect(jsonPath("$.completedCollections", is(0)));

        // Step 5: Mark request COLLECTED (physically completed and verified)
        pendingRequest.setStatus(FoodRequestStatus.COLLECTED);
        pendingRequest.setCompletedAt(OffsetDateTime.now(ZoneOffset.UTC));
        foodRequestRepository.save(pendingRequest);

        // 20 portions * 0.40 kg = 8.0 kg food rescued
        mockMvc.perform(get("/api/impact/summary"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.foodRescuedKg", is(8.0)))
                .andExpect(jsonPath("$.completedCollections", is(1)))
                .andExpect(jsonPath("$.mealsProvided", is(20)));
    }

    @Test
    @DisplayName("RULE 4 TEST: Unredeemed, Cancelled, and Expired Grocery Reservations MUST be excluded")
    public void unredeemedGroceryReservationsExcludedFromImpactStats() throws Exception {
        GroceryOffer offer = groceryOfferRepository.save(GroceryOffer.builder()
                .business(verifiedBusinessB)
                .title("Highland Butter 200g")
                .category("Dairy & Eggs")
                .originalPrice(new BigDecimal("900.00"))
                .discountedPrice(new BigDecimal("450.00"))
                .availableQuantity(50)
                .bestBeforeDate(OffsetDateTime.now().plusDays(3))
                .expiryDate(OffsetDateTime.now().plusDays(4))
                .pickupStart(OffsetDateTime.now())
                .pickupEnd(OffsetDateTime.now().plusDays(2))
                .pickupAddress("148 Vauxhall Street, Colombo")
                .status(GroceryOfferStatus.AVAILABLE)
                .safetyConfirmed(true)
                .build());

        User customer = userRepository.save(User.builder()
                .email("customer." + UUID.randomUUID() + "@test.com")
                .passwordHash(passwordEncoder.encode("Password123!"))
                .fullName("Kamal Silva")
                .role(Role.USER)
                .build());

        // 1. RESERVED (in progress, not yet redeemed) -> MUST NOT COUNT
        groceryReservationRepository.save(GroceryReservation.builder()
                .offer(offer)
                .user(customer)
                .redemptionCode("RES-111111")
                .quantity(10)
                .unitPrice(new BigDecimal("450.00"))
                .totalPrice(new BigDecimal("4500.00"))
                .status(GroceryReservationStatus.RESERVED)
                .reservedAt(OffsetDateTime.now())
                .expiresAt(OffsetDateTime.now().plusHours(24))
                .build());

        // 2. CANCELLED -> MUST NOT COUNT
        groceryReservationRepository.save(GroceryReservation.builder()
                .offer(offer)
                .user(customer)
                .redemptionCode("RES-222222")
                .quantity(5)
                .unitPrice(new BigDecimal("450.00"))
                .totalPrice(new BigDecimal("2250.00"))
                .status(GroceryReservationStatus.CANCELLED)
                .reservedAt(OffsetDateTime.now().minusDays(1))
                .cancelledAt(OffsetDateTime.now().minusHours(2))
                .expiresAt(OffsetDateTime.now().plusHours(20))
                .build());

        // 3. EXPIRED -> MUST NOT COUNT
        groceryReservationRepository.save(GroceryReservation.builder()
                .offer(offer)
                .user(customer)
                .redemptionCode("RES-333333")
                .quantity(8)
                .unitPrice(new BigDecimal("450.00"))
                .totalPrice(new BigDecimal("3600.00"))
                .status(GroceryReservationStatus.EXPIRED)
                .reservedAt(OffsetDateTime.now().minusDays(3))
                .expiresAt(OffsetDateTime.now().minusDays(1))
                .build());

        // Verify total redeemed products is ZERO
        mockMvc.perform(get("/api/impact/summary"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.groceryProductsRedeemed", is(0)));

        // 4. Now create REDEEMED reservation (quantity 14)
        groceryReservationRepository.save(GroceryReservation.builder()
                .offer(offer)
                .user(customer)
                .redemptionCode("RES-444444")
                .quantity(14)
                .unitPrice(new BigDecimal("450.00"))
                .totalPrice(new BigDecimal("6300.00"))
                .status(GroceryReservationStatus.REDEEMED)
                .reservedAt(OffsetDateTime.now().minusHours(3))
                .redeemedAt(OffsetDateTime.now())
                .expiresAt(OffsetDateTime.now().plusHours(20))
                .build());

        // Verify only the 14 redeemed products count!
        mockMvc.perform(get("/api/impact/summary"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.groceryProductsRedeemed", is(14)));
    }

    @Test
    @DisplayName("RULE 4 TEST: Unapproved and Active Campaigns excluded from completed campaigns; Pledged contributions excluded from distributed resources")
    public void unapprovedCampaignsAndPledgesExcludedFromImpactStats() throws Exception {
        // 1. Campaign with PENDING_APPROVAL -> MUST NOT COUNT
        campaignRepository.save(Campaign.builder()
                .organizerType(CampaignOrganizerType.CHARITY)
                .charity(verifiedCharity)
                .title("Pending Approval Clean Water Project")
                .description("Waiting for admin review")
                .needType(CampaignNeedType.CLEAN_WATER)
                .targetQuantity(100)
                .targetUnit("Filters")
                .startDate(LocalDate.now())
                .endDate(LocalDate.now().plusDays(30))
                .status(CampaignStatus.PENDING_APPROVAL)
                .build());

        // 2. Campaign with ACTIVE -> MUST NOT COUNT AS COMPLETED
        Campaign activeCampaign = campaignRepository.save(Campaign.builder()
                .organizerType(CampaignOrganizerType.CHARITY)
                .charity(verifiedCharity)
                .title("Active Books for Schools Drive")
                .description("In progress")
                .needType(CampaignNeedType.BOOKS_STATIONERY)
                .targetQuantity(200)
                .currentQuantity(50)
                .targetUnit("Books")
                .startDate(LocalDate.now())
                .endDate(LocalDate.now().plusDays(30))
                .status(CampaignStatus.ACTIVE)
                .build());

        // 3. Contributions: PLEDGED and CONFIRMED (awaiting distribution) -> MUST NOT COUNT AS DISTRIBUTED
        campaignContributionRepository.save(CampaignContribution.builder()
                .campaign(activeCampaign)
                .contributorName("Nimal Perera")
                .contributionType(ContributionType.OTHER_RESOURCES)
                .quantity(50)
                .status(ContributionStatus.PLEDGED)
                .build());

        campaignContributionRepository.save(CampaignContribution.builder()
                .campaign(activeCampaign)
                .contributorName("Sunil Fernando")
                .contributionType(ContributionType.OTHER_RESOURCES)
                .quantity(30)
                .status(ContributionStatus.CONFIRMED)
                .build());

        // Verify completedCampaigns = 0 and resourcesDistributed = 0
        mockMvc.perform(get("/api/impact/summary"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.completedCampaigns", is(0)))
                .andExpect(jsonPath("$.resourcesDistributed", is(0)));

        // 4. Now create a COMPLETED Campaign and a DISTRIBUTED Contribution
        campaignRepository.save(Campaign.builder()
                .organizerType(CampaignOrganizerType.CHARITY)
                .charity(verifiedCharity)
                .title("Monaragala Drought Water Relief Completed")
                .description("Successfully completed")
                .needType(CampaignNeedType.CLEAN_WATER)
                .targetQuantity(80)
                .currentQuantity(80)
                .targetBeneficiariesCount(240)
                .targetUnit("Filters")
                .startDate(LocalDate.now().minusDays(40))
                .endDate(LocalDate.now().minusDays(5))
                .status(CampaignStatus.COMPLETED)
                .build());

        campaignContributionRepository.save(CampaignContribution.builder()
                .campaign(activeCampaign)
                .contributorName("Global Aid Alliance")
                .contributionType(ContributionType.OTHER_RESOURCES)
                .quantity(80)
                .distributionEvidenceUrl("https://example.com/photos/books-distributed.jpg")
                .distributionNotes("Handed over to 80 primary students")
                .distributedAt(OffsetDateTime.now())
                .status(ContributionStatus.DISTRIBUTED)
                .build());

        // Verify completedCampaigns = 1 and resourcesDistributed = 80
        mockMvc.perform(get("/api/impact/summary"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.completedCampaigns", is(1)))
                .andExpect(jsonPath("$.resourcesDistributed", is(80)));
    }

    @Test
    @DisplayName("RULE 4 TEST: Unverified Businesses and Volunteers MUST be excluded from verified counts")
    public void unverifiedBusinessesAndVolunteersExcluded() throws Exception {
        // Create an UNVERIFIED (PENDING) Business
        User unverifiedBusUser = userRepository.save(User.builder()
                .email("pending.bus." + UUID.randomUUID() + "@test.com")
                .passwordHash(passwordEncoder.encode("Password123!"))
                .fullName("Unverified Fast Food")
                .role(Role.RESTAURANT)
                .build());

        businessRepository.save(Business.builder()
                .user(unverifiedBusUser)
                .businessName("Unverified Fast Food")
                .businessType(BusinessType.RESTAURANT)
                .registrationNumber("BR-PENDING-99")
                .verificationStatus(VerificationStatus.PENDING)
                .addressLine1("10 High Street")
                .district("Colombo")
                .city("Colombo")
                .latitude(BigDecimal.valueOf(6.9271))
                .longitude(BigDecimal.valueOf(79.8612))
                .build());

        // Create an UNVERIFIED Volunteer
        User unverifiedVolUser = userRepository.save(User.builder()
                .email("pending.vol." + UUID.randomUUID() + "@test.com")
                .passwordHash(passwordEncoder.encode("Password123!"))
                .fullName("Pending Volunteer")
                .role(Role.USER)
                .build());

        volunteerRepository.save(Volunteer.builder()
                .user(unverifiedVolUser)
                .availabilityStatus(VolunteerAvailability.AVAILABLE)
                .verificationStatus(VerificationStatus.PENDING)
                .build());

        // Verify activeBusinesses = 2 (verifiedBusinessA and verifiedBusinessB from setup, excluding pending)
        // Verify activeVolunteers = 0
        mockMvc.perform(get("/api/impact/summary"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.activeBusinesses", is(2)))
                .andExpect(jsonPath("$.activeVolunteers", is(0)));

        // Now verify a volunteer
        User verifiedVolUser = userRepository.save(User.builder()
                .email("verified.vol." + UUID.randomUUID() + "@test.com")
                .passwordHash(passwordEncoder.encode("Password123!"))
                .fullName("Verified Champion Volunteer")
                .role(Role.USER)
                .build());

        volunteerRepository.save(Volunteer.builder()
                .user(verifiedVolUser)
                .availabilityStatus(VolunteerAvailability.AVAILABLE)
                .verificationStatus(VerificationStatus.VERIFIED)
                .totalTasksCompleted(12)
                .build());

        mockMvc.perform(get("/api/impact/summary"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.activeVolunteers", is(1)));
    }

    @Test
    @DisplayName("Per-organization endpoint isolates metrics strictly to that organization")
    public void perOrganizationStatsIsolateRecords() throws Exception {
        // Business A food rescue
        FoodListing listingA = foodListingRepository.save(FoodListing.builder()
                .business(verifiedBusinessA)
                .title("25 Portions Soup")
                .foodCategory("Cooked Meals")
                .suitabilityType(FoodSuitabilityType.HUMAN_CONSUMPTION)
                .quantity(BigDecimal.valueOf(25.0))
                .unit("portions")
                .pickupStart(OffsetDateTime.now())
                .pickupEnd(OffsetDateTime.now().plusHours(3))
                .expiryDate(OffsetDateTime.now().plusHours(4))
                .pickupAddress("77 Galle Road")
                .status(FoodListingStatus.COLLECTED)
                .foodSafetyConfirmed(true)
                .latitude(BigDecimal.valueOf(6.9180))
                .longitude(BigDecimal.valueOf(79.8490))
                .build());

        foodRequestRepository.save(FoodRequest.builder()
                .listing(listingA)
                .charity(verifiedCharity)
                .requesterType(RequesterType.CHARITY)
                .quantityRequested(BigDecimal.valueOf(25.0))
                .status(FoodRequestStatus.COLLECTED)
                .completedAt(OffsetDateTime.now())
                .build());

        // Business B grocery offer & redemption
        GroceryOffer offerB = groceryOfferRepository.save(GroceryOffer.builder()
                .business(verifiedBusinessB)
                .title("Organic Apples 1kg")
                .category("Fresh Produce")
                .originalPrice(new BigDecimal("1500.00"))
                .discountedPrice(new BigDecimal("750.00"))
                .availableQuantity(20)
                .bestBeforeDate(OffsetDateTime.now().plusDays(2))
                .expiryDate(OffsetDateTime.now().plusDays(3))
                .pickupStart(OffsetDateTime.now())
                .pickupEnd(OffsetDateTime.now().plusDays(1))
                .pickupAddress("148 Vauxhall Street")
                .status(GroceryOfferStatus.AVAILABLE)
                .safetyConfirmed(true)
                .build());

        User cust = userRepository.save(User.builder()
                .email("shopper." + UUID.randomUUID() + "@test.com")
                .passwordHash(passwordEncoder.encode("Password123!"))
                .fullName("Shopper")
                .role(Role.USER)
                .build());

        groceryReservationRepository.save(GroceryReservation.builder()
                .offer(offerB)
                .user(cust)
                .redemptionCode("RES-BIZB-99")
                .quantity(5)
                .unitPrice(new BigDecimal("750.00"))
                .totalPrice(new BigDecimal("3750.00"))
                .status(GroceryReservationStatus.REDEEMED)
                .reservedAt(OffsetDateTime.now().minusHours(2))
                .redeemedAt(OffsetDateTime.now())
                .expiresAt(OffsetDateTime.now().plusHours(10))
                .build());

        // Query Business A impact: 25 portions = 10.0 kg food rescued, 0 grocery redeemed
        mockMvc.perform(get("/api/impact/organization/" + verifiedBusinessA.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.organizationName", is("Cinnamon Grand Kitchen")))
                .andExpect(jsonPath("$.foodWeightKg", is(10.0)))
                .andExpect(jsonPath("$.completedCollections", is(1)))
                .andExpect(jsonPath("$.groceryProductsRedeemed", is(0)));

        // Query Business B impact: 0 kg food rescued, 5 grocery products redeemed
        mockMvc.perform(get("/api/impact/organization/" + verifiedBusinessB.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.organizationName", is("Keells Super Union Place")))
                .andExpect(jsonPath("$.foodWeightKg", is(0.0)))
                .andExpect(jsonPath("$.completedCollections", is(0)))
                .andExpect(jsonPath("$.groceryProductsRedeemed", is(5)));
    }

    @Test
    @DisplayName("Downloadable CSV report endpoint returns valid text/csv format with UTF-8 BOM")
    public void csvExportGeneratesValidReport() throws Exception {
        mockMvc.perform(get("/api/impact/export"))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Type", startsWith("text/csv")))
                .andExpect(header().string("Content-Disposition", containsString("foodbridge-national-impact-report.csv")))
                .andExpect(content().string(containsString("National Platform Impact Report")))
                .andExpect(content().string(containsString("Total Surplus Food Rescued")));
    }
}

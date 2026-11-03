package com.ecoconnect.foodbridge.service;

import com.ecoconnect.foodbridge.model.*;
import com.ecoconnect.foodbridge.model.enums.*;
import com.ecoconnect.foodbridge.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.*;

/**
 * Service to seed realistic, high-fidelity demo data set in Kandy and nearby rural areas:
 * - 4 verified restaurants (Kandy City, Dalada Veediya, Peradeniya, Hanthana)
 * - 3 verified grocery shops (Peradeniya, Katugastota, Digana)
 * - 2 verified charities (Kandy Town, Gampola)
 * - 1 verified animal welfare organization (Kundasale)
 * - 5 campaigns with varied progress (85%, 50%, 25%, 60%, 100%)
 * - Realistic food listings, grocery discount offers, animal feed requirements, and feeding locations
 * - 1 completed CSR partnership with message history, delivery evidence, and activated recognition
 * - Volunteer opportunities with attendee signups and attendance records
 * - Completed activity and impact records generating meaningful numbers for the Impact Dashboard
 * - Demo login accounts for every platform role
 *
 * All demo entities are explicitly labeled with [DEMO DATA] or (Demo Data).
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class DemoDataSeedService implements CommandLineRunner {

    public static final String DEFAULT_DEMO_PASSWORD = "Demo@FoodBridge2026!";
    public static final String ADMIN_PASSWORD = "Admin@FoodBridge2026";

    private final UserRepository userRepository;
    private final BusinessRepository businessRepository;
    private final CharityRepository charityRepository;
    private final AnimalOrganizationRepository animalOrgRepository;
    private final FoodListingRepository foodListingRepository;
    private final FoodRequestRepository foodRequestRepository;
    private final GroceryOfferRepository groceryOfferRepository;
    private final GroceryReservationRepository reservationRepository;
    private final CampaignRepository campaignRepository;
    private final CampaignUpdateRepository campaignUpdateRepository;
    private final CampaignContributionRepository contributionRepository;
    private final PartnershipRepository partnershipRepository;
    private final PartnershipMessageRepository partnershipMessageRepository;
    private final VolunteerOpportunityRepository volunteerOpportunityRepository;
    private final VolunteerParticipationRepository volunteerParticipationRepository;
    private final AnimalLocationRepository animalLocationRepository;
    private final AnimalFeedRequirementRepository animalFeedRequirementRepository;
    private final ActivityRecordRepository activityRecordRepository;
    private final ImpactRecordRepository impactRecordRepository;
    private final BusinessSubscriptionRepository businessSubscriptionRepository;
    private final NotificationRepository notificationRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${foodbridge.seed-demo-data:false}")
    private boolean seedOnStartup;

    @Override
    public void run(String... args) {
        if (seedOnStartup) {
            log.info("Automatic demo data seeding enabled via 'foodbridge.seed-demo-data=true'. Seeding Kandy demo data...");
            seedAllDemoData(false);
        }
    }

    /**
     * Checks if demo data is currently seeded in the database.
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getDemoDataStatus() {
        boolean seeded = userRepository.existsByEmail("restaurant@foodbridge.lk");
        long userCount = userRepository.count();
        long businessCount = businessRepository.count();
        long charityCount = charityRepository.count();
        long animalOrgCount = animalOrgRepository.count();
        long listingCount = foodListingRepository.count();
        long offerCount = groceryOfferRepository.count();
        long campaignCount = campaignRepository.count();
        long partnershipCount = partnershipRepository.count();
        long impactCount = impactRecordRepository.count();

        Map<String, Object> status = new LinkedHashMap<>();
        status.put("isSeeded", seeded);
        status.put("users", userCount);
        status.put("businesses", businessCount);
        status.put("charities", charityCount);
        status.put("animalOrgs", animalOrgCount);
        status.put("foodListings", listingCount);
        status.put("groceryOffers", offerCount);
        status.put("campaigns", campaignCount);
        status.put("partnerships", partnershipCount);
        status.put("impactRecords", impactCount);
        return status;
    }

    /**
     * Seeds the complete Kandy demo dataset. If already seeded and force is false, it returns existing state.
     */
    @Transactional
    public Map<String, Object> seedAllDemoData(boolean force) {
        if (!force && userRepository.existsByEmail("restaurant@foodbridge.lk")) {
            log.info("Demo data already seeded. Skipping. Pass force=true to reload.");
            return getDemoDataStatus();
        }

        log.info("Seeding realistic Kandy demo data set (Restaurants, Groceries, Charities, Campaigns, Impact)...");

        OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);

        // =========================================================================
        // 1. DEMO LOGIN ACCOUNTS (All Roles in README)
        // =========================================================================
        User adminUser = getOrCreateUser("admin@foodbridge.lk", ADMIN_PASSWORD, "FoodBridge Platform Administrator [DEMO]", "+94112345678", Role.ADMIN);
        User restUser1 = getOrCreateUser("restaurant@foodbridge.lk", DEFAULT_DEMO_PASSWORD, "Chef Sunimal Perera [DEMO]", "+94812234001", Role.RESTAURANT);
        User restUser2 = getOrCreateUser("devon.bakery@foodbridge.lk", DEFAULT_DEMO_PASSWORD, "Gamini Jayasuriya [DEMO]", "+94812234002", Role.RESTAURANT);
        User restUser3 = getOrCreateUser("peradeniya.curry@foodbridge.lk", DEFAULT_DEMO_PASSWORD, "Manjula Rathnayake [DEMO]", "+94812234003", Role.RESTAURANT);
        User restUser4 = getOrCreateUser("hillside.spice@foodbridge.lk", DEFAULT_DEMO_PASSWORD, "Chandana Alahakoon [DEMO]", "+94812234004", Role.RESTAURANT);

        User grocUser1 = getOrCreateUser("grocery@foodbridge.lk", DEFAULT_DEMO_PASSWORD, "Nimali Jayawardena [DEMO]", "+94812235001", Role.GROCERY);
        User grocUser2 = getOrCreateUser("cargills.katugastota@foodbridge.lk", DEFAULT_DEMO_PASSWORD, "Roshan Ranasinghe [DEMO]", "+94812235002", Role.GROCERY);
        User grocUser3 = getOrCreateUser("digana.harvest@foodbridge.lk", DEFAULT_DEMO_PASSWORD, "Kithsiri Abeyratne [DEMO]", "+94812235003", Role.GROCERY);

        User charityUser1 = getOrCreateUser("charity@foodbridge.lk", DEFAULT_DEMO_PASSWORD, "Dr. Rohana Wijesinghe [DEMO]", "+94812236001", Role.CHARITY);
        User charityUser2 = getOrCreateUser("centralhills.trust@foodbridge.lk", DEFAULT_DEMO_PASSWORD, "Rev. Sister Mary Theresa [DEMO]", "+94812236002", Role.CHARITY);

        User animalOrgUser = getOrCreateUser("animalorg@foodbridge.lk", DEFAULT_DEMO_PASSWORD, "Anula Bandara [DEMO]", "+94812237001", Role.ANIMAL_ORG);
        User volunteerUser = getOrCreateUser("volunteer@foodbridge.lk", DEFAULT_DEMO_PASSWORD, "Kasun Senanayake [DEMO]", "+94771238001", Role.USER);
        User citizenUser = getOrCreateUser("citizen@foodbridge.lk", DEFAULT_DEMO_PASSWORD, "Priyantha Dissanayake [DEMO]", "+94771238002", Role.USER);

        // =========================================================================
        // 2. RESTAURANTS (4 Verified in Kandy & nearby)
        // =========================================================================
        Business resto1 = getOrCreateBusiness(restUser1, "The Royal Kandyan Resto [DEMO DATA]", BusinessType.RESTAURANT,
                "BRC-KND-REST-001", "Renowned buffet restaurant offering daily fresh surplus cooked meals and rice & curry.",
                "12 Dalada Veediya, Kandy", "Kandy", "Kandy", new BigDecimal("7.2906"), new BigDecimal("80.6337"),
                "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4");

        Business resto2 = getOrCreateBusiness(restUser2, "Devon Heritage Bakery & Tea Lounge [DEMO DATA]", BusinessType.RESTAURANT,
                "BRC-KND-REST-002", "Iconic Kandy bakery supplying day-end bread, rolls, buns, and high-energy baked goods.",
                "22 Dalada Veediya, Kandy", "Kandy", "Kandy", new BigDecimal("7.2930"), new BigDecimal("80.6380"),
                "https://images.unsplash.com/photo-1509440159596-0249088772ff");

        Business resto3 = getOrCreateBusiness(restUser3, "Peradeniya Riverside Curry Pot [DEMO DATA]", BusinessType.RESTAURANT,
                "BRC-KND-REST-003", "Traditional Sri Lankan lunch pack kitchen near Peradeniya botanical gardens.",
                "85 Peradeniya Road, Peradeniya", "Peradeniya", "Kandy", new BigDecimal("7.2580"), new BigDecimal("80.5970"),
                "https://images.unsplash.com/photo-1546069901-ba9599a7e63c");

        Business resto4 = getOrCreateBusiness(restUser4, "Kandy Hillside Spice Kitchen [DEMO DATA]", BusinessType.RESTAURANT,
                "BRC-KND-REST-004", "Hillside eco-restaurant providing nutritious rice, dhal, and vegetable curries for community kitchens.",
                "40 Hanthana Road, Kandy", "Kandy", "Kandy", new BigDecimal("7.2800"), new BigDecimal("80.6250"),
                "https://images.unsplash.com/photo-1555396273-367ea4eb4db5");

        // Subscriptions for businesses (Rule 8 Financial Segregation)
        createSubscriptionIfMissing(resto1, SubscriptionPlan.PREMIUM, BillingCycle.ANNUAL, new BigDecimal("48000.00"), adminUser);
        createSubscriptionIfMissing(resto2, SubscriptionPlan.PROMOTION, BillingCycle.MONTHLY, new BigDecimal("5000.00"), adminUser);
        createSubscriptionIfMissing(resto3, SubscriptionPlan.FREE, BillingCycle.MONTHLY, BigDecimal.ZERO, adminUser);

        // =========================================================================
        // 3. GROCERY SHOPS (3 Verified in Kandy & nearby)
        // =========================================================================
        Business groc1 = getOrCreateBusiness(grocUser1, "Kandy Central Green Grocers [DEMO DATA]", BusinessType.GROCERY,
                "BRC-KND-GROC-001", "Fresh market grocery offering discounted produce near best-before date and safe animal greens.",
                "10 Peradeniya Market Junction, Peradeniya", "Peradeniya", "Kandy", new BigDecimal("7.2610"), new BigDecimal("80.5980"),
                "https://images.unsplash.com/photo-1542838132-92c53300491e");

        Business groc2 = getOrCreateBusiness(grocUser2, "Cargills Food City Katugastota [DEMO DATA]", BusinessType.GROCERY,
                "BRC-KND-GROC-002", "Supermarket chain outlet offering discounted bakery items, dairy, and pantry essentials.",
                "15 Kurunegala Road, Katugastota", "Katugastota", "Kandy", new BigDecimal("7.3260"), new BigDecimal("80.6190"),
                "https://images.unsplash.com/photo-1578916171728-46686eac8d58");

        Business groc3 = getOrCreateBusiness(grocUser3, "Digana Valley Fresh Harvest Super [DEMO DATA]", BusinessType.GROCERY,
                "BRC-KND-GROC-003", "Rural agricultural supermarket providing affordable family grocery bundles and surplus grain.",
                "8 Victoria Highway, Digana", "Digana", "Kandy", new BigDecimal("7.3000"), new BigDecimal("80.7460"),
                "https://images.unsplash.com/photo-1588964895597-cfccd6e2dbf9");

        createSubscriptionIfMissing(groc1, SubscriptionPlan.PROMOTION, BillingCycle.ANNUAL, new BigDecimal("45000.00"), adminUser);
        createSubscriptionIfMissing(groc2, SubscriptionPlan.PREMIUM, BillingCycle.MONTHLY, new BigDecimal("6000.00"), adminUser);

        // =========================================================================
        // 4. CHARITIES (2 Verified in Central Province)
        // =========================================================================
        Charity charity1 = getOrCreateCharity(charityUser1, "Kandy Community Relief Foundation [DEMO DATA]",
                "NGO-KND-001", "Non-profit community foundation coordinating daily hot meal distribution for children and low-income families.",
                "Kandy Central, Peradeniya, and Kadugannawa", "50 Ampitiya Road, Kandy", "Kandy", "Kandy",
                new BigDecimal("7.2880"), new BigDecimal("80.6450"), 450);

        Charity charity2 = getOrCreateCharity(charityUser2, "Central Hills Hope & Nutrition Trust [DEMO DATA]",
                "NGO-KND-002", "Relief trust dedicated to supporting tea estate workers, elderly care homes, and rural villages across Gampola and Nawalapitiya.",
                "Gampola, Nawalapitiya, and Knuckles Foothills", "14 Temple Road, Gampola", "Gampola", "Kandy",
                new BigDecimal("7.1660"), new BigDecimal("80.5690"), 300);

        // =========================================================================
        // 5. ANIMAL WELFARE ORGANIZATION (1 Verified in Kundasale)
        // =========================================================================
        AnimalOrganization animalOrg = getOrCreateAnimalOrg(animalOrgUser, "Kandy Street Animal Care & Welfare Society [DEMO DATA]",
                "AW-KND-001", "Registered animal rescue organization sheltering 180+ street dogs, community cats, and injured animals in Kundasale sanctuary.",
                "Kundasale Animal Sanctuary, Digana Road, Kundasale", "Kundasale", "Kandy",
                new BigDecimal("7.2860"), new BigDecimal("80.6810"), 180);

        // Registered Feeding Locations
        createAnimalLocationIfMissing(animalOrg, "Kundasale Sanctuary Animal Feeding Point [DEMO DATA]", "DOG", 65,
                "Daily 8:00 AM & 5:00 PM", new BigDecimal("7.2860"), new BigDecimal("80.6810"), "Kundasale");
        createAnimalLocationIfMissing(animalOrg, "Katugastota Mahaweli Riverbank Feeding Spot [DEMO DATA]", "DOG_CAT", 40,
                "Every evening at 6:00 PM", new BigDecimal("7.3240"), new BigDecimal("80.6170"), "Katugastota");
        createAnimalLocationIfMissing(animalOrg, "Digana Victoria Reservoir Foothills Habitat [DEMO DATA]", "MIXED_COMMUNITY", 50,
                "Morning 7:30 AM", new BigDecimal("7.2980"), new BigDecimal("80.7440"), "Digana");

        // Feed Requirements (Rule 7 Separation Enforced)
        createFeedRequirementIfMissing(animalOrg, "Cooked Rice, Fish Broth & Poultry Leftovers for Sanctuary Dogs [DEMO DATA]",
                "Dogs, Puppies", "Cooked plain rice, fish scrap broth, unseasoned chicken necks & cartilage. STRICTLY NO ONIONS, GARLIC, OR SPICES.",
                new BigDecimal("50.00"), "kg", "HIGH");
        createFeedRequirementIfMissing(animalOrg, "Clean Vegetable Trimmings & Day-End Bread Ends [DEMO DATA]",
                "Shelter animals, Herbivores", "Carrot tops, cabbage outer leaves, plain day-end bread, boiled pumpkin.",
                new BigDecimal("25.00"), "kg", "MEDIUM");

        // =========================================================================
        // 6. CAMPAIGNS (5 Campaigns with varied progress)
        // =========================================================================
        // Campaign 1: Midday Meals for Rural School Children in Gampola (85% Progress)
        Campaign camp1 = getOrCreateCampaign(charity1, null, "Midday Meals for Rural School Children in Gampola [DEMO DATA]",
                "Providing wholesome hot lunch packs (red rice, dhal, fresh greens, egg) for 200 disadvantaged rural school students in Gampola for the school term.",
                CampaignNeedType.FOOD, 2000, "Meals", 1700, new BigDecimal("400000.00"), new BigDecimal("340000.00"),
                LocalDate.now().minusWeeks(4), LocalDate.now().plusWeeks(4), CampaignStatus.ACTIVE,
                new BigDecimal("7.1650"), new BigDecimal("80.5680"), adminUser, true, resto2, "Sponsored by Devon Heritage Bakery");

        // Campaign 2: Clean Water & Nutrition Rations for Tea Estate Families (50% Progress)
        Campaign camp2 = getOrCreateCampaign(charity2, null, "Clean Water & Nutrition Rations for Tea Estate Families - Nawalapitiya [DEMO DATA]",
                "Distributing monthly dry ration parcels (rice, dhal, milk powder, tea, canned fish) to 250 tea plantation families facing severe seasonal food insecurity.",
                CampaignNeedType.FOOD, 1000, "Ration Kits", 500, new BigDecimal("500000.00"), new BigDecimal("250000.00"),
                LocalDate.now().minusWeeks(3), LocalDate.now().plusWeeks(5), CampaignStatus.ACTIVE,
                new BigDecimal("7.0540"), new BigDecimal("80.5330"), adminUser, false, null, null);

        // Campaign 3: Emergency Food Relief for Vulnerable Elders in Teldeniya (25% Progress)
        Campaign camp3 = getOrCreateCampaign(charity1, null, "Emergency Food Relief for Vulnerable Elders in Teldeniya [DEMO DATA]",
                "Weekly nutrition packs, fortified grains, and medical groceries delivered directly to homebound elderly citizens across Teldeniya and Victoria Valley.",
                CampaignNeedType.FOOD, 500, "Care Kits", 125, new BigDecimal("250000.00"), new BigDecimal("62500.00"),
                LocalDate.now().minusWeeks(1), LocalDate.now().plusWeeks(7), CampaignStatus.ACTIVE,
                new BigDecimal("7.3050"), new BigDecimal("80.7720"), adminUser, false, null, null);

        // Campaign 4: Community Stray Dog & Cat Nutrition Drive - Kundasale (60% Progress - Animal Org)
        Campaign camp4 = getOrCreateCampaign(null, animalOrg, "Community Stray Dog & Cat Nutrition Drive - Kundasale [DEMO DATA]",
                "Procuring high-nutrition feed, rice, and veterinary broth to feed 180 sanctuary animals and 150 community strays around Kundasale and Digana.",
                CampaignNeedType.FOOD, 1000, "kg Feed", 600, new BigDecimal("200000.00"), new BigDecimal("120000.00"),
                LocalDate.now().minusWeeks(2), LocalDate.now().plusWeeks(6), CampaignStatus.ACTIVE,
                new BigDecimal("7.2850"), new BigDecimal("80.6800"), adminUser, true, groc2, "Sponsored by Cargills Food City");

        // Campaign 5: Dry Ration Supply Drive for Knuckles Foothill Villages (100% Completed)
        Campaign camp5 = getOrCreateCampaign(charity2, null, "Dry Ration Supply Drive for Knuckles Foothill Villages [DEMO DATA]",
                "Emergency pre-monsoon dry food distribution for 150 families in isolated Knuckles foothill villages. Successfully concluded and 100% fulfilled.",
                CampaignNeedType.FOOD, 300, "Emergency Kits", 300, new BigDecimal("300000.00"), new BigDecimal("300000.00"),
                LocalDate.now().minusMonths(2), LocalDate.now().minusWeeks(1), CampaignStatus.COMPLETED,
                new BigDecimal("7.3300"), new BigDecimal("80.7200"), adminUser, false, null, null);

        // Campaign Updates for active campaigns
        createCampaignUpdateIfMissing(camp1, "Midterm Milestone Reached: 1,700 Meals Distributed!",
                "Thanks to our generous community donors and Devon Bakery CSR, we have surpassed 1,700 hot midday meals served to primary students.",
                "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c");
        createCampaignUpdateIfMissing(camp2, "First 500 Dry Ration Kits Handed Over at Nawalapitiya Division",
                "Community volunteers completed distribution of the first 500 packages at the community center.",
                "https://images.unsplash.com/photo-1593113598332-cd288d649433");

        // =========================================================================
        // 7. SAMPLE FOOD LISTINGS (Cooked Meals, Bakery, Animal Feed)
        // =========================================================================
        // Listing 1: Available Cooked Meals
        createFoodListingIfMissing(resto1, "Surplus Traditional Rice & Curry Buffet Trays [DEMO DATA]",
                "Fresh surplus from afternoon lunch buffet: steamed white rice, dhal curry, polos ambula, and tempered potato. Packed in food-grade trays.",
                "Cooked Meals", FoodSuitabilityType.HUMAN_CONSUMPTION, false, new BigDecimal("25.00"), "kg",
                now.minusHours(2), now.plusHours(6), now.plusHours(1), now.plusHours(5),
                "12 Dalada Veediya, Kandy", new BigDecimal("7.2906"), new BigDecimal("80.6337"), FoodListingStatus.AVAILABLE);

        // Listing 2: Available Bakery Goods (Animal suitable flagged true)
        createFoodListingIfMissing(resto2, "Day-End Fresh Roast Paan, Buns & Pastries [DEMO DATA]",
                "Batch of day-end freshly baked roast bread, breadcrumbs, vegetable rolls, and plain buns. Suitable for human consumption or animal welfare feed.",
                "Bakery", FoodSuitabilityType.HUMAN_CONSUMPTION, true, new BigDecimal("15.00"), "kg",
                now.minusHours(3), now.plusHours(12), now, now.plusHours(8),
                "22 Dalada Veediya, Kandy", new BigDecimal("7.2930"), new BigDecimal("80.6380"), FoodListingStatus.AVAILABLE);

        // Listing 3: Reserved Cooked Meals (For Peradeniya)
        createFoodListingIfMissing(resto3, "Lunch Pack Surplus: Red Rice, Pol Sambol & Fish Curry [DEMO DATA]",
                "40 wrapped lunch packets packed at 11:30 AM. Stored at safe temperature, ready for charity collection.",
                "Cooked Meals", FoodSuitabilityType.HUMAN_CONSUMPTION, false, new BigDecimal("20.00"), "kg",
                now.minusHours(4), now.plusHours(5), now.minusHours(1), now.plusHours(3),
                "85 Peradeniya Road, Peradeniya", new BigDecimal("7.2580"), new BigDecimal("80.5970"), FoodListingStatus.RESERVED);

        // Listing 4: Completed Food Rescue Listing (Feeds Impact Dashboard)
        FoodListing collectedListing1 = createFoodListingIfMissing(resto4, "Nutritious Rice & Dhal Surplus for Community Kitchens [DEMO DATA]",
                "Surplus bulk cooked red rice, dhal, and vegetable curry collected and distributed by Kandy Community Relief Foundation.",
                "Cooked Meals", FoodSuitabilityType.HUMAN_CONSUMPTION, true, new BigDecimal("35.00"), "kg",
                now.minusDays(1), now.minusHours(10), now.minusHours(18), now.minusHours(12),
                "40 Hanthana Road, Kandy", new BigDecimal("7.2800"), new BigDecimal("80.6250"), FoodListingStatus.COLLECTED);

        // =========================================================================
        // 8. SAMPLE GROCERY OFFERS (Grocery Discounts & Coupons)
        // =========================================================================
        createGroceryOfferIfMissing(groc1, "Fresh Upcountry Cabbage & Carrot Crates (Best Before Tomorrow) [DEMO DATA]",
                "Crisp, Grade-A Nuwara Eliya cabbage and washed carrots reaching optimal sales window. 55% discount.",
                "Fresh Produce", new BigDecimal("500.00"), new BigDecimal("220.00"), 20,
                now.plusDays(1), now.plusDays(2), "10 Peradeniya Market Junction, Peradeniya",
                "https://images.unsplash.com/photo-1540420773420-3366772f4999");

        createGroceryOfferIfMissing(groc1, "Highland Fresh Milk 1L Cartons (Best-Before 2 Days) [DEMO DATA]",
                "Pasteurized fresh cow milk cartons approaching best-before date. Kept strictly refrigerated at 4C.",
                "Dairy", new BigDecimal("480.00"), new BigDecimal("260.00"), 15,
                now.plusDays(2), now.plusDays(3), "10 Peradeniya Market Junction, Peradeniya",
                "https://images.unsplash.com/photo-1550583724-b2692b85b150");

        createGroceryOfferIfMissing(groc2, "Bakery Sliced Sandwich Bread Family Loaves [DEMO DATA]",
                "Standard white sliced sandwich bread family loaves fresh from morning delivery. 50% discount.",
                "Bakery", new BigDecimal("380.00"), new BigDecimal("190.00"), 25,
                now.plusDays(1), now.plusDays(2), "15 Kurunegala Road, Katugastota",
                "https://images.unsplash.com/photo-1589367920969-ab8e050bbb04");

        createGroceryOfferIfMissing(groc2, "Mixed Tropical Fruit Boxes (Ripe Papaya & Bananas) [DEMO DATA]",
                "Ready-to-eat sweet Embul bananas and ripe red papayas ideal for immediate home consumption or desserts.",
                "Fruits", new BigDecimal("750.00"), new BigDecimal("350.00"), 12,
                now.plusDays(2), now.plusDays(3), "15 Kurunegala Road, Katugastota",
                "https://images.unsplash.com/photo-1619566636858-adf3ef46400b");

        createGroceryOfferIfMissing(groc3, "Munchee Cream Cracker & Biscuit Bundle Pack [DEMO DATA]",
                "Assorted cream cracker bundles and Marie biscuits reaching inventory turnaround date. Perfect condition.",
                "Pantry Staples", new BigDecimal("600.00"), new BigDecimal("320.00"), 30,
                now.plusMonths(1), now.plusMonths(1), "8 Victoria Highway, Digana",
                "https://images.unsplash.com/photo-1558961363-fa8fdf82db35");

        createGroceryOfferIfMissing(groc3, "Surplus Cleaned Vegetable Trimmings for Animal Feeding [DEMO DATA]",
                "Cleaned bulk trimmings: pumpkin rinds, carrot shavings, and cabbage leaves. Safe for animal sanctuary feeding.",
                "Animal Feed", new BigDecimal("200.00"), new BigDecimal("50.00"), 40,
                now.plusDays(2), now.plusDays(3), "8 Victoria Highway, Digana",
                "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37");

        // Sample Reservation for citizen
        createReservationIfMissing(groc1, citizenUser, "GROC-KND-9821", 2, new BigDecimal("260.00"), new BigDecimal("520.00"),
                now.minusHours(4), now.plusDays(1), GroceryReservationStatus.RESERVED);

        // =========================================================================
        // 9. A COMPLETED CSR PARTNERSHIP (Devon Bakery & Kandy Community Relief)
        // =========================================================================
        createCompletedPartnershipIfMissing(resto2, charity1, camp1, adminUser, now);

        // =========================================================================
        // 10. VOLUNTEER OPPORTUNITIES & ATTENDANCE
        // =========================================================================
        // Event 1: Active
        VolunteerOpportunity opp1 = createVolunteerOpportunityIfMissing(charityUser1, charity1, null,
                "Kandy Community Relief Foundation [DEMO DATA]", "CHARITY",
                "Rural School Lunchbox Packing & Distribution Drive [DEMO DATA]",
                "Assist our team in packaging 500 hot meal lunchboxes and loading them into distribution vans for Gampola rural schools.",
                VolunteerOpportunityCategory.FOOD_DISTRIBUTION, "Kandy", "Peradeniya",
                "Peradeniya Community Center, Station Road", new BigDecimal("7.2600"), new BigDecimal("80.5960"),
                LocalDate.now().plusDays(4), "08:30 AM", "12:30 PM", new BigDecimal("4.0"), 10, 1, OpportunityStatus.ACTIVE);

        createParticipationIfMissing(opp1, volunteerUser, ParticipationStatus.REGISTERED, BigDecimal.ZERO, now.minusDays(1), null,
                "Registered for morning packing shift.");

        // Event 2: Completed with attended hours
        VolunteerOpportunity opp2 = createVolunteerOpportunityIfMissing(animalOrgUser, null, animalOrg,
                "Kandy Street Animal Care & Welfare Society [DEMO DATA]", "ANIMAL_ORG",
                "Weekend Stray Animal Feeding & Sanctuary Care [DEMO DATA]",
                "Hands-on weekend feeding and medical grooming for 180 rescue dogs and sanctuary cats at Kundasale.",
                VolunteerOpportunityCategory.ANIMAL_WELFARE, "Kandy", "Kundasale",
                "Kundasale Animal Sanctuary, Digana Road", new BigDecimal("7.2860"), new BigDecimal("80.6810"),
                LocalDate.now().minusDays(3), "09:00 AM", "01:00 PM", new BigDecimal("4.0"), 5, 5, OpportunityStatus.COMPLETED);

        createParticipationIfMissing(opp2, volunteerUser, ParticipationStatus.ATTENDED, new BigDecimal("4.0"),
                now.minusDays(5), now.minusDays(3), "Faithfully attended and completed full 4 hours of animal feeding.");

        // Event 3: Completed with attended hours
        VolunteerOpportunity opp3 = createVolunteerOpportunityIfMissing(charityUser2, charity2, null,
                "Central Hills Hope & Nutrition Trust [DEMO DATA]", "CHARITY",
                "Knuckles Foothills Food Relief Dispatch Drive [DEMO DATA]",
                "Loading 4x4 trucks and coordinating dry ration supply distribution to remote Knuckles villages.",
                VolunteerOpportunityCategory.SCHOOL_SUPPLIES, "Kandy", "Gampola",
                "Gampola Central Dispatch Hub, 14 Temple Road", new BigDecimal("7.1660"), new BigDecimal("80.5690"),
                LocalDate.now().minusWeeks(1), "07:30 AM", "01:30 PM", new BigDecimal("6.0"), 8, 8, OpportunityStatus.COMPLETED);

        createParticipationIfMissing(opp3, volunteerUser, ParticipationStatus.ATTENDED, new BigDecimal("6.0"),
                now.minusWeeks(2), now.minusWeeks(1), "Exemplary volunteer service; completed 6 hours of field distribution.");

        // =========================================================================
        // 11. MEANINGFUL IMPACT DASHBOARD METRICS (Verified & Completed Activities)
        // =========================================================================
        // Activity 1: Cooked Meal Rescue from The Royal Kandyan Resto (450 kg -> 900 meals)
        createVerifiedActivityAndImpact(resto1.getUser(), charityUser1, collectedListing1, camp1,
                "FOOD_RESCUE_DISTRIBUTION", new BigDecimal("450.00"), 900, new BigDecimal("1125.00"), 450, 0, now.minusDays(6));

        // Activity 2: Hillside Spice Kitchen surplus (350 kg -> 700 meals)
        createVerifiedActivityAndImpact(resto4.getUser(), charityUser2, null, camp2,
                "FOOD_RESCUE_DISTRIBUTION", new BigDecimal("350.00"), 700, new BigDecimal("875.00"), 350, 0, now.minusDays(4));

        // Activity 3: Devon Heritage Bakery surplus bread (250 kg -> 500 meals)
        createVerifiedActivityAndImpact(resto2.getUser(), charityUser1, null, camp1,
                "BAKERY_RESCUE", new BigDecimal("250.00"), 500, new BigDecimal("625.00"), 250, 0, now.minusDays(2));

        // Activity 4: Safe animal feed collection to Kundasale sanctuary (200 kg animal feed)
        createVerifiedActivityAndImpact(resto2.getUser(), animalOrgUser, null, camp4,
                "ANIMAL_FEED_RESCUE", new BigDecimal("200.00"), 400, new BigDecimal("500.00"), 0, 120, now.minusDays(3));

        // Activity 5: Digana Harvest Super surplus produce to sanctuary (200 kg animal feed)
        createVerifiedActivityAndImpact(groc3.getUser(), animalOrgUser, null, camp4,
                "ANIMAL_FEED_RESCUE", new BigDecimal("200.00"), 400, new BigDecimal("500.00"), 0, 150, now.minusDays(1));

        // Total Verified Seeded Impact:
        // Food Rescued: 1,450 kg | Meals Served: 2,900 | CO2e Saved: 3,625 kg | Beneficiaries: 1,050 humans + 270 animals!

        log.info("Demo data seeding completed successfully! Total Food Rescued: 1,450 kg, Meals: 2,900, CO2e: 3,625 kg.");
        return getDemoDataStatus();
    }

    // =========================================================================
    // HELPER BUILDERS & IDEMPOTENT PERSISTENCE
    // =========================================================================

    private User getOrCreateUser(String email, String rawPassword, String fullName, String phone, Role role) {
        return userRepository.findByEmail(email).orElseGet(() -> {
            User user = User.builder()
                    .email(email.toLowerCase().trim())
                    .passwordHash(passwordEncoder.encode(rawPassword))
                    .fullName(fullName)
                    .phoneNumber(phone)
                    .role(role)
                    .isActive(true)
                    .build();
            return userRepository.save(user);
        });
    }

    private Business getOrCreateBusiness(User user, String name, BusinessType type, String regNo,
                                         String description, String address, String city, String district,
                                         BigDecimal lat, BigDecimal lon, String logoUrl) {
        return businessRepository.findByRegistrationNumber(regNo).orElseGet(() -> {
            Business b = Business.builder()
                    .user(user)
                    .businessName(name)
                    .businessType(type)
                    .registrationNumber(regNo)
                    .description(description)
                    .addressLine1(address)
                    .city(city)
                    .district(district)
                    .latitude(lat)
                    .longitude(lon)
                    .logoUrl(logoUrl)
                    .contactPhone(user.getPhoneNumber())
                    .contactEmail(user.getEmail())
                    .contactPerson(user.getFullName())
                    .verificationStatus(VerificationStatus.VERIFIED)
                    .verifiedAt(OffsetDateTime.now(ZoneOffset.UTC).minusDays(15))
                    .build();
            return businessRepository.save(b);
        });
    }

    private Charity getOrCreateCharity(User user, String name, String regNo, String description,
                                       String operatingArea, String address, String city, String district,
                                       BigDecimal lat, BigDecimal lon, int capacity) {
        return charityRepository.findByRegistrationNumber(regNo).orElseGet(() -> {
            Charity c = Charity.builder()
                    .user(user)
                    .charityName(name)
                    .registrationNumber(regNo)
                    .description(description)
                    .operatingArea(operatingArea)
                    .addressLine1(address)
                    .city(city)
                    .district(district)
                    .latitude(lat)
                    .longitude(lon)
                    .capacityPeople(capacity)
                    .contactPhone(user.getPhoneNumber())
                    .contactEmail(user.getEmail())
                    .contactPerson(user.getFullName())
                    .verificationStatus(VerificationStatus.VERIFIED)
                    .verifiedAt(OffsetDateTime.now(ZoneOffset.UTC).minusDays(20))
                    .build();
            return charityRepository.save(c);
        });
    }

    private AnimalOrganization getOrCreateAnimalOrg(User user, String name, String regNo, String description,
                                                    String address, String city, String district,
                                                    BigDecimal lat, BigDecimal lon, int capacity) {
        return animalOrgRepository.findByRegistrationNumber(regNo).orElseGet(() -> {
            AnimalOrganization a = AnimalOrganization.builder()
                    .user(user)
                    .organizationName(name)
                    .registrationNumber(regNo)
                    .animalTypes("Street Dogs, Sanctuary Cats, Injured Animals")
                    .addressLine1(address)
                    .city(city)
                    .district(district)
                    .latitude(lat)
                    .longitude(lon)
                    .shelterCapacity(capacity)
                    .contactPhone(user.getPhoneNumber())
                    .contactEmail(user.getEmail())
                    .contactPerson(user.getFullName())
                    .verificationStatus(VerificationStatus.VERIFIED)
                    .verifiedAt(OffsetDateTime.now(ZoneOffset.UTC).minusDays(25))
                    .build();
            return animalOrgRepository.save(a);
        });
    }

    private Campaign getOrCreateCampaign(Charity charity, AnimalOrganization animalOrg, String title,
                                         String description, CampaignNeedType needType, int targetQty,
                                         String targetUnit, int currentQty, BigDecimal targetFund, BigDecimal raisedFund,
                                         LocalDate startDate, LocalDate endDate, CampaignStatus status,
                                         BigDecimal lat, BigDecimal lon, User adminUser, boolean isFeatured,
                                         Business sponsorBusiness, String sponsorshipMsg) {
        return campaignRepository.findAll().stream()
                .filter(c -> c.getTitle().equals(title))
                .findFirst()
                .orElseGet(() -> {
                    Campaign c = Campaign.builder()
                            .organizerType(charity != null ? CampaignOrganizerType.CHARITY : CampaignOrganizerType.ANIMAL_ORG)
                            .charity(charity)
                            .animalOrg(animalOrg)
                            .title(title)
                            .description(description)
                            .needType(needType)
                            .targetQuantity(targetQty)
                            .targetUnit(targetUnit)
                            .currentQuantity(currentQty)
                            .targetFundAmount(targetFund)
                            .raisedFundAmount(raisedFund)
                            .startDate(startDate)
                            .endDate(endDate)
                            .status(status)
                            .district("Kandy")
                            .latitude(lat)
                            .longitude(lon)
                            .approvedBy(adminUser)
                            .approvedAt(OffsetDateTime.now(ZoneOffset.UTC).minusDays(10))
                            .isFeatured(isFeatured)
                            .sponsorBusiness(sponsorBusiness)
                            .isSponsored(sponsorBusiness != null)
                            .sponsorshipMessage(sponsorshipMsg)
                            .sponsorshipAmount(sponsorBusiness != null ? new BigDecimal("50000.00") : null)
                            .coverImageUrl("https://images.unsplash.com/photo-1488521787991-ed7bbaae773c")
                            .evidenceUrl("https://storage.googleapis.com/foodbridge/demo/kandy-ds-verification.pdf")
                            .paymentInstructions("Direct Bank Transfer to: " + (charity != null ? charity.getCharityName() : animalOrg.getOrganizationName()) + ". Bank of Ceylon, Kandy Main Branch.")
                            .handoverInstructions("Drop off supplies between 9:00 AM - 4:00 PM on weekdays.")
                            .build();
                    return campaignRepository.save(c);
                });
    }

    private FoodListing createFoodListingIfMissing(Business business, String title, String description,
                                                  String category, FoodSuitabilityType suitability, boolean animalSuitable,
                                                  BigDecimal qty, String unit, OffsetDateTime prep, OffsetDateTime exp,
                                                  OffsetDateTime start, OffsetDateTime end, String address,
                                                  BigDecimal lat, BigDecimal lon, FoodListingStatus status) {
        return foodListingRepository.findByBusinessId(business.getId()).stream()
                .filter(l -> l.getTitle().equals(title))
                .findFirst()
                .orElseGet(() -> {
                    FoodListing fl = FoodListing.builder()
                            .business(business)
                            .title(title)
                            .description(description)
                            .foodCategory(category)
                            .suitabilityType(suitability)
                            .animalSuitable(animalSuitable)
                            .foodSafetyConfirmed(true)
                            .quantity(qty)
                            .unit(unit)
                            .perishable(true)
                            .preparedAt(prep)
                            .expiryDate(exp)
                            .pickupStart(start)
                            .pickupEnd(end)
                            .pickupAddress(address)
                            .latitude(lat)
                            .longitude(lon)
                            .status(status)
                            .imageUrl("https://images.unsplash.com/photo-1546069901-ba9599a7e63c")
                            .build();
                    return foodListingRepository.save(fl);
                });
    }

    private GroceryOffer createGroceryOfferIfMissing(Business business, String title, String desc,
                                                    String category, BigDecimal origPrice, BigDecimal discPrice,
                                                    int qty, OffsetDateTime bestBefore, OffsetDateTime expiry,
                                                    String address, String imageUrl) {
        return groceryOfferRepository.findByBusinessId(business.getId()).stream()
                .filter(o -> o.getTitle().equals(title))
                .findFirst()
                .orElseGet(() -> {
                    OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
                    GroceryOffer go = GroceryOffer.builder()
                            .business(business)
                            .title(title)
                            .description(desc)
                            .category(category)
                            .originalPrice(origPrice)
                            .discountedPrice(discPrice)
                            .currency("LKR")
                            .availableQuantity(qty)
                            .bestBeforeDate(bestBefore)
                            .expiryDate(expiry)
                            .pickupStart(now)
                            .pickupEnd(expiry)
                            .pickupAddress(address)
                            .safetyConfirmed(true)
                            .status(GroceryOfferStatus.AVAILABLE)
                            .imageUrl(imageUrl)
                            .build();
                    return groceryOfferRepository.save(go);
                });
    }

    private void createReservationIfMissing(Business business, User customer, String code, int qty,
                                            BigDecimal unitPrice, BigDecimal totalPrice,
                                            OffsetDateTime reservedAt, OffsetDateTime expiresAt,
                                            GroceryReservationStatus status) {
        if (!reservationRepository.findByRedemptionCode(code).isPresent()) {
            GroceryOffer offer = groceryOfferRepository.findByBusinessId(business.getId()).stream().findFirst().orElse(null);
            if (offer != null) {
                GroceryReservation res = GroceryReservation.builder()
                        .offer(offer)
                        .user(customer)
                        .redemptionCode(code)
                        .quantity(qty)
                        .unitPrice(unitPrice)
                        .totalPrice(totalPrice)
                        .reservedAt(reservedAt)
                        .expiresAt(expiresAt)
                        .status(status)
                        .build();
                reservationRepository.save(res);
            }
        }
    }

    private void createCompletedPartnershipIfMissing(Business business, Charity charity, Campaign campaign, User adminUser, OffsetDateTime now) {
        if (partnershipRepository.findByBusinessId(business.getId()).isEmpty()) {
            Partnership p = Partnership.builder()
                    .business(business)
                    .charity(charity)
                    .campaign(campaign)
                    .partnerType(RequesterType.CHARITY)
                    .contributionType(ContributionType.MONETARY_PLEDGE)
                    .monetaryAmount(new BigDecimal("100000.00"))
                    .quantity(200)
                    .unit("Family Bread Packs")
                    .itemDescription("Rs. 100,000 cash grant + 200 fresh bread packs for Gampola school lunchboxes")
                    .requestedRecognition("Platinum Corporate CSR Partner [DEMO DATA]")
                    .agreedRecognition("Platinum Corporate CSR Partner [DEMO DATA]")
                    .recognitionActive(true)
                    .status(PartnershipStatus.COMPLETED)
                    .agreedTermsSnapshot("Devon Heritage Bakery pledges Rs. 100,000 monetary support + 200 fresh bread packs for Gampola rural schools in exchange for Platinum CSR badge.")
                    .agreedAt(now.minusWeeks(2))
                    .agreedByBusinessUser(business.getUser())
                    .agreedByCharityUser(charity.getUser())
                    .deliveredAt(now.minusDays(5))
                    .deliveryNotes("Dispatched 200 bread loaves via bakery van; deposited Rs. 100,000 to Charity BOC account #00459201. Transfer receipt #BOC-KND-9921 attached.")
                    .completedAt(now.minusDays(2))
                    .completedBy(charity.getUser())
                    .completionNotes("Received and verified by Charity Board Treasurer. 200 packs handed to students at Gampola primary school.")
                    .startDate(LocalDate.now().minusWeeks(2))
                    .endDate(LocalDate.now().plusMonths(1))
                    .build();

            Partnership saved = partnershipRepository.save(p);

            // Create messages thread
            partnershipMessageRepository.save(PartnershipMessage.builder()
                    .partnership(saved).senderUser(business.getUser()).senderRole("BUSINESS")
                    .senderName(business.getBusinessName())
                    .messageText("We would love to support the Gampola school lunch project with Rs. 100,000 + 200 fresh bread packs.")
                    .isCounterProposal(false).build());

            partnershipMessageRepository.save(PartnershipMessage.builder()
                    .partnership(saved).senderUser(charity.getUser()).senderRole("CHARITY")
                    .senderName(charity.getCharityName())
                    .messageText("We accept with immense gratitude! Your Platinum Corporate CSR badge has been reserved.")
                    .isCounterProposal(false).build());

            partnershipMessageRepository.save(PartnershipMessage.builder()
                    .partnership(saved).senderUser(business.getUser()).senderRole("BUSINESS")
                    .senderName(business.getBusinessName())
                    .messageText("Support Dispatched: Bakery courier van delivered the fresh bread packs and bank transfer completed.")
                    .isCounterProposal(false).build());

            partnershipMessageRepository.save(PartnershipMessage.builder()
                    .partnership(saved).senderUser(charity.getUser()).senderRole("CHARITY")
                    .senderName(charity.getCharityName())
                    .messageText("Received and verified! Thank you for nourishing 200 children in Gampola.")
                    .isCounterProposal(false).build());
        }
    }

    private VolunteerOpportunity createVolunteerOpportunityIfMissing(User organizer, Charity charity, AnimalOrganization animalOrg,
                                                                    String orgName, String orgType, String title, String desc,
                                                                    VolunteerOpportunityCategory category, String district, String city,
                                                                    String address, BigDecimal lat, BigDecimal lon,
                                                                    LocalDate eventDate, String start, String end, BigDecimal hours,
                                                                    int needed, int registered, OpportunityStatus status) {
        return volunteerOpportunityRepository.findAll().stream()
                .filter(o -> o.getTitle().equals(title))
                .findFirst()
                .orElseGet(() -> {
                    VolunteerOpportunity opp = VolunteerOpportunity.builder()
                            .organizerUser(organizer)
                            .charity(charity)
                            .animalOrg(animalOrg)
                            .organizerName(orgName)
                            .organizerType(orgType)
                            .title(title)
                            .description(desc)
                            .category(category)
                            .district(district)
                            .city(city)
                            .addressLine(address)
                            .latitude(lat)
                            .longitude(lon)
                            .eventDate(eventDate)
                            .startTime(start)
                            .endTime(end)
                            .estimatedHours(hours)
                            .volunteersNeeded(needed)
                            .volunteersRegistered(registered)
                            .status(status)
                            .contactEmail(organizer.getEmail())
                            .contactPhone(organizer.getPhoneNumber())
                            .build();
                    return volunteerOpportunityRepository.save(opp);
                });
    }

    private void createParticipationIfMissing(VolunteerOpportunity opp, User volunteer, ParticipationStatus status,
                                              BigDecimal hours, OffsetDateTime registeredAt, OffsetDateTime attendedAt, String notes) {
        if (!volunteerParticipationRepository.findByOpportunityIdAndUserId(opp.getId(), volunteer.getId()).isPresent()) {
            VolunteerParticipation vp = VolunteerParticipation.builder()
                    .opportunity(opp)
                    .user(volunteer)
                    .status(status)
                    .hoursVolunteered(hours)
                    .registeredAt(registeredAt)
                    .attendedAt(attendedAt)
                    .attendanceNotes(notes)
                    .build();
            volunteerParticipationRepository.save(vp);
        }
    }

    private void createAnimalLocationIfMissing(AnimalOrganization org, String name, String type, int count,
                                               String routine, BigDecimal lat, BigDecimal lon, String city) {
        if (animalLocationRepository.findByAnimalOrgId(org.getId()).stream().noneMatch(l -> l.getLocationName().equals(name))) {
            AnimalLocation loc = AnimalLocation.builder()
                    .animalOrg(org)
                    .locationName(name)
                    .animalType(type)
                    .estimatedCount(count)
                    .feedingRoutine(routine)
                    .latitude(lat)
                    .longitude(lon)
                    .district("Kandy")
                    .city(city)
                    .addressLine(city + ", Kandy District")
                    .urgencyLevel("HIGH")
                    .isActive(true)
                    .build();
            animalLocationRepository.save(loc);
        }
    }

    private void createFeedRequirementIfMissing(AnimalOrganization org, String title, String animals, String feed,
                                                BigDecimal qty, String unit, String urgency) {
        if (animalFeedRequirementRepository.findByAnimalOrgIdOrderByCreatedAtDesc(org.getId()).stream().noneMatch(r -> r.getTitle().equals(title))) {
            AnimalFeedRequirement req = AnimalFeedRequirement.builder()
                    .animalOrg(org)
                    .title(title)
                    .animalTypes(animals)
                    .suitableFeedTypes(feed)
                    .dailyQuantityNeeded(qty)
                    .unit(unit)
                    .urgency(urgency)
                    .deliveryOrPickupInstructions("Drop off at Kundasale Animal Sanctuary main gate between 7:00 AM - 5:00 PM.")
                    .isActive(true)
                    .build();
            animalFeedRequirementRepository.save(req);
        }
    }

    private void createVerifiedActivityAndImpact(User performedBy, User verifiedBy, FoodListing listing, Campaign campaign,
                                                 String type, BigDecimal foodKg, int meals, BigDecimal co2, int people, int animals,
                                                 OffsetDateTime timestamp) {
        ActivityRecord act = ActivityRecord.builder()
                .activityType(type)
                .relatedListing(listing)
                .relatedCampaign(campaign)
                .performedByUser(performedBy)
                .verifiedByUser(verifiedBy)
                .status(ActivityStatus.COMPLETED)
                .completionTimestamp(timestamp)
                .build();
        ActivityRecord savedAct = activityRecordRepository.save(act);

        ImpactRecord imp = ImpactRecord.builder()
                .activityRecord(savedAct)
                .foodWeightKg(foodKg)
                .mealsRescued(meals)
                .co2SavingsKg(co2)
                .peopleFed(people)
                .animalsFed(animals)
                .calculatedAt(timestamp)
                .build();
        impactRecordRepository.save(imp);
    }

    private void createSubscriptionIfMissing(Business business, SubscriptionPlan plan, BillingCycle cycle, BigDecimal price, User admin) {
        if (businessSubscriptionRepository.findByBusinessIdOrderByCreatedAtDesc(business.getId()).isEmpty()) {
            OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
            BusinessSubscription sub = BusinessSubscription.builder()
                    .business(business)
                    .plan(plan)
                    .billingCycle(cycle)
                    .status(SubscriptionStatus.ACTIVE)
                    .startDate(now.minusMonths(1))
                    .endDate(now.plusMonths(11))
                    .priceLkr(price)
                    .invoiceNumber("INV-KND-" + System.currentTimeMillis() % 100000)
                    .paymentMethod("BANK_TRANSFER")
                    .paymentReference("BOC-KND-REF-" + System.currentTimeMillis() % 10000)
                    .notes("Annual subscription active for verified business.")
                    .activatedAt(now.minusMonths(1))
                    .activatedBy(admin)
                    .build();
            businessSubscriptionRepository.save(sub);
        }
    }

    private void createCampaignUpdateIfMissing(Campaign campaign, String title, String description, String photoUrl) {
        if (campaignUpdateRepository.findByCampaignIdOrderByDistributionDateDesc(campaign.getId()).isEmpty()) {
            CampaignUpdate update = CampaignUpdate.builder()
                    .campaign(campaign)
                    .title(title)
                    .description(description)
                    .photoUrl(photoUrl)
                    .quantityDistributed(250)
                    .distributionDate(LocalDate.now().minusWeeks(1))
                    .build();
            campaignUpdateRepository.save(update);
        }
    }
}

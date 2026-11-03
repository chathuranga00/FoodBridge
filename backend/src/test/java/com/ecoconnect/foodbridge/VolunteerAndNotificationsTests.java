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
import java.time.ZoneOffset;
import java.util.UUID;

import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("local")
class VolunteerAndNotificationsTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CharityRepository charityRepository;

    @Autowired
    private BusinessRepository businessRepository;

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
    private VolunteerOpportunityRepository opportunityRepository;

    @Autowired
    private VolunteerParticipationRepository participationRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private ActivityRecordRepository activityRecordRepository;

    @Autowired
    private ImpactRecordRepository impactRecordRepository;

    private String getAuthToken(String email, String password, Role role) throws Exception {
        RegisterRequest register = RegisterRequest.builder()
                .email(email)
                .password(password)
                .fullName("Test " + role.name())
                .phoneNumber("+9477" + (Math.abs(email.hashCode()) % 10000000))
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

    private Charity createVerifiedCharity(User user, String name, String district) {
        return charityRepository.save(Charity.builder()
                .user(user)
                .charityName(name)
                .registrationNumber("CH-" + UUID.randomUUID().toString().substring(0, 8))
                .description("Dedicated community support organization")
                .addressLine1("123 Main Street")
                .city(district)
                .district(district)
                .latitude(BigDecimal.valueOf(6.9271))
                .longitude(BigDecimal.valueOf(79.8612))
                .contactPerson("Dr. Jayasinghe")
                .contactPhone("+94771234567")
                .contactEmail(user.getEmail())
                .verificationStatus(VerificationStatus.VERIFIED)
                .build());
    }

    @Test
    @DisplayName("Charity creates volunteer opportunity and public can browse/filter")
    void testCreateOpportunity_And_PublicBrowse() throws Exception {
        String charityEmail = "vol_charity_" + UUID.randomUUID().toString().substring(0, 8) + "@example.com";
        String charityToken = getAuthToken(charityEmail, "Password123!", Role.CHARITY);

        // Verify charity
        User charityUser = userRepository.findByEmail(charityEmail).orElseThrow();
        Charity charity = createVerifiedCharity(charityUser, "Volunteering Hope Foundation", "Colombo");

        // Create Volunteer Opportunity
        VolunteerOpportunityCreateDto createDto = VolunteerOpportunityCreateDto.builder()
                .title("Weekend Community Kitchen Drive")
                .description("Help prepare and distribute nutritious cooked meals in Colombo North.")
                .category(VolunteerOpportunityCategory.FOOD_DISTRIBUTION)
                .district("Colombo")
                .city("Colombo North")
                .addressLine("120 Baseline Road, Colombo")
                .eventDate(LocalDate.now().plusDays(5))
                .startTime("08:30 AM")
                .endTime("12:30 PM")
                .estimatedHours(BigDecimal.valueOf(4.0))
                .volunteersNeeded(5)
                .skillsRequired("Food packing, friendly attitude")
                .contactPhone("+94771234567")
                .build();

        MvcResult createResult = mockMvc.perform(post("/api/volunteer/opportunities")
                        .header("Authorization", "Bearer " + charityToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createDto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNotEmpty())
                .andExpect(jsonPath("$.title").value("Weekend Community Kitchen Drive"))
                .andExpect(jsonPath("$.category").value("FOOD_DISTRIBUTION"))
                .andExpect(jsonPath("$.volunteersNeeded").value(5))
                .andExpect(jsonPath("$.volunteersRegistered").value(0))
                .andReturn();

        JsonNode oppNode = objectMapper.readTree(createResult.getResponse().getContentAsString());
        UUID oppId = UUID.fromString(oppNode.get("id").asText());

        // Public browse without authentication
        mockMvc.perform(get("/api/volunteer/opportunities")
                        .param("category", "FOOD_DISTRIBUTION")
                        .param("district", "Colombo"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", not(empty())))
                .andExpect(jsonPath("$[?(@.id == '" + oppId + "')].title").value("Weekend Community Kitchen Drive"));

        // Public detail by ID
        mockMvc.perform(get("/api/volunteer/opportunities/" + oppId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(oppId.toString()))
                .andExpect(jsonPath("$.organizerName").value("Volunteering Hope Foundation"));
    }

    @Test
    @DisplayName("User signs up for opportunity, duplicate is blocked, notifications triggered")
    void testVolunteerSignUp_And_Notifications() throws Exception {
        String charityEmail = "vol_org_" + UUID.randomUUID().toString().substring(0, 8) + "@example.com";
        String charityToken = getAuthToken(charityEmail, "Password123!", Role.CHARITY);

        User charityUser = userRepository.findByEmail(charityEmail).orElseThrow();
        Charity charity = createVerifiedCharity(charityUser, "Green Colombo Initiative", "Colombo");

        VolunteerOpportunity opp = opportunityRepository.save(VolunteerOpportunity.builder()
                .organizerUser(charityUser)
                .charity(charity)
                .organizerName(charity.getCharityName())
                .organizerType("CHARITY")
                .title("Mount Lavinia Beach Cleanup")
                .description("Join our coastal conservation drive.")
                .category(VolunteerOpportunityCategory.ENVIRONMENTAL)
                .district("Colombo")
                .city("Mount Lavinia")
                .eventDate(LocalDate.now().plusDays(3))
                .startTime("07:00 AM")
                .endTime("10:00 AM")
                .estimatedHours(BigDecimal.valueOf(3.0))
                .volunteersNeeded(2)
                .volunteersRegistered(0)
                .status(OpportunityStatus.ACTIVE)
                .build());

        // Create volunteer user
        String volunteerEmail = "volunteer_" + UUID.randomUUID().toString().substring(0, 8) + "@example.com";
        String volunteerToken = getAuthToken(volunteerEmail, "Password123!", Role.USER);
        User volunteerUser = userRepository.findByEmail(volunteerEmail).orElseThrow();

        // Check initial notifications for charity
        long charityNotifsBefore = notificationRepository.countByUserIdAndIsReadFalse(charityUser.getId());

        // Volunteer signs up
        VolunteerSignUpDto signUpDto = VolunteerSignUpDto.builder()
                .notes("Eager to assist with debris sorting.")
                .build();

        mockMvc.perform(post("/api/volunteer/opportunities/" + opp.getId() + "/signup")
                        .header("Authorization", "Bearer " + volunteerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(signUpDto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("REGISTERED"))
                .andExpect(jsonPath("$.opportunityTitle").value("Mount Lavinia Beach Cleanup"));

        // Capacity increment verified
        VolunteerOpportunity refreshedOpp = opportunityRepository.findById(opp.getId()).orElseThrow();
        assertEquals(1, refreshedOpp.getVolunteersRegistered());

        // Notifications checked
        long charityNotifsAfter = notificationRepository.countByUserIdAndIsReadFalse(charityUser.getId());
        assertEquals(charityNotifsBefore + 1, charityNotifsAfter);

        // Volunteer also received registration confirmation notification
        long volunteerNotifs = notificationRepository.countByUserIdAndIsReadFalse(volunteerUser.getId());
        assertTrue(volunteerNotifs >= 1);

        // Duplicate registration blocked
        mockMvc.perform(post("/api/volunteer/opportunities/" + opp.getId() + "/signup")
                        .header("Authorization", "Bearer " + volunteerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(signUpDto)))
                .andExpect(status().isBadRequest());

        // Volunteer views "My Participations"
        mockMvc.perform(get("/api/volunteer/my-participations")
                        .header("Authorization", "Bearer " + volunteerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].opportunityTitle").value("Mount Lavinia Beach Cleanup"))
                .andExpect(jsonPath("$[0].status").value("REGISTERED"));
    }

    @Test
    @DisplayName("Organizer marks attendance (ATTENDED) and activity feeds into Impact Dashboard")
    void testMarkAttendance_FeedsImpactDashboard() throws Exception {
        String charityEmail = "impact_charity_" + UUID.randomUUID().toString().substring(0, 8) + "@example.com";
        String charityToken = getAuthToken(charityEmail, "Password123!", Role.CHARITY);

        User charityUser = userRepository.findByEmail(charityEmail).orElseThrow();
        Charity charity = createVerifiedCharity(charityUser, "Care & Feed Sri Lanka", "Kandy");

        VolunteerOpportunity opp = opportunityRepository.save(VolunteerOpportunity.builder()
                .organizerUser(charityUser)
                .charity(charity)
                .organizerName(charity.getCharityName())
                .organizerType("CHARITY")
                .title("Rural School Supply Distribution")
                .description("Distribute books and uniforms.")
                .category(VolunteerOpportunityCategory.SCHOOL_SUPPLIES)
                .district("Kandy")
                .eventDate(LocalDate.now().plusDays(2))
                .estimatedHours(BigDecimal.valueOf(3.5))
                .volunteersNeeded(1)
                .volunteersRegistered(1)
                .status(OpportunityStatus.ACTIVE)
                .build());

        String volunteerEmail = "attendee_" + UUID.randomUUID().toString().substring(0, 8) + "@example.com";
        getAuthToken(volunteerEmail, "Password123!", Role.USER);
        User volunteerUser = userRepository.findByEmail(volunteerEmail).orElseThrow();

        VolunteerParticipation participation = participationRepository.save(VolunteerParticipation.builder()
                .opportunity(opp)
                .user(volunteerUser)
                .status(ParticipationStatus.REGISTERED)
                .hoursVolunteered(BigDecimal.ZERO)
                .registeredAt(OffsetDateTime.now(ZoneOffset.UTC))
                .build());

        // Organizer retrieves attendee list
        mockMvc.perform(get("/api/volunteer/opportunities/" + opp.getId() + "/attendees")
                        .header("Authorization", "Bearer " + charityToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].volunteerName").value(volunteerUser.getFullName()));

        // Organizer marks attendance as ATTENDED with 3.5 hours
        AttendanceMarkDto markDto = AttendanceMarkDto.builder()
                .status(ParticipationStatus.ATTENDED)
                .hoursVolunteered(BigDecimal.valueOf(3.5))
                .attendanceNotes("Outstanding commitment and timely distribution.")
                .build();

        mockMvc.perform(post("/api/volunteer/opportunities/" + opp.getId() + "/attendees/" + participation.getId() + "/attendance")
                        .header("Authorization", "Bearer " + charityToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(markDto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("ATTENDED"))
                .andExpect(jsonPath("$.hoursVolunteered").value(3.5));

        // Verify ActivityRecord and ImpactRecord created
        boolean hasCompletedActivity = activityRecordRepository.findAll().stream()
                .anyMatch(a -> a.getActivityType().equals("VOLUNTEER_WORK")
                        && a.getPerformedByUser().getId().equals(volunteerUser.getId())
                        && a.getStatus() == ActivityStatus.COMPLETED);
        assertTrue(hasCompletedActivity, "Completed volunteer activity record must be logged");

        // Verify Impact Dashboard reflects this completed activity
        MvcResult impactResult = mockMvc.perform(get("/api/impact/summary"))
                .andExpect(status().isOk())
                .andReturn();

        JsonNode impactNode = objectMapper.readTree(impactResult.getResponse().getContentAsString());
        assertTrue(impactNode.get("activeVolunteers").asLong() >= 1, "Impact dashboard must count attended volunteers");
        assertTrue(impactNode.get("totalVolunteerHours").asLong() >= 3, "Impact dashboard must sum volunteer hours");
        assertTrue(impactNode.get("completedVolunteerActivities").asLong() >= 1, "Impact dashboard must count completed activities");
    }

    @Test
    @DisplayName("Notification Center endpoints: unread count, list, mark read, mark all read")
    void testNotificationCenterEndpoints() throws Exception {
        String userEmail = "notif_user_" + UUID.randomUUID().toString().substring(0, 8) + "@example.com";
        String token = getAuthToken(userEmail, "Password123!", Role.USER);
        User user = userRepository.findByEmail(userEmail).orElseThrow();

        // Seed 3 unread notifications
        Notification n1 = notificationRepository.save(Notification.builder()
                .user(user)
                .title("Notice 1")
                .message("Message 1")
                .type("FOOD_REQUEST_APPROVED")
                .isRead(false)
                .build());

        Notification n2 = notificationRepository.save(Notification.builder()
                .user(user)
                .title("Notice 2")
                .message("Message 2")
                .type("COUPON_RESERVED")
                .isRead(false)
                .build());

        Notification n3 = notificationRepository.save(Notification.builder()
                .user(user)
                .title("Notice 3")
                .message("Message 3")
                .type("PARTNERSHIP_UPDATE")
                .isRead(false)
                .build());

        // Check unread count
        mockMvc.perform(get("/api/notifications/unread-count")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.unreadCount").value(3));

        // Mark single notification as read
        mockMvc.perform(patch("/api/notifications/" + n1.getId() + "/read")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/notifications/unread-count")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.unreadCount").value(2));

        // Mark all as read
        mockMvc.perform(patch("/api/notifications/read-all")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/notifications/unread-count")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.unreadCount").value(0));
    }

    @Test
    @DisplayName("Key events notifications: Food Request Approved, Coupon Reserved, Verification Decision")
    void testKeyEventsNotifications() throws Exception {
        // 1. Food Request Approved
        String businessEmail = "biz_notif_" + UUID.randomUUID().toString().substring(0, 8) + "@example.com";
        String bizToken = getAuthToken(businessEmail, "Password123!", Role.RESTAURANT);
        User bizUser = userRepository.findByEmail(businessEmail).orElseThrow();

        Business biz = businessRepository.save(Business.builder()
                .user(bizUser)
                .businessName("Cinnamon Grand Kitchens")
                .businessType(BusinessType.RESTAURANT)
                .registrationNumber("HOTEL-COL-" + UUID.randomUUID().toString().substring(0, 6))
                .addressLine1("77 Galle Road")
                .city("Colombo")
                .district("Colombo")
                .latitude(BigDecimal.valueOf(6.9175))
                .longitude(BigDecimal.valueOf(79.8483))
                .contactPerson("Manager Rohan")
                .contactPhone("+94112345678")
                .verificationStatus(VerificationStatus.VERIFIED)
                .build());

        FoodListing listing = foodListingRepository.save(FoodListing.builder()
                .business(biz)
                .title("Surplus Dinner Buffet Rice & Curry")
                .description("Freshly cooked rice, curry, and vegetables.")
                .foodCategory("Prepared Meals")
                .quantity(BigDecimal.valueOf(15))
                .unit("kg")
                .suitabilityType(FoodSuitabilityType.HUMAN_CONSUMPTION)
                .dietaryFlags("Halal")
                .pickupAddress("77 Galle Road, Colombo")
                .latitude(BigDecimal.valueOf(6.9175))
                .longitude(BigDecimal.valueOf(79.8483))
                .pickupStart(OffsetDateTime.now(ZoneOffset.UTC).minusHours(1))
                .pickupEnd(OffsetDateTime.now(ZoneOffset.UTC).plusHours(4))
                .expiryDate(OffsetDateTime.now(ZoneOffset.UTC).plusHours(6))
                .status(FoodListingStatus.AVAILABLE)
                .build());

        String charityEmail = "charity_notif_" + UUID.randomUUID().toString().substring(0, 8) + "@example.com";
        String charityToken = getAuthToken(charityEmail, "Password123!", Role.CHARITY);
        User charityUser = userRepository.findByEmail(charityEmail).orElseThrow();
        Charity charity = createVerifiedCharity(charityUser, "Meals of Mercy", "Colombo");

        // Charity requests food
        FoodRequestCreateDto reqDto = FoodRequestCreateDto.builder()
                .listingId(listing.getId())
                .quantityRequested(BigDecimal.valueOf(10))
                .notes("For evening homeless shelter feeding.")
                .build();

        MvcResult reqResult = mockMvc.perform(post("/api/food-rescue/requests")
                        .header("Authorization", "Bearer " + charityToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(reqDto)))
                .andExpect(status().isCreated())
                .andReturn();

        JsonNode reqNode = objectMapper.readTree(reqResult.getResponse().getContentAsString());
        UUID requestId = UUID.fromString(reqNode.get("id").asText());

        // Business approves food request
        FoodRequestDecisionDto approveDto = FoodRequestDecisionDto.builder()
                .decision("APPROVE")
                .build();

        mockMvc.perform(post("/api/food-rescue/requests/" + requestId + "/decide")
                        .header("Authorization", "Bearer " + bizToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(approveDto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("ACCEPTED"));

        // Verify Charity received FOOD_REQUEST_APPROVED notification
        boolean charityNotified = notificationRepository.findByUserIdOrderByCreatedAtDesc(charityUser.getId()).stream()
                .anyMatch(n -> n.getType().equals("FOOD_REQUEST_APPROVED") && n.getTitle().contains("Surplus Dinner Buffet"));
        assertTrue(charityNotified, "Charity must receive notification when food request is approved");

        // 2. Grocery Coupon Reserved
        GroceryOffer offer = groceryOfferRepository.save(GroceryOffer.builder()
                .business(biz)
                .title("Dairy & Yogurt Family Pack")
                .category("Dairy")
                .originalPrice(BigDecimal.valueOf(1500.0))
                .discountedPrice(BigDecimal.valueOf(750.0))
                .availableQuantity(10)
                .bestBeforeDate(OffsetDateTime.now(ZoneOffset.UTC).plusDays(2))
                .expiryDate(OffsetDateTime.now(ZoneOffset.UTC).plusDays(3))
                .pickupStart(OffsetDateTime.now(ZoneOffset.UTC).minusHours(1))
                .pickupEnd(OffsetDateTime.now(ZoneOffset.UTC).plusHours(8))
                .safetyConfirmed(true)
                .status(GroceryOfferStatus.AVAILABLE)
                .build());

        String customerEmail = "cust_notif_" + UUID.randomUUID().toString().substring(0, 8) + "@example.com";
        String customerToken = getAuthToken(customerEmail, "Password123!", Role.USER);
        User customerUser = userRepository.findByEmail(customerEmail).orElseThrow();

        GroceryReservationRequest resDto = GroceryReservationRequest.builder()
                .quantity(2)
                .build();

        mockMvc.perform(post("/api/grocery/offers/" + offer.getId() + "/reserve")
                        .header("Authorization", "Bearer " + customerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(resDto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("RESERVED"))
                .andExpect(jsonPath("$.redemptionCode").isNotEmpty());

        // Verify customer received COUPON_RESERVED notification
        boolean customerNotified = notificationRepository.findByUserIdOrderByCreatedAtDesc(customerUser.getId()).stream()
                .anyMatch(n -> n.getType().equals("COUPON_RESERVED") && n.getTitle().contains("Dairy & Yogurt"));
        assertTrue(customerNotified, "Customer must receive notification when grocery coupon is reserved");
    }
}

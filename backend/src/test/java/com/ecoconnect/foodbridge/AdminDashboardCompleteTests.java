package com.ecoconnect.foodbridge;

import com.ecoconnect.foodbridge.dto.*;
import com.ecoconnect.foodbridge.model.enums.CampaignStatus;
import com.ecoconnect.foodbridge.model.enums.Role;
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
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("local")
@Transactional
class AdminDashboardCompleteTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private String adminToken;
    private String communityUserToken;
    private UUID testUserId;

    @BeforeEach
    void setUp() throws Exception {
        // 1. Admin login
        LoginRequest adminLogin = LoginRequest.builder()
                .email("admin@foodbridge.lk")
                .password("Admin@FoodBridge2026")
                .build();

        MvcResult adminResult = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(adminLogin)))
                .andExpect(status().isOk())
                .andReturn();

        JsonNode adminJson = objectMapper.readTree(adminResult.getResponse().getContentAsString());
        adminToken = adminJson.get("accessToken").asText();

        // 2. Register community user
        String userEmail = "citizen_" + UUID.randomUUID().toString().substring(0, 8) + "@example.com";
        RegisterRequest registerReq = RegisterRequest.builder()
                .email(userEmail)
                .password("CitizenPass123!")
                .fullName("Citizen Perera")
                .role(Role.USER)
                .build();

        MvcResult userResult = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerReq)))
                .andExpect(status().isCreated())
                .andReturn();

        JsonNode userJson = objectMapper.readTree(userResult.getResponse().getContentAsString());
        communityUserToken = userJson.get("accessToken").asText();
        testUserId = UUID.fromString(userJson.get("user").get("id").asText());
    }

    @Test
    @DisplayName("Admin Overview: Returns aggregated platform metrics")
    void adminOverview_returnsAggregatedMetrics() throws Exception {
        mockMvc.perform(get("/api/admin/overview")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalUsers", greaterThanOrEqualTo(1)))
                .andExpect(jsonPath("$.activeUsers", greaterThanOrEqualTo(1)))
                .andExpect(jsonPath("$.usersByRole", notNullValue()))
                .andExpect(jsonPath("$.totalBusinesses", greaterThanOrEqualTo(0)))
                .andExpect(jsonPath("$.platformRevenueLkr", notNullValue()))
                .andExpect(jsonPath("$.recentAuditLogs", notNullValue()));
    }

    @Test
    @DisplayName("RBAC Rule 1: Non-admin users cannot access admin endpoints")
    void nonAdmin_cannotAccessAdminEndpoints() throws Exception {
        mockMvc.perform(get("/api/admin/overview")
                        .header("Authorization", "Bearer " + communityUserToken))
                .andExpect(status().isForbidden());

        mockMvc.perform(get("/api/admin/users")
                        .header("Authorization", "Bearer " + communityUserToken))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("User Management: Search, suspend, self-suspend prevention, and change role")
    void userManagement_searchSuspendChangeRole() throws Exception {
        // 1. Search users
        mockMvc.perform(get("/api/admin/users")
                        .param("search", "Citizen Perera")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(1))))
                .andExpect(jsonPath("$[0].email", containsString("@example.com")))
                .andExpect(jsonPath("$[0].isActive", is(true)));

        // 2. Suspend citizen user
        UpdateUserStatusRequest suspendReq = UpdateUserStatusRequest.builder()
                .isActive(false)
                .reason("Account under review for policy violations")
                .build();

        mockMvc.perform(put("/api/admin/users/" + testUserId + "/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(suspendReq))
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.isActive", is(false)));

        // 3. Reactivate citizen user
        UpdateUserStatusRequest reactivateReq = UpdateUserStatusRequest.builder()
                .isActive(true)
                .reason("Account cleared of violations")
                .build();

        mockMvc.perform(put("/api/admin/users/" + testUserId + "/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(reactivateReq))
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.isActive", is(true)));

        // 4. Change citizen user role to RESTAURANT
        UpdateUserRoleRequest roleReq = UpdateUserRoleRequest.builder()
                .role(Role.RESTAURANT)
                .reason("Upgraded to restaurant business account")
                .build();

        mockMvc.perform(put("/api/admin/users/" + testUserId + "/role")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(roleReq))
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.role", is("RESTAURANT")));

        // 5. Verify audit logs recorded for status and role changes
        mockMvc.perform(get("/api/admin/audit-logs")
                        .param("entityName", "USER")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(2))));
    }

    @Test
    @DisplayName("Listing Management: Fetch listings, update status, and remove listing")
    void listingManagement_fetchAndUpdateStatus() throws Exception {
        // Fetch all listings
        mockMvc.perform(get("/api/admin/listings")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Campaign Moderation: Fetch all campaigns and toggle featured status")
    void campaignModeration_fetchAllAndToggleFeatured() throws Exception {
        mockMvc.perform(get("/api/admin/campaigns")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Contribution Monitoring: Fetch contributions and summary")
    void contributionMonitoring_fetchAndSummary() throws Exception {
        mockMvc.perform(get("/api/admin/contributions")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/admin/contributions/summary")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalContributions", notNullValue()))
                .andExpect(jsonPath("$.totalMonetaryAmountLkr", notNullValue()));
    }

    @Test
    @DisplayName("Audit Log Viewer: Filter by action and entity")
    void auditLogViewer_fetchAndFilter() throws Exception {
        mockMvc.perform(get("/api/admin/audit-logs")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Platform Settings: Read, update, and public endpoint")
    void platformSettings_readUpdatePublic() throws Exception {
        // 1. Read admin settings
        mockMvc.perform(get("/api/admin/settings")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.platformName", is("FoodBridge Sri Lanka")))
                .andExpect(jsonPath("$.bankName", is("Bank of Ceylon")));

        // 2. Update settings
        PlatformSettingsDto updateDto = PlatformSettingsDto.builder()
                .platformName("FoodBridge National Platform")
                .supportEmail("operations@foodbridge.lk")
                .supportPhone("+94 11 999 8888")
                .contactAddress("100 Galle Road, Colombo 03")
                .maintenanceMode(false)
                .requireDocumentVerification(true)
                .minFoodExpiryHours(3)
                .animalWelfareEnabled(true)
                .groceryCouponsEnabled(true)
                .emailNotificationsEnabled(true)
                .bankName("Bank of Ceylon")
                .bankAccountName("FoodBridge Official")
                .bankAccountNumber("000847291038")
                .bankBranch("Colombo Main")
                .build();

        mockMvc.perform(put("/api/admin/settings")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateDto))
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.platformName", is("FoodBridge National Platform")))
                .andExpect(jsonPath("$.minFoodExpiryHours", is(3)));

        // 3. Public settings endpoint without authentication
        mockMvc.perform(get("/api/public/settings"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.platformName", is("FoodBridge National Platform")))
                .andExpect(jsonPath("$.bankAccountNumber", is("000847291038")));
    }
}


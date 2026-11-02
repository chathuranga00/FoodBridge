package com.ecoconnect.foodbridge;

import com.ecoconnect.foodbridge.dto.LoginRequest;
import com.ecoconnect.foodbridge.dto.RegisterRequest;
import com.ecoconnect.foodbridge.model.enums.Role;
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

import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("local")
@Transactional
class RoleAccessSecurityTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private String getAccessTokenFor(String email, String password, Role role) throws Exception {
        RegisterRequest registerReq = RegisterRequest.builder()
                .email(email)
                .password(password)
                .fullName("Test User")
                .role(role)
                .build();

        MvcResult result = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerReq)))
                .andExpect(status().isCreated())
                .andReturn();

        JsonNode responseNode = objectMapper.readTree(result.getResponse().getContentAsString());
        return responseNode.get("accessToken").asText();
    }

    private String getAdminToken() throws Exception {
        LoginRequest adminLogin = LoginRequest.builder()
                .email("admin@foodbridge.lk")
                .password("Admin@FoodBridge2026")
                .build();

        MvcResult result = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(adminLogin)))
                .andExpect(status().isOk())
                .andReturn();

        JsonNode responseNode = objectMapper.readTree(result.getResponse().getContentAsString());
        return responseNode.get("accessToken").asText();
    }

    @Test
    @DisplayName("Admin role can access /api/test/admin")
    void testAdminAccessAllowed() throws Exception {
        String adminToken = getAdminToken();

        mockMvc.perform(get("/api/test/admin")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message", is("Welcome Admin - administrative access confirmed")));
    }

    @Test
    @DisplayName("Regular USER cannot access /api/test/admin (403 Forbidden)")
    void testRegularUserDeniedAdminAccess() throws Exception {
        String userToken = getAccessTokenFor("regular.user@gmail.com", "Password123!", Role.USER);

        mockMvc.perform(get("/api/test/admin")
                        .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status", is(403)))
                .andExpect(jsonPath("$.error", is("Forbidden")));
    }

    @Test
    @DisplayName("RESTAURANT role can access /api/test/restaurant")
    void testRestaurantAccessAllowed() throws Exception {
        String restToken = getAccessTokenFor("cinnamon.grand@dining.lk", "GrandPass123", Role.RESTAURANT);

        mockMvc.perform(get("/api/test/restaurant")
                        .header("Authorization", "Bearer " + restToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message", is("Welcome Restaurant - donor access confirmed")));
    }

    @Test
    @DisplayName("CHARITY role cannot access /api/test/restaurant (403 Forbidden)")
    void testCharityDeniedRestaurantEndpoint() throws Exception {
        String charityToken = getAccessTokenFor("redcross@srilanka.lk", "RedCross123", Role.CHARITY);

        mockMvc.perform(get("/api/test/restaurant")
                        .header("Authorization", "Bearer " + charityToken))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status", is(403)));
    }

    @Test
    @DisplayName("Unauthenticated request to protected endpoint returns 401 Unauthorized")
    void testUnauthenticatedAccessRejected() throws Exception {
        mockMvc.perform(get("/api/test/admin"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status", is(401)))
                .andExpect(jsonPath("$.error", is("Unauthorized")));
    }
}


package com.ecoconnect.foodbridge;

import com.ecoconnect.foodbridge.dto.LoginRequest;
import com.ecoconnect.foodbridge.dto.RefreshTokenRequest;
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

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("local")
@Transactional
class AuthControllerTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("POST /api/auth/register creates user and returns JWT tokens")
    void testRegisterSuccess() throws Exception {
        RegisterRequest request = RegisterRequest.builder()
                .email("volunteer.colombo@gmail.com")
                .password("Password123!")
                .fullName("Kamal Perera")
                .phoneNumber("+94771234567")
                .role(Role.USER)
                .build();

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.accessToken", notNullValue()))
                .andExpect(jsonPath("$.refreshToken", notNullValue()))
                .andExpect(jsonPath("$.tokenType", is("Bearer")))
                .andExpect(jsonPath("$.user.email", is("volunteer.colombo@gmail.com")))
                .andExpect(jsonPath("$.user.role", is("USER")));
    }

    @Test
    @DisplayName("POST /api/auth/register with duplicate email returns 400 Bad Request")
    void testRegisterDuplicateEmail() throws Exception {
        RegisterRequest request = RegisterRequest.builder()
                .email("duplicate.test@gmail.com")
                .password("Password123!")
                .fullName("Sunil Silva")
                .role(Role.USER)
                .build();

        // First registration
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated());

        // Duplicate registration
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status", is(400)))
                .andExpect(jsonPath("$.message", containsString("already exists")));
    }

    @Test
    @DisplayName("POST /api/auth/register with role ADMIN is rejected")
    void testRegisterAdminAttemptForbidden() throws Exception {
        RegisterRequest request = RegisterRequest.builder()
                .email("fake.admin@foodbridge.lk")
                .password("Password123!")
                .fullName("Malicious Actor")
                .role(Role.ADMIN)
                .build();

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("Admin accounts cannot be self-registered")));
    }

    @Test
    @DisplayName("POST /api/auth/register with invalid data returns field validation errors")
    void testRegisterValidationFailure() throws Exception {
        RegisterRequest request = RegisterRequest.builder()
                .email("invalid-email")
                .password("123") // too short
                .fullName("")
                .role(null)
                .build();

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status", is(400)))
                .andExpect(jsonPath("$.fieldErrors.email", notNullValue()))
                .andExpect(jsonPath("$.fieldErrors.password", notNullValue()))
                .andExpect(jsonPath("$.fieldErrors.fullName", notNullValue()))
                .andExpect(jsonPath("$.fieldErrors.role", notNullValue()));
    }

    @Test
    @DisplayName("POST /api/auth/login with valid credentials returns tokens")
    void testLoginSuccess() throws Exception {
        RegisterRequest registerReq = RegisterRequest.builder()
                .email("chef.anura@restaurant.lk")
                .password("SecretKitchen123")
                .fullName("Chef Anura")
                .role(Role.RESTAURANT)
                .build();

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerReq)))
                .andExpect(status().isCreated());

        LoginRequest loginReq = LoginRequest.builder()
                .email("chef.anura@restaurant.lk")
                .password("SecretKitchen123")
                .build();

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken", notNullValue()))
                .andExpect(jsonPath("$.refreshToken", notNullValue()))
                .andExpect(jsonPath("$.user.email", is("chef.anura@restaurant.lk")));
    }

    @Test
    @DisplayName("POST /api/auth/login with wrong password returns 401 Unauthorized")
    void testLoginInvalidPassword() throws Exception {
        LoginRequest loginReq = LoginRequest.builder()
                .email("admin@foodbridge.lk")
                .password("WrongPassword999!")
                .build();

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginReq)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status", is(401)))
                .andExpect(jsonPath("$.message", containsString("Invalid email or password")));
    }

    @Test
    @DisplayName("POST /api/auth/refresh returns new access token")
    void testRefreshTokenSuccess() throws Exception {
        RegisterRequest registerReq = RegisterRequest.builder()
                .email("charity.director@srilankahelp.org")
                .password("CharitySecure123")
                .fullName("Nimal Jayawardena")
                .role(Role.CHARITY)
                .build();

        MvcResult result = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerReq)))
                .andExpect(status().isCreated())
                .andReturn();

        JsonNode responseNode = objectMapper.readTree(result.getResponse().getContentAsString());
        String refreshToken = responseNode.get("refreshToken").asText();

        RefreshTokenRequest refreshReq = RefreshTokenRequest.builder()
                .refreshToken(refreshToken)
                .build();

        mockMvc.perform(post("/api/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(refreshReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken", notNullValue()))
                .andExpect(jsonPath("$.user.email", is("charity.director@srilankahelp.org")));
    }

    @Test
    @DisplayName("GET /api/auth/me returns current user with Bearer token, and 401 without")
    void testGetMeEndpoint() throws Exception {
        // Without token
        mockMvc.perform(get("/api/auth/me"))
                .andExpect(status().isUnauthorized());

        // Register and obtain token
        RegisterRequest registerReq = RegisterRequest.builder()
                .email("animal.shelter@pawslanka.org")
                .password("AnimalCare123")
                .fullName("Paws Care")
                .role(Role.ANIMAL_ORG)
                .build();

        MvcResult result = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerReq)))
                .andExpect(status().isCreated())
                .andReturn();

        JsonNode responseNode = objectMapper.readTree(result.getResponse().getContentAsString());
        String accessToken = responseNode.get("accessToken").asText();

        // With token
        mockMvc.perform(get("/api/auth/me")
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email", is("animal.shelter@pawslanka.org")))
                .andExpect(jsonPath("$.role", is("ANIMAL_ORG")));
    }

    @Test
    @DisplayName("Seeded default admin account can log in on startup")
    void testSeededAdminLogin() throws Exception {
        LoginRequest adminLogin = LoginRequest.builder()
                .email("admin@foodbridge.lk")
                .password("Admin@FoodBridge2026")
                .build();

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(adminLogin)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken", notNullValue()))
                .andExpect(jsonPath("$.user.role", is("ADMIN")));
    }
}


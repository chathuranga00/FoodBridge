package com.ecoconnect.foodbridge;

import com.ecoconnect.foodbridge.model.enums.Role;
import com.ecoconnect.foodbridge.service.SupabaseStorageService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("local")
@Transactional
class SupabaseStorageServiceTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private SupabaseStorageService storageService;

    @Test
    @DisplayName("Supabase Storage: isSupabaseConfigured() returns false when using unconfigured defaults")
    void testIsSupabaseConfiguredDefault() {
        // In local/test profile, placeholder strings are present
        assertFalse(storageService.isSupabaseConfigured(),
                "In local test profile, Supabase credentials should be detected as unconfigured");
    }

    @Test
    @DisplayName("Supabase Storage: uploadFile returns graceful local URL when unconfigured")
    void testUploadFileFallback() {
        byte[] pngSignature = new byte[]{(byte) 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A};
        MockMultipartFile file = new MockMultipartFile(
                "file", "proof.png", "image/png", pngSignature
        );

        String resultUrl = storageService.uploadFile(file, "campaigns", "uuid-1234.png");
        assertNotNull(resultUrl);
        assertEquals("/api/uploads/campaigns/uuid-1234.png", resultUrl);
    }

    @Test
    @DisplayName("Supabase Storage: getPublicUrl returns fallback local path when unconfigured")
    void testGetPublicUrlFallback() {
        String url = storageService.getPublicUrl("partnerships", "delivery-proof.png");
        assertEquals("/api/uploads/partnerships/delivery-proof.png", url);
    }

    @Test
    @DisplayName("POST /api/upload uses SupabaseStorageService and returns storageProvider indicator")
    void testUploadEndpointIntegration() throws Exception {
        // Authenticate as a user
        String token = obtainUserToken();

        byte[] pngBytes = new byte[]{(byte) 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D};
        MockMultipartFile validFile = new MockMultipartFile(
                "file", "cert.png", "image/png", pngBytes
        );

        mockMvc.perform(multipart("/api/upload")
                        .file(validFile)
                        .param("category", "verification")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("UPLOADED")))
                .andExpect(jsonPath("$.fileUrl", containsString("/api/uploads/verification/")))
                .andExpect(jsonPath("$.storageProvider", is("LOCAL_FALLBACK")))
                .andExpect(jsonPath("$.sizeBytes", is(pngBytes.length)));
    }

    private String obtainUserToken() throws Exception {
        String json = "{\"email\":\"admin@foodbridge.lk\",\"password\":\"Admin@FoodBridge2026\"}";
        String response = mockMvc.perform(post("/api/auth/login")
                        .contentType("application/json")
                        .content(json))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        // Extract token
        int start = response.indexOf("\"accessToken\":\"") + 15;
        int end = response.indexOf("\"", start);
        return response.substring(start, end);
    }
}

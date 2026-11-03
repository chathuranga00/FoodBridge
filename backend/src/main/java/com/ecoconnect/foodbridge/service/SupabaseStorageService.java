package com.ecoconnect.foodbridge.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

/**
 * Service to handle object/image storage via Supabase Storage REST API.
 * Securely uploads validated documents, receipts, logos, and images to Supabase buckets.
 * Gracefully falls back to local resource paths when running offline or in development.
 */
@Slf4j
@Service
public class SupabaseStorageService {

    @Value("${app.supabase.url:}")
    private String supabaseUrl;

    @Value("${app.supabase.service-role-key:}")
    private String serviceRoleKey;

    @Value("${app.supabase.anon-key:}")
    private String anonKey;

    @Value("${app.supabase.storage-bucket:foodbridge-uploads}")
    private String storageBucket;

    private final HttpClient httpClient;

    public SupabaseStorageService() {
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .build();
    }

    /**
     * Checks whether Supabase Storage credentials are configured for production.
     */
    public boolean isSupabaseConfigured() {
        return supabaseUrl != null && !supabaseUrl.isBlank()
                && !supabaseUrl.contains("your-project-id")
                && serviceRoleKey != null && !serviceRoleKey.isBlank()
                && !serviceRoleKey.contains("your-supabase");
    }

    /**
     * Uploads the given file to the configured Supabase Storage bucket.
     * Returns the permanent public CDN URL if successful, or falls back to local endpoint.
     */
    public String uploadFile(MultipartFile file, String category, String safeFileName) {
        String cleanCategory = (category != null && !category.isBlank()) ? category.toLowerCase().trim() : "general";
        String objectPath = cleanCategory + "/" + safeFileName;

        if (!isSupabaseConfigured()) {
            log.debug("Supabase Storage not configured. Storing with local fallback URL for: {}", objectPath);
            return buildLocalFallbackUrl(cleanCategory, safeFileName);
        }

        try {
            String baseUrl = normalizeUrl(supabaseUrl);
            String endpoint = baseUrl + "/storage/v1/object/" + storageBucket + "/" + objectPath;

            String contentType = file.getContentType() != null ? file.getContentType() : "application/octet-stream";

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(endpoint))
                    .header("Authorization", "Bearer " + serviceRoleKey)
                    .header("apikey", serviceRoleKey)
                    .header("Content-Type", contentType)
                    .header("x-upsert", "true")
                    .POST(HttpRequest.BodyPublishers.ofByteArray(file.getBytes()))
                    .timeout(Duration.ofSeconds(15))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() >= 200 && response.statusCode() < 300) {
                String publicUrl = baseUrl + "/storage/v1/object/public/" + storageBucket + "/" + objectPath;
                log.info("Successfully uploaded file to Supabase Storage CDN: {}", publicUrl);
                return publicUrl;
            } else {
                log.warn("Supabase Storage returned HTTP {}: {}. Falling back to local URL.",
                        response.statusCode(), response.body());
                return buildLocalFallbackUrl(cleanCategory, safeFileName);
            }
        } catch (Exception e) {
            log.warn("Error uploading to Supabase Storage: {}. Falling back to local URL.", e.getMessage());
            return buildLocalFallbackUrl(cleanCategory, safeFileName);
        }
    }

    /**
     * Generates the public CDN URL for an existing file in the storage bucket.
     */
    public String getPublicUrl(String category, String safeFileName) {
        String cleanCategory = (category != null && !category.isBlank()) ? category.toLowerCase().trim() : "general";
        if (isSupabaseConfigured()) {
            return normalizeUrl(supabaseUrl) + "/storage/v1/object/public/" + storageBucket + "/" + cleanCategory + "/" + safeFileName;
        }
        return buildLocalFallbackUrl(cleanCategory, safeFileName);
    }

    private String buildLocalFallbackUrl(String category, String safeFileName) {
        return "/api/uploads/" + category + "/" + safeFileName;
    }

    private String normalizeUrl(String url) {
        return url.endsWith("/") ? url.substring(0, url.length() - 1) : url;
    }
}

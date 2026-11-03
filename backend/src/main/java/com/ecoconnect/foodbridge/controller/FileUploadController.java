package com.ecoconnect.foodbridge.controller;

import com.ecoconnect.foodbridge.security.FileUploadSecurityService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

/**
 * Controller for secure document, evidence, and image uploads.
 * Requires authentication and enforces strict file size, extension, MIME, and magic bytes checks.
 */
@RestController
@RequestMapping("/api/upload")
public class FileUploadController {

    private final FileUploadSecurityService fileUploadSecurityService;

    public FileUploadController(FileUploadSecurityService fileUploadSecurityService) {
        this.fileUploadSecurityService = fileUploadSecurityService;
    }

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "category", required = false, defaultValue = "document") String category) {

        String safeFileName = fileUploadSecurityService.validateAndSanitize(file);
        String mockStoredUrl = "/api/uploads/" + category.toLowerCase() + "/" + safeFileName;

        return ResponseEntity.ok(Map.of(
                "fileName", safeFileName,
                "fileUrl", mockStoredUrl,
                "originalName", file.getOriginalFilename() != null ? file.getOriginalFilename() : "file",
                "contentType", file.getContentType() != null ? file.getContentType() : "application/octet-stream",
                "sizeBytes", file.getSize(),
                "status", "UPLOADED"
        ));
    }
}

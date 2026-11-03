package com.ecoconnect.foodbridge.security;

import com.ecoconnect.foodbridge.exception.BadRequestException;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.net.URI;
import java.util.Arrays;
import java.util.List;
import java.util.Set;
import java.util.UUID;

/**
 * Validates file uploads and asset URLs to enforce:
 * - Allowed MIME types (JPEG, PNG, WebP, PDF)
 * - Allowed file extensions (.jpg, .jpeg, .png, .webp, .pdf)
 * - File size constraints (max 5MB)
 * - Magic bytes / signature verification (preventing polyglots and executable camouflage)
 * - Directory traversal prevention (sanitizing filenames and assigning UUIDs)
 * - URL safety validation (enforcing http/https, rejecting javascript:, file:, data: schemes)
 */
@Service
public class FileUploadSecurityService {

    public static final long MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

    private static final Set<String> ALLOWED_EXTENSIONS = Set.of("jpg", "jpeg", "png", "webp", "pdf");

    private static final Set<String> ALLOWED_MIME_TYPES = Set.of(
            "image/jpeg",
            "image/png",
            "image/webp",
            "application/pdf"
    );

    private static final List<String> SAFE_URL_SCHEMES = List.of("http", "https");

    /**
     * Validates a MultipartFile against all file security policies.
     * Returns a sanitized, unique filename for storage.
     */
    public String validateAndSanitize(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Uploaded file is missing or empty.");
        }

        // 1. File size check
        if (file.getSize() > MAX_FILE_SIZE_BYTES) {
            throw new BadRequestException("File exceeds maximum allowed size of 5MB.");
        }

        // 2. MIME type check
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_MIME_TYPES.contains(contentType.toLowerCase())) {
            throw new BadRequestException("Unsupported file type: " + contentType + ". Allowed: JPEG, PNG, WEBP, PDF.");
        }

        // 3. Filename and extension check
        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || originalFilename.isBlank()) {
            throw new BadRequestException("File name is invalid.");
        }

        // Prevent directory traversal: check for .., /, \
        if (originalFilename.contains("..") || originalFilename.contains("/") || originalFilename.contains("\\")) {
            throw new BadRequestException("Invalid characters detected in filename (directory traversal attempt).");
        }

        String extension = getExtension(originalFilename);
        if (!ALLOWED_EXTENSIONS.contains(extension.toLowerCase())) {
            throw new BadRequestException("Unsupported file extension ." + extension + ". Allowed: .jpg, .jpeg, .png, .webp, .pdf");
        }

        // 4. Magic bytes / header inspection
        validateMagicBytes(file, extension);

        // 5. Generate secure random filename
        return UUID.randomUUID().toString() + "." + extension.toLowerCase();
    }

    /**
     * Inspects magic bytes / header signatures to prevent executable camouflage.
     */
    public void validateMagicBytes(MultipartFile file, String extension) {
        try (InputStream is = file.getInputStream()) {
            byte[] header = new byte[12];
            int bytesRead = is.read(header);
            if (bytesRead < 4) {
                throw new BadRequestException("File is corrupted or too small to verify signature.");
            }

            String ext = extension.toLowerCase();
            switch (ext) {
                case "jpg":
                case "jpeg":
                    // JPEG starts with FF D8 FF
                    if ((header[0] & 0xFF) != 0xFF || (header[1] & 0xFF) != 0xD8 || (header[2] & 0xFF) != 0xFF) {
                        throw new BadRequestException("File content does not match JPEG signature.");
                    }
                    break;
                case "png":
                    // PNG starts with 89 50 4E 47 0D 0A 1A 0A
                    byte[] pngSignature = new byte[]{(byte) 0x89, 0x50, 0x4E, 0x47};
                    if (bytesRead < 4 || !Arrays.equals(Arrays.copyOfRange(header, 0, 4), pngSignature)) {
                        throw new BadRequestException("File content does not match PNG signature.");
                    }
                    break;
                case "pdf":
                    // PDF starts with %PDF- (0x25, 0x50, 0x44, 0x46, 0x2D)
                    byte[] pdfSignature = new byte[]{0x25, 0x50, 0x44, 0x46};
                    if (bytesRead < 4 || !Arrays.equals(Arrays.copyOfRange(header, 0, 4), pdfSignature)) {
                        throw new BadRequestException("File content does not match PDF signature.");
                    }
                    break;
                case "webp":
                    // WEBP has RIFF at 0..3 and WEBP at 8..11
                    if (bytesRead < 12 ||
                            header[0] != 'R' || header[1] != 'I' || header[2] != 'F' || header[3] != 'F' ||
                            header[8] != 'W' || header[9] != 'E' || header[10] != 'B' || header[11] != 'P') {
                        throw new BadRequestException("File content does not match WebP signature.");
                    }
                    break;
                default:
                    throw new BadRequestException("Unrecognized file extension.");
            }
        } catch (IOException e) {
            throw new BadRequestException("Unable to read uploaded file header: " + e.getMessage());
        }
    }

    /**
     * Validates that an external URL (for documents, logos, receipts) is safe:
     * - Only http or https scheme
     * - Well-formed URI
     * - No dangerous schemes (file:, javascript:, data:, ftp:)
     */
    public boolean isSafeUrl(String url) {
        if (url == null || url.isBlank()) {
            return true; // null/blank handled by @NotBlank or optional constraints
        }
        try {
            URI uri = URI.create(url);
            String scheme = uri.getScheme();
            if (scheme == null) {
                return false;
            }
            return SAFE_URL_SCHEMES.contains(scheme.toLowerCase());
        } catch (Exception e) {
            return false;
        }
    }

    private String getExtension(String filename) {
        int lastDot = filename.lastIndexOf('.');
        if (lastDot < 0 || lastDot == filename.length() - 1) {
            return "";
        }
        return filename.substring(lastDot + 1);
    }
}


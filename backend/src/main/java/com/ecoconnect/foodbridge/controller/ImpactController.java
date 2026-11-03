package com.ecoconnect.foodbridge.controller;

import com.ecoconnect.foodbridge.dto.ImpactSummaryResponse;
import com.ecoconnect.foodbridge.dto.OrganizationImpactResponse;
import com.ecoconnect.foodbridge.service.ImpactService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/impact")
@RequiredArgsConstructor
public class ImpactController {

    private final ImpactService impactService;

    /**
     * Public platform-wide impact summary (Rule 4 verified-only).
     */
    @GetMapping("/summary")
    public ResponseEntity<ImpactSummaryResponse> getPlatformSummary(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(impactService.getPlatformImpactSummary(startDate, endDate));
    }

    /**
     * Alias for /summary to support both /api/impact/stats and /api/impact/summary.
     */
    @GetMapping("/stats")
    public ResponseEntity<ImpactSummaryResponse> getPlatformStats(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return getPlatformSummary(startDate, endDate);
    }

    /**
     * Public or partner-accessible organization-specific verified impact stats.
     */
    @GetMapping("/organization/{organizationId}")
    public ResponseEntity<OrganizationImpactResponse> getOrganizationImpact(
            @PathVariable UUID organizationId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(impactService.getOrganizationImpact(organizationId, startDate, endDate));
    }

    /**
     * Authenticated organization views their own verified impact stats.
     */
    @GetMapping("/my")
    public ResponseEntity<OrganizationImpactResponse> getMyImpact(
            Authentication authentication,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(impactService.getMyImpact(authentication.getName(), startDate, endDate));
    }

    /**
     * Downloadable CSV audit report of verified impact records.
     */
    @GetMapping("/export")
    public ResponseEntity<byte[]> exportImpactReport(
            @RequestParam(required = false) UUID organizationId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        byte[] csvData = impactService.exportImpactCsv(organizationId, startDate, endDate);

        String filename = organizationId != null
                ? "foodbridge-org-impact-" + organizationId + ".csv"
                : "foodbridge-national-impact-report.csv";

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.parseMediaType("text/csv; charset=UTF-8"))
                .body(csvData);
    }
}


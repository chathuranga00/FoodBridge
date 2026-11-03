package com.ecoconnect.foodbridge.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditLogResponseDto {
    private UUID id;
    private UUID userId;
    private String userEmail;
    private String userName;
    private String userRole;
    private String action;
    private String entityName;
    private UUID entityId;
    private String ipAddress;
    private String details;
    private OffsetDateTime createdAt;
}


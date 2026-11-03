package com.ecoconnect.foodbridge.dto;

import com.ecoconnect.foodbridge.model.enums.Role;
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
public class AdminUserDto {
    private UUID id;
    private String email;
    private String fullName;
    private String phoneNumber;
    private Role role;
    private Boolean isActive;
    private OffsetDateTime createdAt;
    private String organizationName;
    private String organizationType;
    private UUID organizationId;
    private String verificationStatus;
}


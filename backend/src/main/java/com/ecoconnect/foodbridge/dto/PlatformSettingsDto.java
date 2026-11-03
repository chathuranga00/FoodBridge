package com.ecoconnect.foodbridge.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PlatformSettingsDto {
    private String id;

    @NotBlank(message = "Platform name is required")
    private String platformName;

    @NotBlank(message = "Support email is required")
    private String supportEmail;

    private String supportPhone;
    private String contactAddress;

    @NotNull(message = "Maintenance mode flag is required")
    private Boolean maintenanceMode;

    @NotNull(message = "Document verification flag is required")
    private Boolean requireDocumentVerification;

    @NotNull(message = "Min food expiry hours is required")
    private Integer minFoodExpiryHours;

    @NotNull(message = "Animal welfare module flag is required")
    private Boolean animalWelfareEnabled;

    @NotNull(message = "Grocery coupons module flag is required")
    private Boolean groceryCouponsEnabled;

    @NotNull(message = "Email notifications flag is required")
    private Boolean emailNotificationsEnabled;

    private String bankName;
    private String bankAccountName;
    private String bankAccountNumber;
    private String bankBranch;

    private OffsetDateTime updatedAt;
}


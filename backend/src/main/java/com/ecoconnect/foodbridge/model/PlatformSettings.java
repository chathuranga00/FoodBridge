package com.ecoconnect.foodbridge.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "platform_settings")
public class PlatformSettings {

    @Id
    @Size(max = 50)
    @Column(name = "id", length = 50, nullable = false)
    private String id;

    @NotBlank
    @Size(max = 100)
    @Column(name = "platform_name", nullable = false)
    private String platformName;

    @NotBlank
    @Size(max = 255)
    @Column(name = "support_email", nullable = false)
    private String supportEmail;

    @Size(max = 50)
    @Column(name = "support_phone")
    private String supportPhone;

    @Size(max = 255)
    @Column(name = "contact_address")
    private String contactAddress;

    @NotNull
    @Column(name = "maintenance_mode", nullable = false)
    private Boolean maintenanceMode;

    @NotNull
    @Column(name = "require_document_verification", nullable = false)
    private Boolean requireDocumentVerification;

    @NotNull
    @Column(name = "min_food_expiry_hours", nullable = false)
    private Integer minFoodExpiryHours;

    @NotNull
    @Column(name = "animal_welfare_enabled", nullable = false)
    private Boolean animalWelfareEnabled;

    @NotNull
    @Column(name = "grocery_coupons_enabled", nullable = false)
    private Boolean groceryCouponsEnabled;

    @NotNull
    @Column(name = "email_notifications_enabled", nullable = false)
    private Boolean emailNotificationsEnabled;

    @Size(max = 100)
    @Column(name = "bank_name")
    private String bankName;

    @Size(max = 150)
    @Column(name = "bank_account_name")
    private String bankAccountName;

    @Size(max = 50)
    @Column(name = "bank_account_number")
    private String bankAccountNumber;

    @Size(max = 100)
    @Column(name = "bank_branch")
    private String bankBranch;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    @PrePersist
    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = OffsetDateTime.now(ZoneOffset.UTC);
    }
}


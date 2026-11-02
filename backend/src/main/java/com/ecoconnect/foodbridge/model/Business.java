package com.ecoconnect.foodbridge.model;

import com.ecoconnect.foodbridge.model.enums.BusinessType;
import com.ecoconnect.foodbridge.model.enums.VerificationStatus;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "businesses")
public class Business extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @NotNull
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", unique = true, nullable = false)
    private User user;

    @NotBlank
    @Size(max = 200)
    @Column(name = "business_name", nullable = false)
    private String businessName;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "business_type", nullable = false, length = 30)
    private BusinessType businessType;

    @NotBlank
    @Size(max = 100)
    @Column(name = "registration_number", unique = true, nullable = false)
    private String registrationNumber;

    @Size(max = 150)
    @Column(name = "contact_person")
    private String contactPerson;

    @Size(max = 255)
    @Column(name = "contact_email")
    private String contactEmail;

    @Size(max = 30)
    @Column(name = "contact_phone")
    private String contactPhone;

    @NotBlank
    @Size(max = 255)
    @Column(name = "address_line1", nullable = false)
    private String addressLine1;

    @Size(max = 255)
    @Column(name = "address_line2")
    private String addressLine2;

    @NotBlank
    @Size(max = 100)
    @Column(name = "city", nullable = false)
    private String city;

    @NotBlank
    @Size(max = 100)
    @Column(name = "district", nullable = false)
    private String district;

    @NotNull
    @Column(name = "latitude", nullable = false, precision = 10, scale = 7)
    private BigDecimal latitude;

    @NotNull
    @Column(name = "longitude", nullable = false, precision = 10, scale = 7)
    private BigDecimal longitude;

    @NotNull
    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(name = "verification_status", nullable = false, length = 30)
    private VerificationStatus verificationStatus = VerificationStatus.PENDING;

    @Column(name = "verified_at")
    private OffsetDateTime verifiedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "verified_by")
    private User verifiedBy;

    @Column(name = "verification_notes", columnDefinition = "TEXT")
    private String verificationNotes;
}


package com.ecoconnect.foodbridge.dto;

import com.ecoconnect.foodbridge.model.Business;
import com.ecoconnect.foodbridge.model.enums.BusinessType;
import com.ecoconnect.foodbridge.model.enums.VerificationStatus;
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
public class BusinessProfileDto {

    private UUID id;

    @NotBlank(message = "Business name is required")
    @Size(max = 200, message = "Business name must not exceed 200 characters")
    private String businessName;

    @NotNull(message = "Business type is required (RESTAURANT or GROCERY)")
    private BusinessType businessType;

    @NotBlank(message = "Registration number is required")
    @Size(max = 100, message = "Registration number must not exceed 100 characters")
    private String registrationNumber;

    private String description;

    @Size(max = 500, message = "Logo URL must not exceed 500 characters")
    private String logoUrl;

    @Size(max = 500, message = "Document URL must not exceed 500 characters")
    private String documentUrl;

    @Size(max = 150)
    private String contactPerson;

    @Size(max = 255)
    private String contactEmail;

    @Size(max = 30)
    private String contactPhone;

    @NotBlank(message = "Address line 1 is required")
    @Size(max = 255)
    private String addressLine1;

    @Size(max = 255)
    private String addressLine2;

    @NotBlank(message = "City is required")
    @Size(max = 100)
    private String city;

    @NotBlank(message = "District is required")
    @Size(max = 100)
    private String district;

    @NotNull(message = "Latitude is required")
    private BigDecimal latitude;

    @NotNull(message = "Longitude is required")
    private BigDecimal longitude;

    private VerificationStatus verificationStatus;
    private OffsetDateTime verifiedAt;
    private String verificationNotes;
    private Boolean isFeatured;
    private OffsetDateTime featuredUntil;

    public static BusinessProfileDto fromEntity(Business b) {
        if (b == null) {
            return null;
        }
        return BusinessProfileDto.builder()
                .id(b.getId())
                .businessName(b.getBusinessName())
                .businessType(b.getBusinessType())
                .registrationNumber(b.getRegistrationNumber())
                .description(b.getDescription())
                .logoUrl(b.getLogoUrl())
                .documentUrl(b.getDocumentUrl())
                .contactPerson(b.getContactPerson())
                .contactEmail(b.getContactEmail())
                .contactPhone(b.getContactPhone())
                .addressLine1(b.getAddressLine1())
                .addressLine2(b.getAddressLine2())
                .city(b.getCity())
                .district(b.getDistrict())
                .latitude(b.getLatitude())
                .longitude(b.getLongitude())
                .verificationStatus(b.getVerificationStatus())
                .verifiedAt(b.getVerifiedAt())
                .verificationNotes(b.getVerificationNotes())
                .isFeatured(b.getIsFeatured())
                .featuredUntil(b.getFeaturedUntil())
                .build();
    }
}


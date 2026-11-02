package com.ecoconnect.foodbridge.dto;

import com.ecoconnect.foodbridge.model.Charity;
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
public class CharityProfileDto {

    private UUID id;

    @NotBlank(message = "Charity name is required")
    @Size(max = 200, message = "Charity name must not exceed 200 characters")
    private String charityName;

    @NotBlank(message = "Registration number is required")
    @Size(max = 100, message = "Registration number must not exceed 100 characters")
    private String registrationNumber;

    private String description;

    @Size(max = 255, message = "Operating area must not exceed 255 characters")
    private String operatingArea;

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

    private Integer capacityPeople;

    private VerificationStatus verificationStatus;
    private OffsetDateTime verifiedAt;
    private String verificationNotes;

    public static CharityProfileDto fromEntity(Charity c) {
        if (c == null) {
            return null;
        }
        return CharityProfileDto.builder()
                .id(c.getId())
                .charityName(c.getCharityName())
                .registrationNumber(c.getRegistrationNumber())
                .description(c.getDescription())
                .operatingArea(c.getOperatingArea())
                .logoUrl(c.getLogoUrl())
                .documentUrl(c.getDocumentUrl())
                .contactPerson(c.getContactPerson())
                .contactEmail(c.getContactEmail())
                .contactPhone(c.getContactPhone())
                .addressLine1(c.getAddressLine1())
                .addressLine2(c.getAddressLine2())
                .city(c.getCity())
                .district(c.getDistrict())
                .latitude(c.getLatitude())
                .longitude(c.getLongitude())
                .capacityPeople(c.getCapacityPeople())
                .verificationStatus(c.getVerificationStatus())
                .verifiedAt(c.getVerifiedAt())
                .verificationNotes(c.getVerificationNotes())
                .build();
    }
}


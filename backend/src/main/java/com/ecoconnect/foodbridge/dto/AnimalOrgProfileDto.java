package com.ecoconnect.foodbridge.dto;

import com.ecoconnect.foodbridge.model.AnimalOrganization;
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
public class AnimalOrgProfileDto {

    private UUID id;

    @NotBlank(message = "Organization name is required")
    @Size(max = 200)
    private String organizationName;

    @Size(max = 100)
    private String registrationNumber;

    @Size(max = 255)
    private String animalTypes;

    private Integer shelterCapacity;

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

    public static AnimalOrgProfileDto fromEntity(AnimalOrganization org) {
        if (org == null) {
            return null;
        }
        return AnimalOrgProfileDto.builder()
                .id(org.getId())
                .organizationName(org.getOrganizationName())
                .registrationNumber(org.getRegistrationNumber())
                .animalTypes(org.getAnimalTypes())
                .shelterCapacity(org.getShelterCapacity())
                .contactPerson(org.getContactPerson())
                .contactEmail(org.getContactEmail())
                .contactPhone(org.getContactPhone())
                .addressLine1(org.getAddressLine1())
                .addressLine2(org.getAddressLine2())
                .city(org.getCity())
                .district(org.getDistrict())
                .latitude(org.getLatitude())
                .longitude(org.getLongitude())
                .verificationStatus(org.getVerificationStatus())
                .verifiedAt(org.getVerifiedAt())
                .build();
    }
}


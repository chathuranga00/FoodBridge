package com.ecoconnect.foodbridge.dto;

import com.ecoconnect.foodbridge.model.AnimalLocation;
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
public class AnimalLocationDto {

    private UUID id;
    private UUID animalOrgId;
    private String animalOrgName;

    @NotBlank(message = "Location name is required")
    @Size(max = 200)
    private String locationName;

    @NotBlank(message = "Animal type is required")
    @Size(max = 100)
    private String animalType;

    private Integer estimatedCount;

    @Size(max = 255)
    private String feedingRoutine;

    @NotBlank(message = "District is required")
    @Size(max = 100)
    private String district;

    @Size(max = 100)
    private String city;

    @Size(max = 255)
    private String addressLine;

    @NotNull(message = "Latitude is required")
    private BigDecimal latitude;

    @NotNull(message = "Longitude is required")
    private BigDecimal longitude;

    @Builder.Default
    private String urgencyLevel = "NORMAL";

    private String notes;

    @Builder.Default
    private Boolean isActive = true;

    private OffsetDateTime createdAt;

    public static AnimalLocationDto fromEntity(AnimalLocation loc) {
        if (loc == null) {
            return null;
        }
        return AnimalLocationDto.builder()
                .id(loc.getId())
                .animalOrgId(loc.getAnimalOrg() != null ? loc.getAnimalOrg().getId() : null)
                .animalOrgName(loc.getAnimalOrg() != null ? loc.getAnimalOrg().getOrganizationName() : null)
                .locationName(loc.getLocationName())
                .animalType(loc.getAnimalType())
                .estimatedCount(loc.getEstimatedCount())
                .feedingRoutine(loc.getFeedingRoutine())
                .district(loc.getDistrict())
                .city(loc.getCity())
                .addressLine(loc.getAddressLine())
                .latitude(loc.getLatitude())
                .longitude(loc.getLongitude())
                .urgencyLevel(loc.getUrgencyLevel())
                .notes(loc.getNotes())
                .isActive(loc.getIsActive())
                .createdAt(loc.getCreatedAt())
                .build();
    }
}


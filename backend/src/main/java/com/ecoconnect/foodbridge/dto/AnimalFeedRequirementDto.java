package com.ecoconnect.foodbridge.dto;

import com.ecoconnect.foodbridge.model.AnimalFeedRequirement;
import jakarta.validation.constraints.NotBlank;
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
public class AnimalFeedRequirementDto {

    private UUID id;
    private UUID animalOrgId;
    private String animalOrgName;
    private String animalOrgDistrict;

    @NotBlank(message = "Title is required")
    @Size(max = 200)
    private String title;

    @NotBlank(message = "Animal types is required")
    @Size(max = 100)
    private String animalTypes;

    @NotBlank(message = "Suitable feed types description is required (Rule 7)")
    private String suitableFeedTypes;

    private String prohibitedItems;

    private BigDecimal dailyQuantityNeeded;

    @Size(max = 20)
    private String unit;

    @Builder.Default
    private String urgency = "MEDIUM";

    private String deliveryOrPickupInstructions;

    @Builder.Default
    private Boolean isActive = true;

    private OffsetDateTime createdAt;

    public static AnimalFeedRequirementDto fromEntity(AnimalFeedRequirement req) {
        if (req == null) {
            return null;
        }
        return AnimalFeedRequirementDto.builder()
                .id(req.getId())
                .animalOrgId(req.getAnimalOrg() != null ? req.getAnimalOrg().getId() : null)
                .animalOrgName(req.getAnimalOrg() != null ? req.getAnimalOrg().getOrganizationName() : null)
                .animalOrgDistrict(req.getAnimalOrg() != null ? req.getAnimalOrg().getDistrict() : null)
                .title(req.getTitle())
                .animalTypes(req.getAnimalTypes())
                .suitableFeedTypes(req.getSuitableFeedTypes())
                .prohibitedItems(req.getProhibitedItems())
                .dailyQuantityNeeded(req.getDailyQuantityNeeded())
                .unit(req.getUnit())
                .urgency(req.getUrgency())
                .deliveryOrPickupInstructions(req.getDeliveryOrPickupInstructions())
                .isActive(req.getIsActive())
                .createdAt(req.getCreatedAt())
                .build();
    }
}

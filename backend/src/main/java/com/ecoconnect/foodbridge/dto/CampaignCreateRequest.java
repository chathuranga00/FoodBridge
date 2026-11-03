package com.ecoconnect.foodbridge.dto;

import com.ecoconnect.foodbridge.model.enums.CampaignNeedType;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CampaignCreateRequest {

    @NotBlank(message = "Campaign title is required")
    @Size(max = 255, message = "Campaign title must not exceed 255 characters")
    private String title;

    @NotBlank(message = "Campaign description is required")
    private String description;

    @NotNull(message = "Need type is required")
    private CampaignNeedType needType;

    /**
     * Location is recorded and exposed at the District level only
     * to protect privacy and dignity of vulnerable people.
     */
    @NotBlank(message = "District is required")
    @Size(max = 100)
    private String district;

    @NotNull(message = "Target quantity is required")
    @Min(value = 1, message = "Target quantity must be at least 1")
    private Integer targetQuantity;

    @NotBlank(message = "Target unit is required (e.g. meal packs, stationery kits, water filters)")
    @Size(max = 50)
    private String targetUnit;

    @NotNull(message = "Start date is required")
    private LocalDate startDate;

    @NotNull(message = "End date is required")
    private LocalDate endDate;

    private String coverImageUrl;

    @NotBlank(message = "Supporting evidence document or official letter URL is required for community verification")
    private String evidenceUrl;

    private Integer targetBeneficiariesCount;
}

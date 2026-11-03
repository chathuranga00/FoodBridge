package com.ecoconnect.foodbridge.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CampaignPledgeRequest {

    @NotNull(message = "Pledge quantity is required")
    @Min(value = 1, message = "Pledge quantity must be at least 1")
    private Integer pledgeQuantity;

    private String itemDescription;

    private String notes;
}

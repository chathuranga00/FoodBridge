package com.ecoconnect.foodbridge.dto;

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
public class CampaignUpdateRequest {

    @NotBlank(message = "Update title is required")
    @Size(max = 200, message = "Update title must not exceed 200 characters")
    private String title;

    @NotBlank(message = "Distribution description is required")
    private String description;

    private String photoUrl;

    @Min(value = 0, message = "Distributed quantity cannot be negative")
    private Integer quantityDistributed;

    @NotNull(message = "Distribution date is required")
    private LocalDate distributionDate;
}

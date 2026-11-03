package com.ecoconnect.foodbridge.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ContributionDistributeRequest {

    @NotBlank(message = "Distribution evidence document or photo URL is required")
    private String evidenceUrl;

    @NotBlank(message = "Distribution handover notes are required")
    private String notes;

    private LocalDate distributionDate;
}


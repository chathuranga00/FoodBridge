package com.ecoconnect.foodbridge.dto;

import com.ecoconnect.foodbridge.model.enums.ContributionType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PartnershipCounterRequest {

    @NotBlank(message = "Counter proposal message / reasoning is required")
    private String message;

    private ContributionType counterContributionType;

    private BigDecimal counterMonetaryAmount;

    private Integer counterQuantity;

    @Size(max = 50)
    private String counterUnit;

    @Size(max = 255)
    private String counterItemDescription;

    @Size(max = 150)
    private String counterRecognition;
}


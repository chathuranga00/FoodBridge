package com.ecoconnect.foodbridge.dto;

import com.ecoconnect.foodbridge.model.enums.ContributionType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PartnershipProposeRequest {

    @NotNull(message = "Target campaign ID is required")
    private UUID campaignId;

    @NotNull(message = "Contribution type is required")
    private ContributionType contributionType;

    private BigDecimal monetaryAmount;

    private Integer quantity;

    @Size(max = 50)
    private String unit;

    @Size(max = 255)
    private String itemDescription;

    @Size(max = 150)
    private String requestedRecognition;

    @NotBlank(message = "Initial proposal message is required")
    private String initialMessage;

    private LocalDate proposedDeliveryDate;
}


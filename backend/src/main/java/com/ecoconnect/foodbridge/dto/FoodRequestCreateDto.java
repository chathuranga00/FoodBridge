package com.ecoconnect.foodbridge.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.*;

import java.math.BigDecimal;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FoodRequestCreateDto {

    @NotNull(message = "Listing ID is required")
    private UUID listingId;

    @NotNull(message = "Quantity requested is required")
    @Positive(message = "Quantity requested must be greater than zero")
    private BigDecimal quantityRequested;

    private String notes;
}


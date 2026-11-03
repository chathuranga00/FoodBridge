package com.ecoconnect.foodbridge.dto;

import com.ecoconnect.foodbridge.model.enums.ContributionType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ContributionCreateRequest {

    @NotNull(message = "Contribution type is required (MONETARY_PLEDGE, FOOD_ITEMS, OTHER_RESOURCES)")
    private ContributionType contributionType;

    @Min(value = 1, message = "Quantity must be at least 1")
    private Integer quantity;

    private String unit;

    private BigDecimal monetaryAmount;

    private BigDecimal foodAmountKg;

    private String itemDescription;

    private String notes;

    private String contributorName;

    private String contributorEmail;

    private String contributorPhone;
}


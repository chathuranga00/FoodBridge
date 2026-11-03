package com.ecoconnect.foodbridge.dto;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GroceryOfferCreateRequest {

    @NotBlank(message = "Product title is required")
    @Size(max = 200, message = "Product title must not exceed 200 characters")
    private String title;

    private String description;

    @NotBlank(message = "Category is required")
    private String category;

    private String imageUrl;

    @NotNull(message = "Original price is required")
    @DecimalMin(value = "0.01", message = "Original price must be greater than zero")
    private BigDecimal originalPrice;

    @NotNull(message = "Discounted price is required")
    @DecimalMin(value = "0.01", message = "Discounted price must be greater than zero")
    private BigDecimal discountedPrice;

    @NotNull(message = "Available quantity is required")
    @Min(value = 1, message = "Quantity must be at least 1")
    private Integer availableQuantity;

    /**
     * Best-before date for quality distinction.
     */
    @NotNull(message = "Best-before date is required")
    private OffsetDateTime bestBeforeDate;

    /**
     * Optional explicit expiry date. If null, will default to bestBeforeDate or pickupEnd.
     */
    private OffsetDateTime expiryDate;

    @NotNull(message = "Collection start time is required")
    private OffsetDateTime pickupStart;

    @NotNull(message = "Collection end time is required")
    private OffsetDateTime pickupEnd;

    private String pickupAddress;

    @NotNull(message = "Food safety confirmation is required")
    @AssertTrue(message = "You must confirm that the product is eligible, safe, and complies with best-before guidelines")
    private Boolean safetyConfirmed;
}

package com.ecoconnect.foodbridge.dto;

import com.ecoconnect.foodbridge.model.enums.BillingCycle;
import com.ecoconnect.foodbridge.model.enums.SubscriptionPlan;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubscribeRequestDto {

    @NotNull(message = "Subscription plan is required")
    private SubscriptionPlan plan;

    @Builder.Default
    private BillingCycle billingCycle = BillingCycle.MONTHLY;

    private String paymentReference;

    private String notes;
}


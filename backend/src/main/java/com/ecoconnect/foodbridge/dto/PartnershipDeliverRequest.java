package com.ecoconnect.foodbridge.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PartnershipDeliverRequest {

    @NotBlank(message = "Delivery notes or dispatch confirmation reference is required")
    private String deliveryNotes;
}


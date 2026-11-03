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
public class PartnershipDeclineRequest {

    @NotBlank(message = "Decline reason is required")
    private String reason;
}


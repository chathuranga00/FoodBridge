package com.ecoconnect.foodbridge.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FoodRequestDecisionDto {

    @NotBlank(message = "Decision is required (APPROVE or REJECT)")
    private String decision; // "APPROVE" or "REJECT"

    private String reason;
}


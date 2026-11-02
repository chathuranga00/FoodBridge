package com.ecoconnect.foodbridge.dto;

import com.ecoconnect.foodbridge.model.enums.VerificationStatus;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VerificationDecisionRequest {

    @NotNull(message = "Verification status is required (VERIFIED or REJECTED)")
    private VerificationStatus status;

    private String reason;
}

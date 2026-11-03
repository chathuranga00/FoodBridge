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
public class PartnershipMessageRequest {

    @NotBlank(message = "Message text is required")
    private String message;
}


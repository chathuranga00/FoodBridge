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
public class PartnershipCompleteRequest {

    @NotBlank(message = "Completion and receipt confirmation notes are required")
    private String completionNotes;

    private String evidenceUrl;
}


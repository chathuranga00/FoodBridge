package com.ecoconnect.foodbridge.dto;

import com.ecoconnect.foodbridge.model.PartnershipMessage;
import com.ecoconnect.foodbridge.model.enums.ContributionType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PartnershipMessageResponse {

    private UUID id;
    private UUID partnershipId;
    private UUID senderUserId;
    private String senderRole;
    private String senderName;
    private String messageText;
    private Boolean isCounterProposal;
    private ContributionType counterContributionType;
    private BigDecimal counterMonetaryAmount;
    private Integer counterQuantity;
    private String counterUnit;
    private String counterItemDescription;
    private String counterRecognition;
    private OffsetDateTime createdAt;

    public static PartnershipMessageResponse fromEntity(PartnershipMessage m) {
        if (m == null) return null;
        return PartnershipMessageResponse.builder()
                .id(m.getId())
                .partnershipId(m.getPartnership() != null ? m.getPartnership().getId() : null)
                .senderUserId(m.getSenderUser() != null ? m.getSenderUser().getId() : null)
                .senderRole(m.getSenderRole())
                .senderName(m.getSenderName())
                .messageText(m.getMessageText())
                .isCounterProposal(m.getIsCounterProposal())
                .counterContributionType(m.getCounterContributionType())
                .counterMonetaryAmount(m.getCounterMonetaryAmount())
                .counterQuantity(m.getCounterQuantity())
                .counterUnit(m.getCounterUnit())
                .counterItemDescription(m.getCounterItemDescription())
                .counterRecognition(m.getCounterRecognition())
                .createdAt(m.getCreatedAt())
                .build();
    }
}


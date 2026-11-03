package com.ecoconnect.foodbridge.dto;

import com.ecoconnect.foodbridge.model.CampaignUpdate;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CampaignUpdateResponse {

    private UUID id;
    private UUID campaignId;
    private String title;
    private String description;
    private String photoUrl;
    private Integer quantityDistributed;
    private LocalDate distributionDate;
    private OffsetDateTime createdAt;

    public static CampaignUpdateResponse fromEntity(CampaignUpdate u) {
        return CampaignUpdateResponse.builder()
                .id(u.getId())
                .campaignId(u.getCampaign() != null ? u.getCampaign().getId() : null)
                .title(u.getTitle())
                .description(u.getDescription())
                .photoUrl(u.getPhotoUrl())
                .quantityDistributed(u.getQuantityDistributed())
                .distributionDate(u.getDistributionDate())
                .createdAt(u.getCreatedAt())
                .build();
    }
}


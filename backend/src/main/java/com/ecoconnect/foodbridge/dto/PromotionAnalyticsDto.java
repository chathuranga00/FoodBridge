package com.ecoconnect.foodbridge.dto;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PromotionAnalyticsDto {

    private Long totalPromotions;
    private Long activePromotions;
    private Long totalViews;
    private Long totalClicks;
    private Long totalRedemptions;
    private Double averageCtr;
    private Double averageRedemptionRate;
    private List<PromotionResponseDto> promotions;
}


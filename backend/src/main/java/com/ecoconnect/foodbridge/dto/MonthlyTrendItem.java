package com.ecoconnect.foodbridge.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MonthlyTrendItem {
    private String month;
    private Double foodRescuedKg;
    private Long completedCollections;
    private Long groceryRedeemed;
    private Long resourcesDistributed;
}

package com.ecoconnect.foodbridge.dto;

import com.ecoconnect.foodbridge.model.Promotion;
import com.ecoconnect.foodbridge.model.enums.PaymentStatus;
import com.ecoconnect.foodbridge.model.enums.PromotionType;
import lombok.*;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PromotionResponseDto {

    private UUID id;
    private UUID businessId;
    private String businessName;
    private String businessLogoUrl;
    private String businessCity;
    private String businessDistrict;
    private String title;
    private String description;
    private PromotionType promotionType;
    private String bannerUrl;
    private String targetAudience;
    private String promoCode;
    private String discountDetails;
    private String ctaLink;
    private OffsetDateTime startDate;
    private OffsetDateTime endDate;
    private BigDecimal costLkr;
    private PaymentStatus paymentStatus;
    private Boolean isActive;
    private Boolean isFeatured;
    private Long viewsCount;
    private Long clicksCount;
    private Long redemptionsCount;
    private Double ctr;
    private Double redemptionRate;
    private OffsetDateTime createdAt;

    public static PromotionResponseDto fromEntity(Promotion p) {
        if (p == null) return null;

        long views = p.getViewsCount() != null ? p.getViewsCount() : 0L;
        long clicks = p.getClicksCount() != null ? p.getClicksCount() : 0L;
        long redemptions = p.getRedemptionsCount() != null ? p.getRedemptionsCount() : 0L;

        double ctr = views > 0 ? Math.round(((double) clicks / views * 100.0) * 100.0) / 100.0 : 0.0;
        double redemptionRate = clicks > 0 ? Math.round(((double) redemptions / clicks * 100.0) * 100.0) / 100.0 : 0.0;

        return PromotionResponseDto.builder()
                .id(p.getId())
                .businessId(p.getBusiness() != null ? p.getBusiness().getId() : null)
                .businessName(p.getBusiness() != null ? p.getBusiness().getBusinessName() : null)
                .businessLogoUrl(p.getBusiness() != null ? p.getBusiness().getLogoUrl() : null)
                .businessCity(p.getBusiness() != null ? p.getBusiness().getCity() : null)
                .businessDistrict(p.getBusiness() != null ? p.getBusiness().getDistrict() : null)
                .title(p.getTitle())
                .description(p.getDescription())
                .promotionType(p.getPromotionType())
                .bannerUrl(p.getBannerUrl())
                .targetAudience(p.getTargetAudience())
                .promoCode(p.getPromoCode())
                .discountDetails(p.getDiscountDetails())
                .ctaLink(p.getCtaLink())
                .startDate(p.getStartDate())
                .endDate(p.getEndDate())
                .costLkr(p.getCostLkr())
                .paymentStatus(p.getPaymentStatus())
                .isActive(p.getIsActive())
                .isFeatured(p.getIsFeatured())
                .viewsCount(views)
                .clicksCount(clicks)
                .redemptionsCount(redemptions)
                .ctr(ctr)
                .redemptionRate(redemptionRate)
                .createdAt(p.getCreatedAt())
                .build();
    }
}


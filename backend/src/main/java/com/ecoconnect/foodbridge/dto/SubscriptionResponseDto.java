package com.ecoconnect.foodbridge.dto;

import com.ecoconnect.foodbridge.model.BusinessSubscription;
import com.ecoconnect.foodbridge.model.enums.BillingCycle;
import com.ecoconnect.foodbridge.model.enums.SubscriptionPlan;
import com.ecoconnect.foodbridge.model.enums.SubscriptionStatus;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubscriptionResponseDto {

    private UUID id;
    private UUID businessId;
    private String businessName;
    private String businessEmail;
    private SubscriptionPlan plan;
    private BillingCycle billingCycle;
    private SubscriptionStatus status;
    private OffsetDateTime startDate;
    private OffsetDateTime endDate;
    private BigDecimal priceLkr;
    private String invoiceNumber;
    private String paymentMethod;
    private String paymentReference;
    private String notes;
    private OffsetDateTime activatedAt;
    private String activatedByName;
    private OffsetDateTime createdAt;

    // Entitlement & Feature Gating flags
    private int maxPromotions;
    private boolean hasAnalytics;
    private boolean hasFeaturedPlacement;
    private boolean hasSponsoredCampaigns;
    private Long daysRemaining;

    @JsonProperty("isActive")
    private boolean isActive;

    public static SubscriptionResponseDto fromEntity(BusinessSubscription sub) {
        if (sub == null) {
            return null;
        }

        SubscriptionPlan plan = sub.getPlan();
        int maxPromos = switch (plan) {
            case FREE -> 1;
            case PROMOTION -> 5;
            case PREMIUM -> 100;
        };

        boolean hasAnalytics = plan != SubscriptionPlan.FREE;
        boolean hasFeatured = plan != SubscriptionPlan.FREE;
        boolean hasSponsoredCampaigns = plan == SubscriptionPlan.PREMIUM;

        OffsetDateTime now = OffsetDateTime.now();
        Long daysRemaining = null;
        if (sub.getEndDate() != null) {
            daysRemaining = Math.max(0, Duration.between(now, sub.getEndDate()).toDays());
        }

        boolean active = sub.getStatus() == SubscriptionStatus.ACTIVE &&
                (sub.getEndDate() == null || sub.getEndDate().isAfter(now));

        return SubscriptionResponseDto.builder()
                .id(sub.getId())
                .businessId(sub.getBusiness() != null ? sub.getBusiness().getId() : null)
                .businessName(sub.getBusiness() != null ? sub.getBusiness().getBusinessName() : null)
                .businessEmail(sub.getBusiness() != null && sub.getBusiness().getUser() != null ?
                        sub.getBusiness().getUser().getEmail() : null)
                .plan(sub.getPlan())
                .billingCycle(sub.getBillingCycle())
                .status(sub.getStatus())
                .startDate(sub.getStartDate())
                .endDate(sub.getEndDate())
                .priceLkr(sub.getPriceLkr())
                .invoiceNumber(sub.getInvoiceNumber())
                .paymentMethod(sub.getPaymentMethod())
                .paymentReference(sub.getPaymentReference())
                .notes(sub.getNotes())
                .activatedAt(sub.getActivatedAt())
                .activatedByName(sub.getActivatedBy() != null ? sub.getActivatedBy().getFullName() : null)
                .createdAt(sub.getCreatedAt())
                .maxPromotions(maxPromos)
                .hasAnalytics(hasAnalytics)
                .hasFeaturedPlacement(hasFeatured)
                .hasSponsoredCampaigns(hasSponsoredCampaigns)
                .daysRemaining(daysRemaining)
                .isActive(active)
                .build();
    }

    public static SubscriptionResponseDto createDefaultFree(UUID businessId, String businessName, String businessEmail) {
        return SubscriptionResponseDto.builder()
                .id(null)
                .businessId(businessId)
                .businessName(businessName)
                .businessEmail(businessEmail)
                .plan(SubscriptionPlan.FREE)
                .billingCycle(BillingCycle.MONTHLY)
                .status(SubscriptionStatus.ACTIVE)
                .startDate(OffsetDateTime.now())
                .endDate(null)
                .priceLkr(BigDecimal.ZERO)
                .invoiceNumber("FREE-TIER")
                .paymentMethod("INCLUDED")
                .paymentReference(null)
                .notes("Default Free tier subscription")
                .activatedAt(OffsetDateTime.now())
                .activatedByName("System")
                .createdAt(OffsetDateTime.now())
                .maxPromotions(1)
                .hasAnalytics(false)
                .hasFeaturedPlacement(false)
                .hasSponsoredCampaigns(false)
                .daysRemaining(null)
                .isActive(true)
                .build();
    }
}

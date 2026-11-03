package com.ecoconnect.foodbridge.model;

import com.ecoconnect.foodbridge.model.enums.BillingCycle;
import com.ecoconnect.foodbridge.model.enums.SubscriptionPlan;
import com.ecoconnect.foodbridge.model.enums.SubscriptionStatus;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * Enforces Rule 8 Financial Segregation:
 * Platform SaaS subscription revenue from businesses is tracked in business_subscriptions
 * and strictly separated from charity donations and campaign contributions.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "business_subscriptions")
public class BusinessSubscription extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "business_id", nullable = false)
    private Business business;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "plan", nullable = false, length = 30)
    private SubscriptionPlan plan;

    @NotNull
    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(name = "billing_cycle", nullable = false, length = 30)
    private BillingCycle billingCycle = BillingCycle.MONTHLY;

    @NotNull
    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    private SubscriptionStatus status = SubscriptionStatus.PENDING_ACTIVATION;

    @Column(name = "start_date")
    private OffsetDateTime startDate;

    @Column(name = "end_date")
    private OffsetDateTime endDate;

    @NotNull
    @Builder.Default
    @Column(name = "price_lkr", nullable = false, precision = 12, scale = 2)
    private BigDecimal priceLkr = BigDecimal.ZERO;

    @Column(name = "invoice_number", length = 100)
    private String invoiceNumber;

    @Builder.Default
    @Column(name = "payment_method", length = 50)
    private String paymentMethod = "MANUAL_BANK_TRANSFER";

    @Column(name = "payment_reference")
    private String paymentReference;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @Column(name = "activated_at")
    private OffsetDateTime activatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "activated_by")
    private User activatedBy;
}


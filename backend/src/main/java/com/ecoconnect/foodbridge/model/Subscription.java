package com.ecoconnect.foodbridge.model;

import com.ecoconnect.foodbridge.model.enums.BillingCycle;
import com.ecoconnect.foodbridge.model.enums.SubscriptionStatus;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * Enforces Rule 8: Platform operational revenue (subscription memberships)
 * is recorded separately from charity contributions.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "subscriptions")
public class Subscription extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "business_id", nullable = false)
    private Business business;

    @NotBlank
    @Size(max = 100)
    @Column(name = "plan_name", nullable = false)
    private String planName;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "billing_cycle", nullable = false, length = 30)
    private BillingCycle billingCycle;

    @NotNull
    @Column(name = "amount_lkr", nullable = false, precision = 10, scale = 2)
    private BigDecimal amountLkr;

    @NotNull
    @Column(name = "start_date", nullable = false)
    private OffsetDateTime startDate;

    @NotNull
    @Column(name = "end_date", nullable = false)
    private OffsetDateTime endDate;

    @NotNull
    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    private SubscriptionStatus status = SubscriptionStatus.ACTIVE;
}


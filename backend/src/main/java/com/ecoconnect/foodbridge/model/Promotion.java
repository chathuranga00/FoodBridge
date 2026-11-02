package com.ecoconnect.foodbridge.model;

import com.ecoconnect.foodbridge.model.enums.PaymentStatus;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * Enforces Rule 8: Platform operational revenue (promotions/ads)
 * is recorded separately from charity contributions.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "promotions")
public class Promotion extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "business_id", nullable = false)
    private Business business;

    @NotBlank
    @Size(max = 200)
    @Column(name = "title", nullable = false)
    private String title;

    @Size(max = 500)
    @Column(name = "banner_url")
    private String bannerUrl;

    @Size(max = 100)
    @Column(name = "target_audience")
    private String targetAudience;

    @NotNull
    @Column(name = "start_date", nullable = false)
    private OffsetDateTime startDate;

    @NotNull
    @Column(name = "end_date", nullable = false)
    private OffsetDateTime endDate;

    @NotNull
    @Column(name = "cost_lkr", nullable = false, precision = 10, scale = 2)
    private BigDecimal costLkr;

    @NotNull
    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status", nullable = false, length = 30)
    private PaymentStatus paymentStatus = PaymentStatus.PENDING;

    @Builder.Default
    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;
}


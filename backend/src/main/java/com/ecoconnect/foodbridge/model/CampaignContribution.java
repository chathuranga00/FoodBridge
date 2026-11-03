package com.ecoconnect.foodbridge.model;

import com.ecoconnect.foodbridge.model.enums.ContributionStatus;
import com.ecoconnect.foodbridge.model.enums.ContributionType;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * Enforces Rule 5 & Rule 8:
 * No direct payment processing - contributions are recorded as pledges and confirmed
 * by the receiving charity. Recorded separately from platform revenue.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "campaign_contributions")
public class CampaignContribution extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "campaign_id", nullable = false)
    private Campaign campaign;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "contributor_user_id")
    private User contributorUser;

    @NotBlank
    @Size(max = 150)
    @Column(name = "contributor_name", nullable = false)
    private String contributorName;

    @Size(max = 255)
    @Column(name = "contributor_email")
    private String contributorEmail;

    @Size(max = 30)
    @Column(name = "contributor_phone")
    private String contributorPhone;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "contribution_type", nullable = false, length = 30)
    private ContributionType contributionType;

    @Column(name = "quantity")
    private Integer quantity;

    @Size(max = 50)
    @Column(name = "unit")
    private String unit;

    @Column(name = "monetary_amount", precision = 12, scale = 2)
    private BigDecimal monetaryAmount;

    @Column(name = "food_amount_kg", precision = 10, scale = 2)
    private BigDecimal foodAmountKg;

    @Column(name = "item_description", columnDefinition = "TEXT")
    private String itemDescription;

    @NotNull
    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    private ContributionStatus status = ContributionStatus.PLEDGED;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "confirmed_by")
    private User confirmedBy;

    @Column(name = "confirmed_at")
    private OffsetDateTime confirmedAt;

    @Size(max = 500)
    @Column(name = "distribution_evidence_url")
    private String distributionEvidenceUrl;

    @Column(name = "distribution_notes", columnDefinition = "TEXT")
    private String distributionNotes;

    @Column(name = "distributed_at")
    private OffsetDateTime distributedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "distributed_by")
    private User distributedBy;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;
}


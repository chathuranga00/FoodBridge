package com.ecoconnect.foodbridge.model;

import com.ecoconnect.foodbridge.model.enums.ContributionType;
import com.ecoconnect.foodbridge.model.enums.PartnershipStatus;
import com.ecoconnect.foodbridge.model.enums.RequesterType;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "partnerships")
public class Partnership extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "business_id", nullable = false)
    private Business business;

    @NotNull
    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(name = "partner_type", nullable = false, length = 30)
    private RequesterType partnerType = RequesterType.CHARITY;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "charity_id")
    private Charity charity;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "animal_org_id")
    private AnimalOrganization animalOrg;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "campaign_id")
    private Campaign campaign;

    @Enumerated(EnumType.STRING)
    @Column(name = "contribution_type", length = 50)
    private ContributionType contributionType;

    @Column(name = "monetary_amount", precision = 12, scale = 2)
    private BigDecimal monetaryAmount;

    @Column(name = "quantity")
    private Integer quantity;

    @Column(name = "unit", length = 50)
    private String unit;

    @Column(name = "item_description", length = 255)
    private String itemDescription;

    @Column(name = "requested_recognition", length = 150)
    private String requestedRecognition;

    @Column(name = "agreed_recognition", length = 150)
    private String agreedRecognition;

    @NotNull
    @Builder.Default
    @Column(name = "recognition_active", nullable = false)
    private Boolean recognitionActive = false;

    @Column(name = "agreement_details", columnDefinition = "TEXT")
    private String agreementDetails;

    /**
     * Stored immutable snapshot of terms once status becomes AGREED.
     */
    @Column(name = "agreed_terms_snapshot", columnDefinition = "TEXT")
    private String agreedTermsSnapshot;

    @Column(name = "agreed_at")
    private OffsetDateTime agreedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "agreed_by_business_user_id")
    private User agreedByBusinessUser;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "agreed_by_charity_user_id")
    private User agreedByCharityUser;

    @Column(name = "delivered_at")
    private OffsetDateTime deliveredAt;

    @Column(name = "delivery_notes", columnDefinition = "TEXT")
    private String deliveryNotes;

    @Column(name = "completed_at")
    private OffsetDateTime completedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "completed_by")
    private User completedBy;

    @Column(name = "completion_notes", columnDefinition = "TEXT")
    private String completionNotes;

    @Column(name = "last_counter_by_role", length = 30)
    private String lastCounterByRole;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "campaign_contribution_id")
    private CampaignContribution campaignContribution;

    @NotNull
    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    private PartnershipStatus status = PartnershipStatus.PROPOSED;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;
}

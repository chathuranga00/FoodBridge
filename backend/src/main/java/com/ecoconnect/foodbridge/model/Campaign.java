package com.ecoconnect.foodbridge.model;

import com.ecoconnect.foodbridge.model.enums.CampaignNeedType;
import com.ecoconnect.foodbridge.model.enums.CampaignOrganizerType;
import com.ecoconnect.foodbridge.model.enums.CampaignStatus;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
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
@Table(name = "campaigns")
public class Campaign extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "organizer_type", nullable = false, length = 30)
    private CampaignOrganizerType organizerType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "charity_id")
    private Charity charity;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "animal_org_id")
    private AnimalOrganization animalOrg;

    @NotBlank
    @Size(max = 255)
    @Column(name = "title", nullable = false)
    private String title;

    @NotBlank
    @Column(name = "description", columnDefinition = "TEXT", nullable = false)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "need_type", length = 50)
    private CampaignNeedType needType;

    @Column(name = "target_quantity")
    private Integer targetQuantity;

    @Column(name = "target_unit", length = 50)
    private String targetUnit;

    @Builder.Default
    @Column(name = "current_quantity")
    private Integer currentQuantity = 0;

    @Column(name = "cover_image_url", length = 500)
    private String coverImageUrl;

    @Column(name = "evidence_url", length = 500)
    private String evidenceUrl;

    @Column(name = "target_beneficiaries_count")
    private Integer targetBeneficiariesCount;

    @Column(name = "target_food_amount_kg", precision = 10, scale = 2)
    private BigDecimal targetFoodAmountKg;

    @Column(name = "target_fund_amount", precision = 12, scale = 2)
    private BigDecimal targetFundAmount;

    @Builder.Default
    @Column(name = "raised_fund_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal raisedFundAmount = BigDecimal.ZERO;

    @NotNull
    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @NotNull
    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @NotNull
    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    private CampaignStatus status = CampaignStatus.PENDING_APPROVAL;

    @Column(name = "approval_notes", columnDefinition = "TEXT")
    private String approvalNotes;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "approved_by")
    private User approvedBy;

    @Column(name = "approved_at")
    private OffsetDateTime approvedAt;

    /**
     * District only publicly exposed to preserve privacy of vulnerable people.
     */
    @Size(max = 100)
    @Column(name = "district")
    private String district;

    @Column(name = "latitude", precision = 10, scale = 7)
    private BigDecimal latitude;

    @Column(name = "longitude", precision = 10, scale = 7)
    private BigDecimal longitude;

    @Column(name = "payment_instructions", columnDefinition = "TEXT")
    private String paymentInstructions;

    @Column(name = "handover_instructions", columnDefinition = "TEXT")
    private String handoverInstructions;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sponsor_business_id")
    private Business sponsorBusiness;

    @Builder.Default
    @Column(name = "is_sponsored")
    private Boolean isSponsored = false;

    @Column(name = "sponsorship_message", length = 255)
    private String sponsorshipMessage;

    @Column(name = "sponsorship_amount", precision = 12, scale = 2)
    private BigDecimal sponsorshipAmount;
}

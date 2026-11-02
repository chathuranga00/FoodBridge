package com.ecoconnect.foodbridge.model;

import com.ecoconnect.foodbridge.model.enums.PartnershipStatus;
import com.ecoconnect.foodbridge.model.enums.RequesterType;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDate;
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
    @Enumerated(EnumType.STRING)
    @Column(name = "partner_type", nullable = false, length = 30)
    private RequesterType partnerType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "charity_id")
    private Charity charity;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "animal_org_id")
    private AnimalOrganization animalOrg;

    @Column(name = "agreement_details", columnDefinition = "TEXT")
    private String agreementDetails;

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


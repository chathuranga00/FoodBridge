package com.ecoconnect.foodbridge.model;

import com.ecoconnect.foodbridge.model.enums.OpportunityStatus;
import com.ecoconnect.foodbridge.model.enums.VolunteerOpportunityCategory;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "volunteer_opportunities")
public class VolunteerOpportunity extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organizer_user_id", nullable = false)
    private User organizerUser;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "charity_id")
    private Charity charity;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "animal_org_id")
    private AnimalOrganization animalOrg;

    @NotBlank
    @Size(max = 255)
    @Column(name = "organizer_name", nullable = false)
    private String organizerName;

    @NotBlank
    @Size(max = 50)
    @Column(name = "organizer_type", nullable = false)
    private String organizerType;

    @NotBlank
    @Size(max = 255)
    @Column(name = "title", nullable = false)
    private String title;

    @NotBlank
    @Column(name = "description", columnDefinition = "TEXT", nullable = false)
    private String description;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "category", nullable = false, length = 50)
    private VolunteerOpportunityCategory category;

    @NotBlank
    @Size(max = 100)
    @Column(name = "district", nullable = false)
    private String district;

    @Size(max = 100)
    @Column(name = "city")
    private String city;

    @Size(max = 255)
    @Column(name = "address_line")
    private String addressLine;

    @Column(name = "latitude", precision = 10, scale = 7)
    private BigDecimal latitude;

    @Column(name = "longitude", precision = 10, scale = 7)
    private BigDecimal longitude;

    @NotNull
    @Column(name = "event_date", nullable = false)
    private LocalDate eventDate;

    @Size(max = 20)
    @Column(name = "start_time")
    private String startTime;

    @Size(max = 20)
    @Column(name = "end_time")
    private String endTime;

    @NotNull
    @Builder.Default
    @Column(name = "estimated_hours", nullable = false, precision = 4, scale = 1)
    private BigDecimal estimatedHours = BigDecimal.valueOf(2.0);

    @NotNull
    @Builder.Default
    @Column(name = "volunteers_needed", nullable = false)
    private Integer volunteersNeeded = 1;

    @NotNull
    @Builder.Default
    @Column(name = "volunteers_registered", nullable = false)
    private Integer volunteersRegistered = 0;

    @NotNull
    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    private OpportunityStatus status = OpportunityStatus.ACTIVE;

    @Column(name = "skills_required", columnDefinition = "TEXT")
    private String skillsRequired;

    @Size(max = 255)
    @Column(name = "contact_email")
    private String contactEmail;

    @Size(max = 50)
    @Column(name = "contact_phone")
    private String contactPhone;
}


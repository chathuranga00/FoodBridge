package com.ecoconnect.foodbridge.model;

import com.ecoconnect.foodbridge.model.enums.VerificationStatus;
import com.ecoconnect.foodbridge.model.enums.VolunteerAvailability;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.math.BigDecimal;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "volunteers")
public class Volunteer extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @NotNull
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", unique = true, nullable = false)
    private User user;

    @Column(name = "skills", columnDefinition = "TEXT")
    private String skills;

    @Size(max = 50)
    @Column(name = "vehicle_type")
    private String vehicleType;

    @NotNull
    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(name = "availability_status", nullable = false, length = 30)
    private VolunteerAvailability availabilityStatus = VolunteerAvailability.AVAILABLE;

    @Column(name = "current_latitude", precision = 10, scale = 7)
    private BigDecimal currentLatitude;

    @Column(name = "current_longitude", precision = 10, scale = 7)
    private BigDecimal currentLongitude;

    @Size(max = 255)
    @Column(name = "preferred_districts")
    private String preferredDistricts;

    @NotNull
    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(name = "verification_status", nullable = false, length = 30)
    private VerificationStatus verificationStatus = VerificationStatus.PENDING;

    @Builder.Default
    @Column(name = "total_tasks_completed", nullable = false)
    private Integer totalTasksCompleted = 0;
}


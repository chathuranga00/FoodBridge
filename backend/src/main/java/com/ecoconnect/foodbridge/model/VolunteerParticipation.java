package com.ecoconnect.foodbridge.model;

import com.ecoconnect.foodbridge.model.enums.ParticipationStatus;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "volunteer_participations", uniqueConstraints = {
        @UniqueConstraint(name = "uk_opportunity_user", columnNames = {"opportunity_id", "user_id"})
})
public class VolunteerParticipation extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "opportunity_id", nullable = false)
    private VolunteerOpportunity opportunity;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @NotNull
    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    private ParticipationStatus status = ParticipationStatus.REGISTERED;

    @NotNull
    @Builder.Default
    @Column(name = "hours_volunteered", nullable = false, precision = 5, scale = 2)
    private BigDecimal hoursVolunteered = BigDecimal.ZERO;

    @Column(name = "attendance_notes", columnDefinition = "TEXT")
    private String attendanceNotes;

    @Column(name = "feedback", columnDefinition = "TEXT")
    private String feedback;

    @NotNull
    @Column(name = "registered_at", nullable = false)
    private OffsetDateTime registeredAt;

    @Column(name = "attended_at")
    private OffsetDateTime attendedAt;
}

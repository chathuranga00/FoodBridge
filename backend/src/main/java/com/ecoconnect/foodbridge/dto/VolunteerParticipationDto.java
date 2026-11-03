package com.ecoconnect.foodbridge.dto;

import com.ecoconnect.foodbridge.model.VolunteerParticipation;
import com.ecoconnect.foodbridge.model.enums.ParticipationStatus;
import com.ecoconnect.foodbridge.model.enums.VolunteerOpportunityCategory;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VolunteerParticipationDto {
    private UUID id;
    private UUID opportunityId;
    private String opportunityTitle;
    private VolunteerOpportunityCategory category;
    private String organizerName;
    private String district;
    private String city;
    private LocalDate eventDate;
    private String startTime;
    private String endTime;

    private UUID userId;
    private String volunteerName;
    private String volunteerEmail;
    private String volunteerPhone;

    private ParticipationStatus status;
    private BigDecimal hoursVolunteered;
    private String attendanceNotes;
    private String feedback;
    private OffsetDateTime registeredAt;
    private OffsetDateTime attendedAt;

    public static VolunteerParticipationDto fromEntity(VolunteerParticipation part) {
        if (part == null) return null;
        var opp = part.getOpportunity();
        var user = part.getUser();

        return VolunteerParticipationDto.builder()
                .id(part.getId())
                .opportunityId(opp != null ? opp.getId() : null)
                .opportunityTitle(opp != null ? opp.getTitle() : null)
                .category(opp != null ? opp.getCategory() : null)
                .organizerName(opp != null ? opp.getOrganizerName() : null)
                .district(opp != null ? opp.getDistrict() : null)
                .city(opp != null ? opp.getCity() : null)
                .eventDate(opp != null ? opp.getEventDate() : null)
                .startTime(opp != null ? opp.getStartTime() : null)
                .endTime(opp != null ? opp.getEndTime() : null)
                .userId(user != null ? user.getId() : null)
                .volunteerName(user != null ? user.getFullName() : null)
                .volunteerEmail(user != null ? user.getEmail() : null)
                .volunteerPhone(user != null ? user.getPhoneNumber() : null)
                .status(part.getStatus())
                .hoursVolunteered(part.getHoursVolunteered())
                .attendanceNotes(part.getAttendanceNotes())
                .feedback(part.getFeedback())
                .registeredAt(part.getRegisteredAt())
                .attendedAt(part.getAttendedAt())
                .build();
    }
}

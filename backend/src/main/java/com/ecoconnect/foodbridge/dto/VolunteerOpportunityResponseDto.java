package com.ecoconnect.foodbridge.dto;

import com.ecoconnect.foodbridge.model.VolunteerOpportunity;
import com.ecoconnect.foodbridge.model.enums.OpportunityStatus;
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
public class VolunteerOpportunityResponseDto {
    private UUID id;
    private UUID organizerUserId;
    private UUID charityId;
    private UUID animalOrgId;
    private String organizerName;
    private String organizerType;
    private String title;
    private String description;
    private VolunteerOpportunityCategory category;
    private String district;
    private String city;
    private String addressLine;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private LocalDate eventDate;
    private String startTime;
    private String endTime;
    private BigDecimal estimatedHours;
    private Integer volunteersNeeded;
    private Integer volunteersRegistered;
    private OpportunityStatus status;
    private String skillsRequired;
    private String contactEmail;
    private String contactPhone;
    private OffsetDateTime createdAt;

    // Authenticated user contextual fields
    private Boolean isUserRegistered;
    private String userParticipationStatus;

    public static VolunteerOpportunityResponseDto fromEntity(VolunteerOpportunity opp) {
        if (opp == null) return null;
        return VolunteerOpportunityResponseDto.builder()
                .id(opp.getId())
                .organizerUserId(opp.getOrganizerUser() != null ? opp.getOrganizerUser().getId() : null)
                .charityId(opp.getCharity() != null ? opp.getCharity().getId() : null)
                .animalOrgId(opp.getAnimalOrg() != null ? opp.getAnimalOrg().getId() : null)
                .organizerName(opp.getOrganizerName())
                .organizerType(opp.getOrganizerType())
                .title(opp.getTitle())
                .description(opp.getDescription())
                .category(opp.getCategory())
                .district(opp.getDistrict())
                .city(opp.getCity())
                .addressLine(opp.getAddressLine())
                .latitude(opp.getLatitude())
                .longitude(opp.getLongitude())
                .eventDate(opp.getEventDate())
                .startTime(opp.getStartTime())
                .endTime(opp.getEndTime())
                .estimatedHours(opp.getEstimatedHours())
                .volunteersNeeded(opp.getVolunteersNeeded())
                .volunteersRegistered(opp.getVolunteersRegistered())
                .status(opp.getStatus())
                .skillsRequired(opp.getSkillsRequired())
                .contactEmail(opp.getContactEmail())
                .contactPhone(opp.getContactPhone())
                .createdAt(opp.getCreatedAt())
                .build();
    }
}

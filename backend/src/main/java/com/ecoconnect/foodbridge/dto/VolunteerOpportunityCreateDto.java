package com.ecoconnect.foodbridge.dto;

import com.ecoconnect.foodbridge.model.enums.VolunteerOpportunityCategory;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VolunteerOpportunityCreateDto {

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Description is required")
    private String description;

    @NotNull(message = "Category is required")
    private VolunteerOpportunityCategory category;

    @NotBlank(message = "District is required")
    private String district;

    private String city;
    private String addressLine;
    private BigDecimal latitude;
    private BigDecimal longitude;

    @NotNull(message = "Event date is required")
    private LocalDate eventDate;

    private String startTime;
    private String endTime;

    private BigDecimal estimatedHours;

    @NotNull(message = "Number of volunteers needed is required")
    private Integer volunteersNeeded;

    private String skillsRequired;
    private String contactEmail;
    private String contactPhone;
}


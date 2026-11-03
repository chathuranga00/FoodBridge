package com.ecoconnect.foodbridge.dto;

import com.ecoconnect.foodbridge.model.enums.ParticipationStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AttendanceMarkDto {

    @NotNull(message = "Status is required (ATTENDED, NO_SHOW, CANCELLED)")
    private ParticipationStatus status;

    private BigDecimal hoursVolunteered;

    private String attendanceNotes;
}

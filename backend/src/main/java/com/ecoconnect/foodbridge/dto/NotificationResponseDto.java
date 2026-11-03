package com.ecoconnect.foodbridge.dto;

import com.ecoconnect.foodbridge.model.Notification;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationResponseDto {
    private UUID id;
    private String title;
    private String message;
    private String type;
    private Boolean isRead;
    private UUID referenceId;
    private String referenceType;
    private OffsetDateTime createdAt;

    public static NotificationResponseDto fromEntity(Notification notification) {
        if (notification == null) return null;
        return NotificationResponseDto.builder()
                .id(notification.getId())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .type(notification.getType())
                .isRead(notification.getIsRead())
                .referenceId(notification.getReferenceId())
                .referenceType(notification.getReferenceType())
                .createdAt(notification.getCreatedAt())
                .build();
    }
}


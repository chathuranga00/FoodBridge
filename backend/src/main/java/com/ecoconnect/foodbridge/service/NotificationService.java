package com.ecoconnect.foodbridge.service;

import com.ecoconnect.foodbridge.dto.NotificationResponseDto;
import com.ecoconnect.foodbridge.exception.ResourceNotFoundException;
import com.ecoconnect.foodbridge.model.User;
import com.ecoconnect.foodbridge.repository.NotificationRepository;
import com.ecoconnect.foodbridge.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public NotificationService(NotificationRepository notificationRepository, UserRepository userRepository) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<NotificationResponseDto> getMyNotifications(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userEmail));

        return notificationRepository.findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(NotificationResponseDto::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public long getUnreadCount(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userEmail));

        return notificationRepository.countByUserIdAndIsReadFalse(user.getId());
    }

    @Transactional
    public void markAsRead(String userEmail, UUID notificationId) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userEmail));

        int updated = notificationRepository.markAsReadByIdAndUserId(notificationId, user.getId());
        if (updated == 0) {
            throw new ResourceNotFoundException("Notification not found or unauthorized: " + notificationId);
        }
    }

    @Transactional
    public void markAllAsRead(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userEmail));

        notificationRepository.markAllAsReadByUserId(user.getId());
    }
}


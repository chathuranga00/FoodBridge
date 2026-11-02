package com.ecoconnect.foodbridge.service;

import com.ecoconnect.foodbridge.model.Notification;
import com.ecoconnect.foodbridge.model.User;
import com.ecoconnect.foodbridge.repository.NotificationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

/**
 * Service for simulated email dispatches (email notification stubs)
 * and in-app user notifications.
 */
@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final NotificationRepository notificationRepository;

    public EmailService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    @Transactional
    public void sendVerificationApprovedEmail(User recipient, String orgName, String orgType, UUID orgId) {
        String subject = "Congratulations! Your " + orgType.toLowerCase() + " profile has been verified on FoodBridge";
        String body = String.format(
                "Dear %s,\n\n" +
                "Great news! Your %s profile for '%s' has been officially verified and approved by the FoodBridge administration team.\n" +
                "You are now fully authorized to publish food surplus listings, grocery offers, and community campaigns.\n\n" +
                "Thank you for helping combat food waste and support communities across Sri Lanka!\n\n" +
                "— The FoodBridge Sri Lanka (EcoConnect) Team",
                recipient.getFullName(),
                orgType.toLowerCase(),
                orgName
        );

        // Simulated email stub logging
        log.info("================================================================================");
        log.info("[EMAIL STUB DISPATCH] To: {} <{}>", recipient.getFullName(), recipient.getEmail());
        log.info("[EMAIL STUB DISPATCH] Subject: {}", subject);
        log.info("[EMAIL STUB DISPATCH] Message Body:\n{}", body);
        log.info("================================================================================");

        // Record in-app notification
        Notification notification = Notification.builder()
                .user(recipient)
                .title("Profile Verified: " + orgName)
                .message("Your " + orgType.toLowerCase() + " profile has been verified. You may now publish listings and campaigns.")
                .type("VERIFICATION_APPROVED")
                .referenceId(orgId)
                .referenceType(orgType)
                .isRead(false)
                .build();

        notificationRepository.save(notification);
    }

    @Transactional
    public void sendVerificationRejectedEmail(User recipient, String orgName, String orgType, UUID orgId, String reason) {
        String subject = "FoodBridge Verification Update: Action Required for " + orgName;
        String body = String.format(
                "Dear %s,\n\n" +
                "Thank you for submitting your %s profile for '%s' on FoodBridge.\n" +
                "Our administrative review team was unable to verify your profile at this time.\n\n" +
                "Reason provided by administrator:\n\"%s\"\n\n" +
                "Please update your profile details and supporting documents in your dashboard to resubmit for verification.\n\n" +
                "— The FoodBridge Sri Lanka (EcoConnect) Team",
                recipient.getFullName(),
                orgType.toLowerCase(),
                orgName,
                reason
        );

        // Simulated email stub logging
        log.info("================================================================================");
        log.info("[EMAIL STUB DISPATCH] To: {} <{}>", recipient.getFullName(), recipient.getEmail());
        log.info("[EMAIL STUB DISPATCH] Subject: {}", subject);
        log.info("[EMAIL STUB DISPATCH] Message Body:\n{}", body);
        log.info("================================================================================");

        // Record in-app notification
        Notification notification = Notification.builder()
                .user(recipient)
                .title("Profile Verification Update: " + orgName)
                .message("Your profile was not approved. Reason: " + reason + ". Please update your profile to resubmit.")
                .type("VERIFICATION_REJECTED")
                .referenceId(orgId)
                .referenceType(orgType)
                .isRead(false)
                .build();

        notificationRepository.save(notification);
    }
}

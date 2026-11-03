package com.ecoconnect.foodbridge.service;

import com.ecoconnect.foodbridge.model.Notification;
import com.ecoconnect.foodbridge.model.User;
import com.ecoconnect.foodbridge.repository.NotificationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

/**
 * Service for simulated email dispatches (email notification stubs)
 * and in-app user notifications for key events across FoodBridge.
 */
@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);
    private static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter.ofPattern("MMM dd, yyyy HH:mm");

    private final NotificationRepository notificationRepository;

    public EmailService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    // =========================================================================
    // 1. VERIFICATION RESULTS
    // =========================================================================

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

        logEmailStub(recipient, subject, body);

        sendInAppNotification(
                recipient,
                "Profile Verified: " + orgName,
                "Your " + orgType.toLowerCase() + " profile has been verified. You may now publish listings and campaigns.",
                "VERIFICATION_APPROVED",
                orgId,
                orgType
        );
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

        logEmailStub(recipient, subject, body);

        sendInAppNotification(
                recipient,
                "Profile Verification Update: " + orgName,
                "Your profile was not approved. Reason: " + reason + ". Please update your profile to resubmit.",
                "VERIFICATION_REJECTED",
                orgId,
                orgType
        );
    }

    // =========================================================================
    // 2. FOOD RESCUE REQUEST APPROVED
    // =========================================================================

    @Transactional
    public void sendFoodRequestApprovedEmail(User recipient, String listingTitle, String businessName, String pickupWindow, UUID requestId) {
        String subject = "Food Rescue Request Approved: " + listingTitle;
        String body = String.format(
                "Dear %s,\n\n" +
                "Your request for surplus food '%s' has been APPROVED by '%s'!\n" +
                "Scheduled Pickup Window: %s\n\n" +
                "Please arrive promptly during the designated window with appropriate food-grade containers or transport.\n" +
                "Thank you for helping prevent food waste and nourishing communities in Sri Lanka.\n\n" +
                "— The FoodBridge Sri Lanka (EcoConnect) Team",
                recipient.getFullName(),
                listingTitle,
                businessName,
                pickupWindow != null ? pickupWindow : "During designated pickup hours"
        );

        logEmailStub(recipient, subject, body);

        sendInAppNotification(
                recipient,
                "Food Request Approved: " + listingTitle,
                "Your request for surplus food was approved by " + businessName + ". Pickup: " + (pickupWindow != null ? pickupWindow : "As scheduled") + ".",
                "FOOD_REQUEST_APPROVED",
                requestId,
                "FOOD_REQUEST"
        );
    }

    // =========================================================================
    // 3. GROCERY COUPON RESERVED
    // =========================================================================

    @Transactional
    public void sendCouponReservedEmail(User recipient, String offerTitle, String businessName, String redemptionCode, OffsetDateTime expiresAt, UUID reservationId) {
        String formattedExpiry = expiresAt != null ? expiresAt.format(DATE_TIME_FORMATTER) + " UTC" : "within 24 hours";
        String subject = "Your Discount Coupon: " + offerTitle + " (Code: " + redemptionCode + ")";
        String body = String.format(
                "Dear %s,\n\n" +
                "You have successfully reserved a discounted grocery package from '%s'!\n\n" +
                "Offer: %s\n" +
                "Redemption Code: %s\n" +
                "Valid Until: %s\n\n" +
                "Present this code at the cashier counter upon checkout to claim your items.\n" +
                "Thank you for choosing budget-friendly, sustainable groceries!\n\n" +
                "— The FoodBridge Sri Lanka (EcoConnect) Team",
                recipient.getFullName(),
                businessName,
                offerTitle,
                redemptionCode,
                formattedExpiry
        );

        logEmailStub(recipient, subject, body);

        sendInAppNotification(
                recipient,
                "Coupon Reserved: " + offerTitle,
                "Code: " + redemptionCode + " at " + businessName + ". Valid until " + formattedExpiry + ".",
                "COUPON_RESERVED",
                reservationId,
                "GROCERY_RESERVATION"
        );
    }

    // =========================================================================
    // 4. PARTNERSHIP UPDATE
    // =========================================================================

    @Transactional
    public void sendPartnershipUpdateEmail(User recipient, String title, String message, String status, String note, UUID partnershipId) {
        String subject = "FoodBridge Partnership Update [" + (status != null ? status : "UPDATE") + "]: " + title;
        String body = String.format(
                "Dear %s,\n\n" +
                "%s\n\n" +
                (note != null && !note.isBlank() ? "Note: " + note + "\n\n" : "") +
                "Log in to your FoodBridge dashboard to review terms, participate in messages, or complete receipt.\n\n" +
                "— The FoodBridge Sri Lanka (EcoConnect) Team",
                recipient.getFullName(),
                message
        );

        logEmailStub(recipient, subject, body);

        sendInAppNotification(
                recipient,
                title,
                message,
                "PARTNERSHIP_UPDATE",
                partnershipId,
                "PARTNERSHIP"
        );
    }

    // =========================================================================
    // 5. VOLUNTEER PARTICIPATION (SIGN-UP & ATTENDANCE)
    // =========================================================================

    @Transactional
    public void sendNewVolunteerSignUpEmail(User organizer, String opportunityTitle, String volunteerName, String volunteerEmail, UUID opportunityId) {
        String subject = "New Volunteer Registered: " + opportunityTitle;
        String body = String.format(
                "Dear %s,\n\n" +
                "A community member has registered to volunteer for your activity '%s'!\n\n" +
                "Volunteer Name: %s\n" +
                "Volunteer Email: %s\n\n" +
                "You can view the full roster and mark attendance on your dashboard.\n\n" +
                "— The FoodBridge Sri Lanka (EcoConnect) Team",
                organizer.getFullName(),
                opportunityTitle,
                volunteerName,
                volunteerEmail
        );

        logEmailStub(organizer, subject, body);

        sendInAppNotification(
                organizer,
                "New Volunteer Sign-up: " + opportunityTitle,
                volunteerName + " (" + volunteerEmail + ") registered for " + opportunityTitle + ".",
                "VOLUNTEER_SIGNUP",
                opportunityId,
                "VOLUNTEER_OPPORTUNITY"
        );
    }

    @Transactional
    public void sendVolunteerRegistrationConfirmationEmail(User volunteer, String opportunityTitle, String organizerName, String eventDate, String eventLocation, UUID opportunityId) {
        String subject = "Volunteer Registration Confirmed: " + opportunityTitle;
        String body = String.format(
                "Dear %s,\n\n" +
                "You are successfully registered for the volunteer activity '%s' organized by %s!\n\n" +
                "Date: %s\n" +
                "Location: %s\n\n" +
                "Thank you for giving your time and passion to support our communities in Sri Lanka.\n\n" +
                "— The FoodBridge Sri Lanka (EcoConnect) Team",
                volunteer.getFullName(),
                opportunityTitle,
                organizerName,
                eventDate,
                eventLocation
        );

        logEmailStub(volunteer, subject, body);

        sendInAppNotification(
                volunteer,
                "Registered: " + opportunityTitle,
                "You are registered for " + opportunityTitle + " on " + eventDate + " with " + organizerName + ".",
                "VOLUNTEER_REGISTERED",
                opportunityId,
                "VOLUNTEER_OPPORTUNITY"
        );
    }

    @Transactional
    public void sendVolunteerAttendanceMarkedEmail(User volunteer, String opportunityTitle, String organizerName, boolean attended, Double hours, UUID opportunityId) {
        String statusText = attended ? "Attended (" + hours + " hrs)" : "Marked as No-Show";
        String subject = "Volunteer Attendance Recorded: " + opportunityTitle;
        String body = String.format(
                "Dear %s,\n\n" +
                "Your attendance for '%s' organized by %s has been recorded.\n\n" +
                "Status: %s\n\n" +
                (attended ? "Your dedicated hours have been credited to your community volunteer record and platform impact statistics!\n\n" : "") +
                "— The FoodBridge Sri Lanka (EcoConnect) Team",
                volunteer.getFullName(),
                opportunityTitle,
                organizerName,
                statusText
        );

        logEmailStub(volunteer, subject, body);

        sendInAppNotification(
                volunteer,
                "Volunteer Activity " + (attended ? "Completed" : "Attendance Update"),
                "Your participation in " + opportunityTitle + " was marked as " + statusText + ".",
                "VOLUNTEER_ATTENDANCE",
                opportunityId,
                "VOLUNTEER_OPPORTUNITY"
        );
    }

    // =========================================================================
    // HELPER METHODS
    // =========================================================================

    @Transactional
    public void sendInAppNotification(User recipient, String title, String message, String type, UUID refId, String refType) {
        log.info("[NOTIFICATION DISPATCH] To: {} | Title: {} | Type: {}", recipient.getEmail(), title, type);

        Notification notification = Notification.builder()
                .user(recipient)
                .title(title)
                .message(message)
                .type(type)
                .referenceId(refId)
                .referenceType(refType)
                .isRead(false)
                .build();

        notificationRepository.save(notification);
    }

    private void logEmailStub(User recipient, String subject, String body) {
        log.info("================================================================================");
        log.info("[EMAIL STUB DISPATCH] To: {} <{}>", recipient.getFullName(), recipient.getEmail());
        log.info("[EMAIL STUB DISPATCH] Subject: {}", subject);
        log.info("[EMAIL STUB DISPATCH] Message Body:\n{}", body);
        log.info("================================================================================");
    }
}

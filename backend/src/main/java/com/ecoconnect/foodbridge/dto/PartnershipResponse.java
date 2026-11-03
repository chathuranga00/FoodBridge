package com.ecoconnect.foodbridge.dto;

import com.ecoconnect.foodbridge.model.Partnership;
import com.ecoconnect.foodbridge.model.enums.ContributionType;
import com.ecoconnect.foodbridge.model.enums.PartnershipStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PartnershipResponse {

    private UUID id;

    // Business details
    private UUID businessId;
    private String businessName;
    private String businessType;
    private String businessLogoUrl;
    private String businessPhone;

    // Charity details
    private UUID charityId;
    private String charityName;
    private String charityRegistrationNumber;
    private String charityLogoUrl;
    private String charityPhone;

    // Target Campaign details
    private UUID campaignId;
    private String campaignTitle;
    private String campaignDistrict;
    private String campaignCoverUrl;

    // Contribution terms
    private ContributionType contributionType;
    private BigDecimal monetaryAmount;
    private Integer quantity;
    private String unit;
    private String itemDescription;

    // Promotional recognition
    private String requestedRecognition;
    private String agreedRecognition;
    private Boolean recognitionActive;

    // Status and negotiations
    private PartnershipStatus status;
    private String lastCounterByRole;
    private String agreementDetails;

    // Immutable Terms Snapshot
    private String agreedTermsSnapshot;
    private OffsetDateTime agreedAt;
    private UUID agreedByBusinessUserId;
    private UUID agreedByCharityUserId;

    // Delivery & Completion
    private OffsetDateTime deliveredAt;
    private String deliveryNotes;
    private OffsetDateTime completedAt;
    private UUID completedByUserId;
    private String completionNotes;

    // Created & Updated
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;

    // Linked Campaign Contribution
    private UUID campaignContributionId;

    // Negotiation thread messages
    @Builder.Default
    private List<PartnershipMessageResponse> messages = new ArrayList<>();

    // Status timeline
    @Builder.Default
    private List<TimelineItem> timeline = new ArrayList<>();

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TimelineItem {
        private String step;
        private String title;
        private String description;
        private OffsetDateTime timestamp;
        private String actorRole;
        private Boolean completed;
        private Boolean current;
    }

    public static PartnershipResponse fromEntity(Partnership p) {
        if (p == null) return null;

        PartnershipResponse resp = PartnershipResponse.builder()
                .id(p.getId())
                .businessId(p.getBusiness() != null ? p.getBusiness().getId() : null)
                .businessName(p.getBusiness() != null ? p.getBusiness().getBusinessName() : null)
                .businessType(p.getBusiness() != null && p.getBusiness().getBusinessType() != null
                        ? p.getBusiness().getBusinessType().name() : null)
                .businessLogoUrl(p.getBusiness() != null ? p.getBusiness().getLogoUrl() : null)
                .businessPhone(p.getBusiness() != null && p.getBusiness().getUser() != null
                        ? p.getBusiness().getUser().getPhoneNumber() : null)
                .charityId(p.getCharity() != null ? p.getCharity().getId() : null)
                .charityName(p.getCharity() != null ? p.getCharity().getCharityName() : null)
                .charityRegistrationNumber(p.getCharity() != null ? p.getCharity().getRegistrationNumber() : null)
                .charityLogoUrl(p.getCharity() != null ? p.getCharity().getLogoUrl() : null)
                .charityPhone(p.getCharity() != null && p.getCharity().getUser() != null
                        ? p.getCharity().getUser().getPhoneNumber() : null)
                .campaignId(p.getCampaign() != null ? p.getCampaign().getId() : null)
                .campaignTitle(p.getCampaign() != null ? p.getCampaign().getTitle() : null)
                .campaignDistrict(p.getCampaign() != null ? p.getCampaign().getDistrict() : null)
                .campaignCoverUrl(p.getCampaign() != null ? p.getCampaign().getCoverImageUrl() : null)
                .contributionType(p.getContributionType())
                .monetaryAmount(p.getMonetaryAmount())
                .quantity(p.getQuantity())
                .unit(p.getUnit())
                .itemDescription(p.getItemDescription())
                .requestedRecognition(p.getRequestedRecognition())
                .agreedRecognition(p.getAgreedRecognition())
                .recognitionActive(p.getRecognitionActive() != null ? p.getRecognitionActive() : false)
                .status(p.getStatus())
                .lastCounterByRole(p.getLastCounterByRole())
                .agreementDetails(p.getAgreementDetails())
                .agreedTermsSnapshot(p.getAgreedTermsSnapshot())
                .agreedAt(p.getAgreedAt())
                .agreedByBusinessUserId(p.getAgreedByBusinessUser() != null ? p.getAgreedByBusinessUser().getId() : null)
                .agreedByCharityUserId(p.getAgreedByCharityUser() != null ? p.getAgreedByCharityUser().getId() : null)
                .deliveredAt(p.getDeliveredAt())
                .deliveryNotes(p.getDeliveryNotes())
                .completedAt(p.getCompletedAt())
                .completedByUserId(p.getCompletedBy() != null ? p.getCompletedBy().getId() : null)
                .completionNotes(p.getCompletionNotes())
                .campaignContributionId(p.getCampaignContribution() != null ? p.getCampaignContribution().getId() : null)
                .createdAt(p.getCreatedAt())
                .updatedAt(p.getUpdatedAt())
                .messages(new ArrayList<>())
                .timeline(buildTimeline(p))
                .build();

        return resp;
    }

    private static List<TimelineItem> buildTimeline(Partnership p) {
        List<TimelineItem> items = new ArrayList<>();
        PartnershipStatus currentStatus = p.getStatus();

        // 1. Proposed
        boolean isProposedPassed = currentStatus != null;
        items.add(TimelineItem.builder()
                .step("PROPOSED")
                .title("Partnership Proposed")
                .description("Business submitted initial proposal with requested promotional recognition.")
                .timestamp(p.getCreatedAt())
                .actorRole("BUSINESS")
                .completed(isProposedPassed)
                .current(currentStatus == PartnershipStatus.PROPOSED)
                .build());

        // 2. Negotiations / Countered
        if (currentStatus == PartnershipStatus.COUNTERED || p.getLastCounterByRole() != null) {
            items.add(TimelineItem.builder()
                    .step("COUNTERED")
                    .title("Terms Counter-Proposed")
                    .description("Counter terms proposed by " + (p.getLastCounterByRole() != null ? p.getLastCounterByRole() : "counterpart"))
                    .timestamp(p.getUpdatedAt())
                    .actorRole(p.getLastCounterByRole() != null ? p.getLastCounterByRole() : "CHARITY")
                    .completed(currentStatus != PartnershipStatus.COUNTERED)
                    .current(currentStatus == PartnershipStatus.COUNTERED)
                    .build());
        }

        // Declined branch if applicable
        if (currentStatus == PartnershipStatus.DECLINED) {
            items.add(TimelineItem.builder()
                    .step("DECLINED")
                    .title("Partnership Declined")
                    .description("Proposal declined during negotiations.")
                    .timestamp(p.getUpdatedAt())
                    .actorRole("CHARITY")
                    .completed(true)
                    .current(true)
                    .build());
            return items;
        }

        // 3. Agreed
        boolean isAgreedPassed = currentStatus == PartnershipStatus.AGREED ||
                currentStatus == PartnershipStatus.DELIVERED ||
                currentStatus == PartnershipStatus.COMPLETED;
        items.add(TimelineItem.builder()
                .step("AGREED")
                .title("Terms Agreed & Locked")
                .description("Both parties agreed on contribution terms and recognition. Terms are now immutable.")
                .timestamp(p.getAgreedAt())
                .actorRole("BOTH")
                .completed(isAgreedPassed)
                .current(currentStatus == PartnershipStatus.AGREED)
                .build());

        // 4. Delivered
        boolean isDeliveredPassed = currentStatus == PartnershipStatus.DELIVERED ||
                currentStatus == PartnershipStatus.COMPLETED;
        items.add(TimelineItem.builder()
                .step("DELIVERED")
                .title("Support Dispatched / Delivered")
                .description(p.getDeliveryNotes() != null ? p.getDeliveryNotes() : "Business dispatched aid supplies/funds to charity.")
                .timestamp(p.getDeliveredAt())
                .actorRole("BUSINESS")
                .completed(isDeliveredPassed)
                .current(currentStatus == PartnershipStatus.DELIVERED)
                .build());

        // 5. Completed
        boolean isCompletedPassed = currentStatus == PartnershipStatus.COMPLETED;
        items.add(TimelineItem.builder()
                .step("COMPLETED")
                .title("Receipt Confirmed & Recognition Active")
                .description("Charity confirmed receipt. Platform activated corporate CSR recognition badge.")
                .timestamp(p.getCompletedAt())
                .actorRole("CHARITY")
                .completed(isCompletedPassed)
                .current(currentStatus == PartnershipStatus.COMPLETED)
                .build());

        return items;
    }
}


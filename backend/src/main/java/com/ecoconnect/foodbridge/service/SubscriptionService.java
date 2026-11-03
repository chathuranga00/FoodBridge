package com.ecoconnect.foodbridge.service;

import com.ecoconnect.foodbridge.dto.AdminSubscriptionActionDto;
import com.ecoconnect.foodbridge.dto.SubscribeRequestDto;
import com.ecoconnect.foodbridge.dto.SubscriptionPackageDto;
import com.ecoconnect.foodbridge.dto.SubscriptionResponseDto;
import com.ecoconnect.foodbridge.exception.BadRequestException;
import com.ecoconnect.foodbridge.exception.ResourceNotFoundException;
import com.ecoconnect.foodbridge.model.Business;
import com.ecoconnect.foodbridge.model.BusinessSubscription;
import com.ecoconnect.foodbridge.model.User;
import com.ecoconnect.foodbridge.model.enums.BillingCycle;
import com.ecoconnect.foodbridge.model.enums.SubscriptionPlan;
import com.ecoconnect.foodbridge.model.enums.SubscriptionStatus;
import com.ecoconnect.foodbridge.repository.BusinessRepository;
import com.ecoconnect.foodbridge.repository.BusinessSubscriptionRepository;
import com.ecoconnect.foodbridge.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.time.Year;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class SubscriptionService {

    private final BusinessSubscriptionRepository subscriptionRepository;
    private final BusinessRepository businessRepository;
    private final UserRepository userRepository;

    public List<SubscriptionPackageDto> getSubscriptionPackages() {
        return List.of(
                SubscriptionPackageDto.builder()
                        .plan(SubscriptionPlan.FREE)
                        .name("Free Starter")
                        .priceMonthly(BigDecimal.ZERO)
                        .priceAnnual(BigDecimal.ZERO)
                        .maxPromotions(1)
                        .hasAnalytics(false)
                        .hasFeaturedPlacement(false)
                        .hasSponsoredCampaigns(false)
                        .badge("Community")
                        .description("Essential surplus food donation with 1 active promotional listing.")
                        .features(List.of(
                                "1 Active Promotional Offer",
                                "Standard Business Directory Listing",
                                "Basic Food Rescue & Surplus Donation",
                                "Verified Business Community Badge",
                                "Aggregate Platform Impact Stats"
                        ))
                        .build(),
                SubscriptionPackageDto.builder()
                        .plan(SubscriptionPlan.PROMOTION)
                        .name("Growth Promotion")
                        .priceMonthly(BigDecimal.valueOf(4500.00))
                        .priceAnnual(BigDecimal.valueOf(45000.00))
                        .maxPromotions(5)
                        .hasAnalytics(true)
                        .hasFeaturedPlacement(true)
                        .hasSponsoredCampaigns(false)
                        .badge("Popular")
                        .description("Scale your reach with up to 5 promotional offers and conversion analytics.")
                        .features(List.of(
                                "Up to 5 Active Promotional Offers",
                                "Featured Profile Placement Consideration",
                                "Promotional Click & CTR Analytics Tracking",
                                "Promotional Codes & Banner Highlights",
                                "Customer Redemption Monitoring",
                                "Priority Partner Email Support"
                        ))
                        .build(),
                SubscriptionPackageDto.builder()
                        .plan(SubscriptionPlan.PREMIUM)
                        .name("Enterprise Premium")
                        .priceMonthly(BigDecimal.valueOf(12000.00))
                        .priceAnnual(BigDecimal.valueOf(120000.00))
                        .maxPromotions(100)
                        .hasAnalytics(true)
                        .hasFeaturedPlacement(true)
                        .hasSponsoredCampaigns(true)
                        .badge("Enterprise")
                        .description("Maximum exposure, top directory placement, and sponsored sustainability campaigns.")
                        .features(List.of(
                                "Unlimited Active Promotions (Cap 100)",
                                "Guaranteed Top Directory & Interactive Map Placement",
                                "Full Real-Time Conversion & Redemption Analytics",
                                "Eligible to Sponsor Community Sustainability Campaigns",
                                "Co-Branded Impact Recognition on Campaign Cards",
                                "Dedicated Account Manager & VIP Support"
                        ))
                        .build()
        );
    }

    private Business getBusinessForUser(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + userEmail));
        return businessRepository.findByUserId(user.getId())
                .orElseThrow(() -> new BadRequestException("No business profile found for user: " + userEmail));
    }

    @Transactional(readOnly = true)
    public SubscriptionPlan getActivePlanForBusiness(UUID businessId) {
        return subscriptionRepository.findFirstByBusinessIdAndStatusOrderByCreatedAtDesc(businessId, SubscriptionStatus.ACTIVE)
                .filter(sub -> sub.getEndDate() == null || sub.getEndDate().isAfter(OffsetDateTime.now()))
                .map(BusinessSubscription::getPlan)
                .orElseGet(() -> {
                    Business b = businessRepository.findById(businessId).orElse(null);
                    if (b != null && Boolean.TRUE.equals(b.getIsFeatured()) &&
                            (b.getFeaturedUntil() == null || b.getFeaturedUntil().isAfter(OffsetDateTime.now()))) {
                        return SubscriptionPlan.PROMOTION;
                    }
                    return SubscriptionPlan.FREE;
                });
    }

    @Transactional(readOnly = true)
    public BusinessSubscription getActiveSubscriptionForBusiness(UUID businessId) {
        return subscriptionRepository.findFirstByBusinessIdAndStatusOrderByCreatedAtDesc(businessId, SubscriptionStatus.ACTIVE)
                .filter(sub -> sub.getEndDate() == null || sub.getEndDate().isAfter(OffsetDateTime.now()))
                .orElse(null);
    }

    @Transactional(readOnly = true)
    public SubscriptionResponseDto getCurrentSubscription(String userEmail) {
        Business business = getBusinessForUser(userEmail);

        // First check if there is an active subscription
        BusinessSubscription activeSub = getActiveSubscriptionForBusiness(business.getId());
        if (activeSub != null) {
            return SubscriptionResponseDto.fromEntity(activeSub);
        }

        // Check if there is a pending subscription request
        List<BusinessSubscription> all = subscriptionRepository.findByBusinessIdOrderByCreatedAtDesc(business.getId());
        BusinessSubscription pending = all.stream()
                .filter(s -> s.getStatus() == SubscriptionStatus.PENDING_ACTIVATION)
                .findFirst()
                .orElse(null);

        if (pending != null) {
            return SubscriptionResponseDto.fromEntity(pending);
        }

        // Return virtual Free tier
        return SubscriptionResponseDto.createDefaultFree(
                business.getId(),
                business.getBusinessName(),
                userEmail
        );
    }

    @Transactional
    public SubscriptionResponseDto subscribe(String userEmail, SubscribeRequestDto request) {
        Business business = getBusinessForUser(userEmail);

        if (request.getPlan() == null || request.getPlan() == SubscriptionPlan.FREE) {
            throw new BadRequestException("Free plan is already included by default. Please select Promotion or Premium.");
        }

        BillingCycle cycle = request.getBillingCycle() != null ? request.getBillingCycle() : BillingCycle.MONTHLY;

        BigDecimal price;
        if (request.getPlan() == SubscriptionPlan.PROMOTION) {
            price = cycle == BillingCycle.ANNUAL ? BigDecimal.valueOf(45000.00) : BigDecimal.valueOf(4500.00);
        } else {
            price = cycle == BillingCycle.ANNUAL ? BigDecimal.valueOf(120000.00) : BigDecimal.valueOf(12000.00);
        }

        OffsetDateTime now = OffsetDateTime.now();
        int days = cycle == BillingCycle.ANNUAL ? 365 : 30;

        String invoiceNumber = "INV-SUB-" + Year.now().getValue() + "-" +
                UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        BusinessSubscription subscription = BusinessSubscription.builder()
                .business(business)
                .plan(request.getPlan())
                .billingCycle(cycle)
                .status(SubscriptionStatus.PENDING_ACTIVATION)
                .startDate(now)
                .endDate(now.plusDays(days))
                .priceLkr(price)
                .invoiceNumber(invoiceNumber)
                .paymentMethod("MANUAL_BANK_TRANSFER")
                .paymentReference(request.getPaymentReference() != null ? request.getPaymentReference().trim() : null)
                .notes(request.getNotes() != null ? request.getNotes().trim() : null)
                .build();

        BusinessSubscription saved = subscriptionRepository.save(subscription);
        log.info("Business {} submitted subscription request for plan {} (cycle: {}, invoice: {})",
                business.getBusinessName(), request.getPlan(), cycle, invoiceNumber);

        return SubscriptionResponseDto.fromEntity(saved);
    }

    @Transactional(readOnly = true)
    public List<SubscriptionResponseDto> getSubscriptionHistory(String userEmail) {
        Business business = getBusinessForUser(userEmail);
        return subscriptionRepository.findByBusinessIdOrderByCreatedAtDesc(business.getId()).stream()
                .map(SubscriptionResponseDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<SubscriptionResponseDto> getAllSubscriptionsAdmin(SubscriptionStatus status, SubscriptionPlan plan) {
        List<BusinessSubscription> list;
        if (status != null && plan != null) {
            list = subscriptionRepository.findByStatusAndPlanOrderByCreatedAtDesc(status, plan);
        } else if (status != null) {
            list = subscriptionRepository.findByStatusOrderByCreatedAtDesc(status);
        } else if (plan != null) {
            list = subscriptionRepository.findByPlanOrderByCreatedAtDesc(plan);
        } else {
            list = subscriptionRepository.findAllByOrderByCreatedAtDesc();
        }

        return list.stream()
                .map(SubscriptionResponseDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public SubscriptionResponseDto adminActivateSubscription(String adminEmail, UUID subscriptionId, AdminSubscriptionActionDto action) {
        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Admin not found: " + adminEmail));

        BusinessSubscription sub = subscriptionRepository.findById(subscriptionId)
                .orElseThrow(() -> new ResourceNotFoundException("Subscription not found: " + subscriptionId));

        OffsetDateTime now = OffsetDateTime.now();
        int days = sub.getBillingCycle() == BillingCycle.ANNUAL ? 365 : 30;
        if (action != null && action.getExtensionDays() != null && action.getExtensionDays() > 0) {
            days = action.getExtensionDays();
        }

        sub.setStatus(SubscriptionStatus.ACTIVE);
        sub.setStartDate(now);
        sub.setEndDate(now.plusDays(days));
        sub.setActivatedAt(now);
        sub.setActivatedBy(admin);

        if (action != null && action.getNotes() != null && !action.getNotes().isBlank()) {
            sub.setNotes(action.getNotes().trim());
        }

        BusinessSubscription saved = subscriptionRepository.save(sub);

        // Update business featured status if Premium or Promotion
        Business business = sub.getBusiness();
        if (sub.getPlan() == SubscriptionPlan.PREMIUM || sub.getPlan() == SubscriptionPlan.PROMOTION) {
            business.setIsFeatured(true);
            business.setFeaturedUntil(saved.getEndDate());
            businessRepository.save(business);
        }

        log.info("Admin {} activated subscription {} for business {} (plan: {}, expires: {})",
                adminEmail, subscriptionId, business.getBusinessName(), sub.getPlan(), saved.getEndDate());

        return SubscriptionResponseDto.fromEntity(saved);
    }

    @Transactional
    public SubscriptionResponseDto adminRenewSubscription(String adminEmail, UUID subscriptionId, AdminSubscriptionActionDto action) {
        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Admin not found: " + adminEmail));

        BusinessSubscription sub = subscriptionRepository.findById(subscriptionId)
                .orElseThrow(() -> new ResourceNotFoundException("Subscription not found: " + subscriptionId));

        OffsetDateTime now = OffsetDateTime.now();
        int days = sub.getBillingCycle() == BillingCycle.ANNUAL ? 365 : 30;
        if (action != null && action.getExtensionDays() != null && action.getExtensionDays() > 0) {
            days = action.getExtensionDays();
        }

        OffsetDateTime currentEnd = sub.getEndDate();
        OffsetDateTime newEnd = (currentEnd != null && currentEnd.isAfter(now)) ? currentEnd.plusDays(days) : now.plusDays(days);

        sub.setEndDate(newEnd);
        sub.setStatus(SubscriptionStatus.ACTIVE);

        if (action != null && action.getNotes() != null && !action.getNotes().isBlank()) {
            sub.setNotes(action.getNotes().trim());
        }

        BusinessSubscription saved = subscriptionRepository.save(sub);

        Business business = sub.getBusiness();
        if (sub.getPlan() == SubscriptionPlan.PREMIUM || sub.getPlan() == SubscriptionPlan.PROMOTION) {
            business.setIsFeatured(true);
            business.setFeaturedUntil(newEnd);
            businessRepository.save(business);
        }

        log.info("Admin {} renewed subscription {} for business {} by {} days (new end: {})",
                adminEmail, subscriptionId, business.getBusinessName(), days, newEnd);

        return SubscriptionResponseDto.fromEntity(saved);
    }

    @Transactional
    public SubscriptionResponseDto adminCancelSubscription(String adminEmail, UUID subscriptionId, AdminSubscriptionActionDto action) {
        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Admin not found: " + adminEmail));

        BusinessSubscription sub = subscriptionRepository.findById(subscriptionId)
                .orElseThrow(() -> new ResourceNotFoundException("Subscription not found: " + subscriptionId));

        sub.setStatus(SubscriptionStatus.CANCELLED);
        if (action != null && action.getNotes() != null && !action.getNotes().isBlank()) {
            sub.setNotes(action.getNotes().trim());
        }

        BusinessSubscription saved = subscriptionRepository.save(sub);

        Business business = sub.getBusiness();
        business.setIsFeatured(false);
        business.setFeaturedUntil(null);
        businessRepository.save(business);

        log.info("Admin {} cancelled subscription {} for business {}",
                adminEmail, subscriptionId, business.getBusinessName());

        return SubscriptionResponseDto.fromEntity(saved);
    }
}


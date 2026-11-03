package com.ecoconnect.foodbridge.service;

import com.ecoconnect.foodbridge.dto.PromotionAnalyticsDto;
import com.ecoconnect.foodbridge.dto.PromotionRequestDto;
import com.ecoconnect.foodbridge.dto.PromotionResponseDto;
import com.ecoconnect.foodbridge.exception.BadRequestException;
import com.ecoconnect.foodbridge.exception.ResourceNotFoundException;
import com.ecoconnect.foodbridge.model.Business;
import com.ecoconnect.foodbridge.model.Promotion;
import com.ecoconnect.foodbridge.model.User;
import com.ecoconnect.foodbridge.model.enums.PaymentStatus;
import com.ecoconnect.foodbridge.model.enums.PromotionType;
import com.ecoconnect.foodbridge.repository.BusinessRepository;
import com.ecoconnect.foodbridge.repository.PromotionRepository;
import com.ecoconnect.foodbridge.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class PromotionService {

    private final PromotionRepository promotionRepository;
    private final BusinessRepository businessRepository;
    private final UserRepository userRepository;

    public PromotionService(PromotionRepository promotionRepository,
                            BusinessRepository businessRepository,
                            UserRepository userRepository) {
        this.promotionRepository = promotionRepository;
        this.businessRepository = businessRepository;
        this.userRepository = userRepository;
    }

    private Business getBusinessForUser(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + userEmail));
        return businessRepository.findByUserId(user.getId())
                .orElseThrow(() -> new BadRequestException("No business profile found for user: " + userEmail));
    }

    @Transactional
    public PromotionResponseDto createPromotion(String userEmail, PromotionRequestDto request) {
        Business business = getBusinessForUser(userEmail);

        if (request.getEndDate() != null && request.getStartDate() != null &&
                request.getEndDate().isBefore(request.getStartDate())) {
            throw new BadRequestException("End date cannot be earlier than start date");
        }

        BigDecimal cost = request.getCostLkr() != null ? request.getCostLkr() : BigDecimal.valueOf(3500.00);
        boolean isFeaturedPromo = request.getPromotionType() == PromotionType.FEATURED_PROFILE;

        Promotion promotion = Promotion.builder()
                .business(business)
                .title(request.getTitle().trim())
                .description(request.getDescription() != null ? request.getDescription().trim() : null)
                .promotionType(request.getPromotionType() != null ? request.getPromotionType() : PromotionType.PROMOTIONAL_OFFER)
                .bannerUrl(request.getBannerUrl())
                .targetAudience(request.getTargetAudience())
                .promoCode(request.getPromoCode() != null ? request.getPromoCode().trim().toUpperCase() : null)
                .discountDetails(request.getDiscountDetails() != null ? request.getDiscountDetails().trim() : null)
                .ctaLink(request.getCtaLink())
                .startDate(request.getStartDate() != null ? request.getStartDate() : OffsetDateTime.now())
                .endDate(request.getEndDate() != null ? request.getEndDate() : OffsetDateTime.now().plusDays(30))
                .costLkr(cost)
                .paymentStatus(PaymentStatus.PAID)
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .isFeatured(isFeaturedPromo)
                .viewsCount(0L)
                .clicksCount(0L)
                .redemptionsCount(0L)
                .build();

        if (isFeaturedPromo) {
            business.setIsFeatured(true);
            business.setFeaturedUntil(promotion.getEndDate());
            businessRepository.save(business);
        }

        Promotion saved = promotionRepository.save(promotion);
        return PromotionResponseDto.fromEntity(saved);
    }

    @Transactional
    public PromotionResponseDto updatePromotion(String userEmail, UUID promoId, PromotionRequestDto request) {
        Business business = getBusinessForUser(userEmail);
        Promotion promotion = promotionRepository.findById(promoId)
                .orElseThrow(() -> new ResourceNotFoundException("Promotion not found with id: " + promoId));

        if (!promotion.getBusiness().getId().equals(business.getId())) {
            throw new BadRequestException("You do not have permission to update this promotion");
        }

        if (request.getEndDate() != null && request.getStartDate() != null &&
                request.getEndDate().isBefore(request.getStartDate())) {
            throw new BadRequestException("End date cannot be earlier than start date");
        }

        promotion.setTitle(request.getTitle().trim());
        if (request.getDescription() != null) {
            promotion.setDescription(request.getDescription().trim());
        }
        if (request.getPromotionType() != null) {
            promotion.setPromotionType(request.getPromotionType());
        }
        if (request.getBannerUrl() != null) {
            promotion.setBannerUrl(request.getBannerUrl());
        }
        if (request.getTargetAudience() != null) {
            promotion.setTargetAudience(request.getTargetAudience());
        }
        if (request.getPromoCode() != null) {
            promotion.setPromoCode(request.getPromoCode().trim().toUpperCase());
        }
        if (request.getDiscountDetails() != null) {
            promotion.setDiscountDetails(request.getDiscountDetails().trim());
        }
        if (request.getCtaLink() != null) {
            promotion.setCtaLink(request.getCtaLink());
        }
        if (request.getStartDate() != null) {
            promotion.setStartDate(request.getStartDate());
        }
        if (request.getEndDate() != null) {
            promotion.setEndDate(request.getEndDate());
        }
        if (request.getIsActive() != null) {
            promotion.setIsActive(request.getIsActive());
        }

        Promotion saved = promotionRepository.save(promotion);
        return PromotionResponseDto.fromEntity(saved);
    }

    @Transactional(readOnly = true)
    public List<PromotionResponseDto> getMyPromotions(String userEmail) {
        Business business = getBusinessForUser(userEmail);
        return promotionRepository.findByBusinessIdOrderByCreatedAtDesc(business.getId()).stream()
                .map(PromotionResponseDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PromotionAnalyticsDto getMyPromotionAnalytics(String userEmail) {
        Business business = getBusinessForUser(userEmail);
        List<Promotion> promotions = promotionRepository.findByBusinessIdOrderByCreatedAtDesc(business.getId());

        long total = promotions.size();
        long active = promotions.stream().filter(p -> Boolean.TRUE.equals(p.getIsActive())).count();
        long totalViews = promotions.stream().mapToLong(p -> p.getViewsCount() != null ? p.getViewsCount() : 0L).sum();
        long totalClicks = promotions.stream().mapToLong(p -> p.getClicksCount() != null ? p.getClicksCount() : 0L).sum();
        long totalRedemptions = promotions.stream().mapToLong(p -> p.getRedemptionsCount() != null ? p.getRedemptionsCount() : 0L).sum();

        double avgCtr = totalViews > 0 ? Math.round(((double) totalClicks / totalViews * 100.0) * 100.0) / 100.0 : 0.0;
        double avgRedemptionRate = totalClicks > 0 ? Math.round(((double) totalRedemptions / totalClicks * 100.0) * 100.0) / 100.0 : 0.0;

        List<PromotionResponseDto> dtos = promotions.stream()
                .map(PromotionResponseDto::fromEntity)
                .collect(Collectors.toList());

        return PromotionAnalyticsDto.builder()
                .totalPromotions(total)
                .activePromotions(active)
                .totalViews(totalViews)
                .totalClicks(totalClicks)
                .totalRedemptions(totalRedemptions)
                .averageCtr(avgCtr)
                .averageRedemptionRate(avgRedemptionRate)
                .promotions(dtos)
                .build();
    }

    @Transactional
    public PromotionResponseDto togglePromotionActive(String userEmail, UUID promoId) {
        Business business = getBusinessForUser(userEmail);
        Promotion promotion = promotionRepository.findById(promoId)
                .orElseThrow(() -> new ResourceNotFoundException("Promotion not found with id: " + promoId));

        if (!promotion.getBusiness().getId().equals(business.getId())) {
            throw new BadRequestException("You do not have permission to modify this promotion");
        }

        promotion.setIsActive(!Boolean.TRUE.equals(promotion.getIsActive()));
        Promotion saved = promotionRepository.save(promotion);
        return PromotionResponseDto.fromEntity(saved);
    }

    @Transactional
    public void deletePromotion(String userEmail, UUID promoId) {
        Business business = getBusinessForUser(userEmail);
        Promotion promotion = promotionRepository.findById(promoId)
                .orElseThrow(() -> new ResourceNotFoundException("Promotion not found with id: " + promoId));

        if (!promotion.getBusiness().getId().equals(business.getId())) {
            throw new BadRequestException("You do not have permission to delete this promotion");
        }

        promotionRepository.delete(promotion);
    }

    @Transactional(readOnly = true)
    public List<PromotionResponseDto> getPublicActivePromotions() {
        return promotionRepository.findByIsActiveTrueOrderByIsFeaturedDescCreatedAtDesc().stream()
                .map(PromotionResponseDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<PromotionResponseDto> getPublicFeaturedPromotions() {
        return promotionRepository.findByIsActiveTrueAndIsFeaturedTrue().stream()
                .map(PromotionResponseDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PromotionResponseDto getPromotionById(UUID id) {
        Promotion promotion = promotionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Promotion not found: " + id));
        return PromotionResponseDto.fromEntity(promotion);
    }

    @Transactional
    public void recordView(UUID promoId) {
        promotionRepository.findById(promoId).ifPresent(p -> {
            p.setViewsCount(p.getViewsCount() != null ? p.getViewsCount() + 1 : 1L);
            promotionRepository.save(p);
        });
    }

    @Transactional
    public void recordClick(UUID promoId) {
        promotionRepository.findById(promoId).ifPresent(p -> {
            p.setClicksCount(p.getClicksCount() != null ? p.getClicksCount() + 1 : 1L);
            promotionRepository.save(p);
        });
    }

    @Transactional
    public void recordRedemption(UUID promoId) {
        promotionRepository.findById(promoId).ifPresent(p -> {
            p.setRedemptionsCount(p.getRedemptionsCount() != null ? p.getRedemptionsCount() + 1 : 1L);
            promotionRepository.save(p);
        });
    }

    @Transactional(readOnly = true)
    public List<PromotionResponseDto> getAllPromotionsForAdmin() {
        return promotionRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(PromotionResponseDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public PromotionResponseDto togglePromotionFeaturedByAdmin(UUID promoId, boolean featured) {
        Promotion promotion = promotionRepository.findById(promoId)
                .orElseThrow(() -> new ResourceNotFoundException("Promotion not found with id: " + promoId));
        promotion.setIsFeatured(featured);
        Promotion saved = promotionRepository.save(promotion);
        return PromotionResponseDto.fromEntity(saved);
    }
}


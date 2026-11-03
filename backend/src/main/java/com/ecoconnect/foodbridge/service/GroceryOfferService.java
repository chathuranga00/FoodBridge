package com.ecoconnect.foodbridge.service;

import com.ecoconnect.foodbridge.dto.*;
import com.ecoconnect.foodbridge.exception.BadRequestException;
import com.ecoconnect.foodbridge.exception.ResourceNotFoundException;
import com.ecoconnect.foodbridge.model.Business;
import com.ecoconnect.foodbridge.model.GroceryOffer;
import com.ecoconnect.foodbridge.model.GroceryReservation;
import com.ecoconnect.foodbridge.model.User;
import com.ecoconnect.foodbridge.model.enums.GroceryOfferStatus;
import com.ecoconnect.foodbridge.model.enums.GroceryReservationStatus;
import com.ecoconnect.foodbridge.model.enums.Role;
import com.ecoconnect.foodbridge.repository.BusinessRepository;
import com.ecoconnect.foodbridge.repository.GroceryOfferRepository;
import com.ecoconnect.foodbridge.repository.GroceryReservationRepository;
import com.ecoconnect.foodbridge.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.security.SecureRandom;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Service
public class GroceryOfferService {

    private static final Logger log = LoggerFactory.getLogger(GroceryOfferService.class);
    private static final String CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    private static final SecureRandom RANDOM = new SecureRandom();

    private final GroceryOfferRepository groceryOfferRepository;
    private final GroceryReservationRepository reservationRepository;
    private final UserRepository userRepository;
    private final BusinessRepository businessRepository;
    private final VerificationGuardService verificationGuardService;

    public GroceryOfferService(GroceryOfferRepository groceryOfferRepository,
                               GroceryReservationRepository reservationRepository,
                               UserRepository userRepository,
                               BusinessRepository businessRepository,
                               VerificationGuardService verificationGuardService) {
        this.groceryOfferRepository = groceryOfferRepository;
        this.reservationRepository = reservationRepository;
        this.userRepository = userRepository;
        this.businessRepository = businessRepository;
        this.verificationGuardService = verificationGuardService;
    }

    /**
     * Publishes a new discounted grocery offer.
     * Enforces:
     * - Rule 2: Shop account must be admin-VERIFIED.
     * - Best-before date distinct from use-by and not in the past.
     * - Mandatory food-safety confirmation.
     * - Valid pickup collection window.
     */
    @Transactional
    public GroceryOfferResponse createOffer(String userEmail, GroceryOfferCreateRequest request) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userEmail));

        // Rule 2 check: Must be admin-VERIFIED business (GROCERY or RESTAURANT)
        Business business = verificationGuardService.assertBusinessVerifiedForPublishing(user);

        // Required Food-Safety Confirmation
        if (!Boolean.TRUE.equals(request.getSafetyConfirmed())) {
            throw new BadRequestException("You must check and confirm food-safety compliance and best-before eligibility before publishing.");
        }

        OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);

        // Validation: collection window
        if (request.getPickupEnd().isBefore(request.getPickupStart())) {
            throw new BadRequestException("Collection end time cannot be before start time");
        }

        if (request.getPickupEnd().isBefore(now)) {
            throw new BadRequestException("Collection window has already expired; pickup end must be in the future.");
        }

        if (request.getBestBeforeDate().isBefore(now)) {
            throw new BadRequestException("Best-before date has already passed. Only eligible, unexpired products may be listed.");
        }

        if (request.getDiscountedPrice().compareTo(request.getOriginalPrice()) >= 0) {
            throw new BadRequestException("Discounted price must be lower than original price");
        }

        OffsetDateTime expiryDate = request.getExpiryDate() != null
                ? request.getExpiryDate()
                : request.getPickupEnd();

        GroceryOffer offer = GroceryOffer.builder()
                .business(business)
                .title(request.getTitle())
                .description(request.getDescription())
                .category(request.getCategory())
                .imageUrl(request.getImageUrl())
                .originalPrice(request.getOriginalPrice())
                .discountedPrice(request.getDiscountedPrice())
                .currency("LKR")
                .availableQuantity(request.getAvailableQuantity())
                .bestBeforeDate(request.getBestBeforeDate())
                .expiryDate(expiryDate)
                .pickupStart(request.getPickupStart())
                .pickupEnd(request.getPickupEnd())
                .pickupAddress(request.getPickupAddress() != null ? request.getPickupAddress() : business.getAddressLine1())
                .safetyConfirmed(true)
                .status(GroceryOfferStatus.AVAILABLE)
                .build();

        GroceryOffer saved = groceryOfferRepository.save(offer);
        return GroceryOfferResponse.fromEntity(saved);
    }

    /**
     * Browse active available grocery offers with optional category, district, and search filters.
     */
    @Transactional
    public List<GroceryOfferResponse> getPublicOffers(String category, String district, String search) {
        expirePastReservationsAndOffers();

        OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
        List<GroceryOffer> activeOffers = groceryOfferRepository.findActiveAvailableOffers(
                GroceryOfferStatus.AVAILABLE,
                now
        );

        return activeOffers.stream()
                .filter(offer -> {
                    if (category != null && !category.isBlank() && !category.equalsIgnoreCase("All")) {
                        if (offer.getCategory() == null || !offer.getCategory().equalsIgnoreCase(category.trim())) {
                            return false;
                        }
                    }
                    if (district != null && !district.isBlank() && !district.equalsIgnoreCase("All")) {
                        if (offer.getBusiness() == null || offer.getBusiness().getDistrict() == null ||
                                !offer.getBusiness().getDistrict().equalsIgnoreCase(district.trim())) {
                            return false;
                        }
                    }
                    if (search != null && !search.isBlank()) {
                        String q = search.trim().toLowerCase(Locale.ROOT);
                        boolean titleMatch = offer.getTitle() != null && offer.getTitle().toLowerCase(Locale.ROOT).contains(q);
                        boolean descMatch = offer.getDescription() != null && offer.getDescription().toLowerCase(Locale.ROOT).contains(q);
                        boolean busMatch = offer.getBusiness() != null && offer.getBusiness().getBusinessName() != null &&
                                offer.getBusiness().getBusinessName().toLowerCase(Locale.ROOT).contains(q);
                        if (!titleMatch && !descMatch && !busMatch) {
                            return false;
                        }
                    }
                    return true;
                })
                .map(GroceryOfferResponse::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public GroceryOfferResponse getOfferById(UUID id) {
        GroceryOffer offer = groceryOfferRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Grocery offer not found with ID: " + id));
        return GroceryOfferResponse.fromEntity(offer);
    }

    /**
     * Shop gets their own published offers.
     */
    @Transactional
    public List<GroceryOfferResponse> getMyBusinessOffers(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userEmail));

        expirePastReservationsAndOffers();

        return businessRepository.findByUserId(user.getId())
                .map(business -> groceryOfferRepository.findByBusinessIdOrderByCreatedAtDesc(business.getId())
                        .stream()
                        .map(GroceryOfferResponse::fromEntity)
                        .toList())
                .orElse(List.of());
    }

    /**
     * Reserves an offer for a customer.
     * Enforces atomic quantity decrement to prevent overselling.
     * Issues a unique redemption code.
     */
    @Transactional
    public GroceryReservationResponse reserveOffer(String userEmail, UUID offerId, GroceryReservationRequest request) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userEmail));

        GroceryOffer offer = groceryOfferRepository.findById(offerId)
                .orElseThrow(() -> new ResourceNotFoundException("Grocery offer not found with ID: " + offerId));

        OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);

        if (offer.getStatus() != GroceryOfferStatus.AVAILABLE) {
            throw new BadRequestException("Offer is no longer available (current status: " + offer.getStatus() + ")");
        }

        if (offer.getPickupEnd() != null && offer.getPickupEnd().isBefore(now)) {
            throw new BadRequestException("Offer collection window has already expired.");
        }

        int requestedQty = request.getQuantity() != null ? request.getQuantity() : 1;
        if (requestedQty <= 0) {
            throw new BadRequestException("Reservation quantity must be at least 1");
        }

        // Atomic quantity reduction preventing overselling race conditions
        int updatedRows = groceryOfferRepository.decrementQuantityAtomic(offerId, requestedQty);
        if (updatedRows == 0) {
            throw new BadRequestException("Unable to reserve offer. Requested quantity (" + requestedQty +
                    ") exceeds available stock or offer is sold out.");
        }

        // Re-read or refresh updated offer
        GroceryOffer refreshedOffer = groceryOfferRepository.findById(offerId).orElse(offer);

        String redemptionCode = generateUniqueRedemptionCode();
        BigDecimal unitPrice = refreshedOffer.getDiscountedPrice();
        BigDecimal totalPrice = unitPrice.multiply(BigDecimal.valueOf(requestedQty));

        OffsetDateTime expiresAt = refreshedOffer.getPickupEnd() != null
                ? refreshedOffer.getPickupEnd()
                : refreshedOffer.getExpiryDate();
        if (expiresAt == null || expiresAt.isBefore(now)) {
            expiresAt = now.plusHours(24);
        }

        GroceryReservation reservation = GroceryReservation.builder()
                .offer(refreshedOffer)
                .user(user)
                .redemptionCode(redemptionCode)
                .quantity(requestedQty)
                .unitPrice(unitPrice)
                .totalPrice(totalPrice)
                .status(GroceryReservationStatus.RESERVED)
                .reservedAt(now)
                .expiresAt(expiresAt)
                .build();

        GroceryReservation saved = reservationRepository.save(reservation);
        log.info("Reserved {} item(s) for offer {} by user {}. Redemption Code: {}",
                requestedQty, offerId, userEmail, redemptionCode);

        return GroceryReservationResponse.fromEntity(saved);
    }

    /**
     * Cancels an unredeemed reservation and atomically returns the quantity back to the offer.
     */
    @Transactional
    public GroceryReservationResponse cancelReservation(String userEmail, UUID reservationId) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userEmail));

        GroceryReservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation not found with ID: " + reservationId));

        boolean isCustomer = reservation.getUser().getId().equals(user.getId());
        boolean isShopOwner = reservation.getOffer().getBusiness() != null &&
                reservation.getOffer().getBusiness().getUser().getId().equals(user.getId());
        boolean isAdmin = user.getRole() == Role.ADMIN;

        if (!isCustomer && !isShopOwner && !isAdmin) {
            throw new AccessDeniedException("You are not authorized to cancel this reservation");
        }

        if (reservation.getStatus() != GroceryReservationStatus.RESERVED) {
            throw new BadRequestException("Reservation cannot be cancelled because it is in status: " + reservation.getStatus());
        }

        // Atomically return stock to offer
        groceryOfferRepository.incrementQuantityAtomic(reservation.getOffer().getId(), reservation.getQuantity());

        OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
        reservation.setStatus(GroceryReservationStatus.CANCELLED);
        reservation.setCancelledAt(now);

        GroceryReservation saved = reservationRepository.save(reservation);
        log.info("Cancelled reservation {} (code: {}). Released {} item(s) back to stock.",
                reservationId, reservation.getRedemptionCode(), reservation.getQuantity());

        return GroceryReservationResponse.fromEntity(saved);
    }

    /**
     * Verify details of a redemption code without completing redemption.
     */
    @Transactional(readOnly = true)
    public GroceryReservationResponse verifyRedemptionCode(String businessUserEmail, String rawCode) {
        User user = userRepository.findByEmail(businessUserEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + businessUserEmail));

        Business business = verificationGuardService.assertBusinessVerifiedForPublishing(user);

        String cleanCode = normalizeCode(rawCode);
        GroceryReservation reservation = reservationRepository.findByRedemptionCode(cleanCode)
                .orElseThrow(() -> new ResourceNotFoundException("Invalid redemption code: " + cleanCode));

        if (!reservation.getOffer().getBusiness().getId().equals(business.getId())) {
            throw new AccessDeniedException("This redemption code does not belong to your store.");
        }

        return GroceryReservationResponse.fromEntity(reservation);
    }

    /**
     * Shop enters or scans the redemption code to confirm redemption and verify customer handoff.
     */
    @Transactional
    public GroceryReservationResponse redeemReservation(String businessUserEmail, String rawCode) {
        User user = userRepository.findByEmail(businessUserEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + businessUserEmail));

        Business business = verificationGuardService.assertBusinessVerifiedForPublishing(user);

        String cleanCode = normalizeCode(rawCode);
        GroceryReservation reservation = reservationRepository.findByRedemptionCode(cleanCode)
                .orElseThrow(() -> new ResourceNotFoundException("Invalid redemption code: " + cleanCode));

        if (!reservation.getOffer().getBusiness().getId().equals(business.getId())) {
            throw new AccessDeniedException("This redemption code belongs to a different store.");
        }

        if (reservation.getStatus() == GroceryReservationStatus.REDEEMED) {
            throw new BadRequestException("This code was already redeemed at " + reservation.getRedeemedAt());
        }

        if (reservation.getStatus() == GroceryReservationStatus.CANCELLED) {
            throw new BadRequestException("This reservation was cancelled.");
        }

        OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
        if (reservation.getStatus() == GroceryReservationStatus.EXPIRED ||
                (reservation.getExpiresAt() != null && reservation.getExpiresAt().isBefore(now))) {
            if (reservation.getStatus() == GroceryReservationStatus.RESERVED) {
                reservation.setStatus(GroceryReservationStatus.EXPIRED);
                groceryOfferRepository.incrementQuantityAtomic(reservation.getOffer().getId(), reservation.getQuantity());
                reservationRepository.save(reservation);
            }
            throw new BadRequestException("This reservation code has expired and stock has been released.");
        }

        reservation.setStatus(GroceryReservationStatus.REDEEMED);
        reservation.setRedeemedAt(now);

        GroceryReservation saved = reservationRepository.save(reservation);
        log.info("Redeemed code {} for offer {} by business {}",
                cleanCode, reservation.getOffer().getId(), business.getBusinessName());

        return GroceryReservationResponse.fromEntity(saved);
    }

    /**
     * Customer views their own reservations / coupons.
     */
    @Transactional
    public List<GroceryReservationResponse> getMyReservations(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userEmail));

        expirePastReservationsAndOffers();

        return reservationRepository.findByUserIdOrderByReservedAtDesc(user.getId())
                .stream()
                .map(GroceryReservationResponse::fromEntity)
                .toList();
    }

    /**
     * Business views all reservations and redemptions for their offers.
     */
    @Transactional
    public List<GroceryReservationResponse> getBusinessRedemptions(String businessUserEmail) {
        User user = userRepository.findByEmail(businessUserEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + businessUserEmail));

        expirePastReservationsAndOffers();

        return businessRepository.findByUserId(user.getId())
                .map(business -> reservationRepository.findByOfferBusinessIdOrderByReservedAtDesc(business.getId())
                        .stream()
                        .map(GroceryReservationResponse::fromEntity)
                        .toList())
                .orElse(List.of());
    }

    /**
     * Auto-expires unredeemed reservations after their collection period, releasing reserved stock.
     * Also auto-expires offers whose collection window has closed.
     */
    @Scheduled(fixedRate = 60000)
    @Transactional
    public int expirePastReservationsAndOffers() {
        OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);

        // 1. Expire unredeemed reservations and release stock back
        List<GroceryReservation> expiredReservations = reservationRepository.findByStatusAndExpiresAtBefore(
                GroceryReservationStatus.RESERVED,
                now
        );

        int resCount = 0;
        for (GroceryReservation res : expiredReservations) {
            res.setStatus(GroceryReservationStatus.EXPIRED);
            reservationRepository.save(res);
            groceryOfferRepository.incrementQuantityAtomic(res.getOffer().getId(), res.getQuantity());
            resCount++;
        }

        if (resCount > 0) {
            log.info("Auto-expired {} unredeemed grocery reservation(s) and released stock.", resCount);
        }

        // 2. Expire available offers past their pickupEnd or expiryDate
        List<GroceryOffer> expiredOffers = groceryOfferRepository.findExpiredAvailableOffers(now);
        int offerCount = 0;
        for (GroceryOffer offer : expiredOffers) {
            offer.setStatus(GroceryOfferStatus.EXPIRED);
            groceryOfferRepository.save(offer);
            offerCount++;
        }

        if (offerCount > 0) {
            log.info("Auto-expired {} grocery offer(s) whose collection window ended.", offerCount);
        }

        return resCount + offerCount;
    }

    private String generateUniqueRedemptionCode() {
        for (int attempts = 0; attempts < 10; attempts++) {
            StringBuilder sb = new StringBuilder("GROC-");
            for (int i = 0; i < 8; i++) {
                int index = RANDOM.nextInt(CODE_ALPHABET.length());
                sb.append(CODE_ALPHABET.charAt(index));
            }
            String code = sb.toString();
            if (reservationRepository.findByRedemptionCode(code).isEmpty()) {
                return code;
            }
        }
        return "GROC-" + UUID.randomUUID().toString().replace("-", "").substring(0, 8).toUpperCase(Locale.ROOT);
    }

    private String normalizeCode(String code) {
        if (code == null || code.isBlank()) {
            throw new BadRequestException("Redemption code cannot be empty");
        }
        return code.trim().toUpperCase(Locale.ROOT);
    }
}

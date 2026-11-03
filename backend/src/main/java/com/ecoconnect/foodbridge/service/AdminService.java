package com.ecoconnect.foodbridge.service;

import com.ecoconnect.foodbridge.dto.*;
import com.ecoconnect.foodbridge.exception.BadRequestException;
import com.ecoconnect.foodbridge.exception.ResourceNotFoundException;
import com.ecoconnect.foodbridge.model.*;
import com.ecoconnect.foodbridge.model.enums.*;
import com.ecoconnect.foodbridge.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AdminService {

    private final UserRepository userRepository;
    private final BusinessRepository businessRepository;
    private final CharityRepository charityRepository;
    private final AnimalOrganizationRepository animalOrganizationRepository;
    private final FoodListingRepository foodListingRepository;
    private final GroceryOfferRepository groceryOfferRepository;
    private final CampaignRepository campaignRepository;
    private final PartnershipRepository partnershipRepository;
    private final CampaignContributionRepository campaignContributionRepository;
    private final BusinessSubscriptionRepository businessSubscriptionRepository;
    private final ImpactRecordRepository impactRecordRepository;
    private final AuditLogRepository auditLogRepository;
    private final PlatformSettingsRepository platformSettingsRepository;
    private final AuditLogService auditLogService;

    public AdminService(UserRepository userRepository,
                        BusinessRepository businessRepository,
                        CharityRepository charityRepository,
                        AnimalOrganizationRepository animalOrganizationRepository,
                        FoodListingRepository foodListingRepository,
                        GroceryOfferRepository groceryOfferRepository,
                        CampaignRepository campaignRepository,
                        PartnershipRepository partnershipRepository,
                        CampaignContributionRepository campaignContributionRepository,
                        BusinessSubscriptionRepository businessSubscriptionRepository,
                        ImpactRecordRepository impactRecordRepository,
                        AuditLogRepository auditLogRepository,
                        PlatformSettingsRepository platformSettingsRepository,
                        AuditLogService auditLogService) {
        this.userRepository = userRepository;
        this.businessRepository = businessRepository;
        this.charityRepository = charityRepository;
        this.animalOrganizationRepository = animalOrganizationRepository;
        this.foodListingRepository = foodListingRepository;
        this.groceryOfferRepository = groceryOfferRepository;
        this.campaignRepository = campaignRepository;
        this.partnershipRepository = partnershipRepository;
        this.campaignContributionRepository = campaignContributionRepository;
        this.businessSubscriptionRepository = businessSubscriptionRepository;
        this.impactRecordRepository = impactRecordRepository;
        this.auditLogRepository = auditLogRepository;
        this.platformSettingsRepository = platformSettingsRepository;
        this.auditLogService = auditLogService;
    }

    // =========================================================================
    // 1. PLATFORM OVERVIEW & METRICS
    // =========================================================================

    @Transactional(readOnly = true)
    public PlatformOverviewDto getPlatformOverview() {
        long totalUsers = userRepository.count();
        long activeUsers = userRepository.findByIsActiveTrue().size();
        long suspendedUsers = Math.max(0, totalUsers - activeUsers);

        Map<String, Long> usersByRole = new LinkedHashMap<>();
        for (Role role : Role.values()) {
            usersByRole.put(role.name(), (long) userRepository.findByRole(role).size());
        }

        long totalBusinesses = businessRepository.count();
        long verifiedBusinesses = businessRepository.findByVerificationStatus(VerificationStatus.VERIFIED).size();
        long pendingBusinessVerifs = businessRepository.findByVerificationStatus(VerificationStatus.PENDING).size();

        long totalCharities = charityRepository.count();
        long verifiedCharities = charityRepository.findByVerificationStatus(VerificationStatus.VERIFIED).size();
        long pendingCharityVerifs = charityRepository.findByVerificationStatus(VerificationStatus.PENDING).size();

        long totalAnimalOrgs = animalOrganizationRepository.count();
        long verifiedAnimalOrgs = animalOrganizationRepository.findByVerificationStatus(VerificationStatus.VERIFIED).size();
        long pendingAnimalVerifs = animalOrganizationRepository.findByVerificationStatus(VerificationStatus.PENDING).size();

        long pendingVerifications = pendingBusinessVerifs + pendingCharityVerifs + pendingAnimalVerifs;

        long activeFoodListings = foodListingRepository.findByStatus(FoodListingStatus.AVAILABLE).size();
        long totalFoodListings = foodListingRepository.count();

        long activeGroceryOffers = groceryOfferRepository.findByStatus(GroceryOfferStatus.AVAILABLE).size();
        long totalGroceryOffers = groceryOfferRepository.count();

        long totalCampaigns = campaignRepository.count();
        long pendingCampaigns = campaignRepository.countByStatus(CampaignStatus.PENDING_APPROVAL);
        long activeCampaigns = campaignRepository.countByStatus(CampaignStatus.ACTIVE);

        long totalPartnerships = partnershipRepository.count();
        long activePartnerships = partnershipRepository.findAll().stream()
                .filter(p -> p.getStatus() == PartnershipStatus.AGREED ||
                             p.getStatus() == PartnershipStatus.DELIVERED ||
                             p.getStatus() == PartnershipStatus.PROPOSED ||
                             p.getStatus() == PartnershipStatus.COUNTERED)
                .count();
        long completedPartnerships = partnershipRepository.findByStatus(PartnershipStatus.COMPLETED).size();

        long totalContributions = campaignContributionRepository.count();
        BigDecimal monetaryContributionsLkr = campaignContributionRepository.sumTotalConfirmedMonetaryAmount();
        BigDecimal foodContributionsKg = campaignContributionRepository.sumTotalConfirmedFoodKg();

        long totalSubscriptions = businessSubscriptionRepository.count();
        List<BusinessSubscription> activeSubs = businessSubscriptionRepository.findByStatusOrderByCreatedAtDesc(SubscriptionStatus.ACTIVE);
        long activeSubscriptions = activeSubs.size();

        BigDecimal platformRevenueLkr = activeSubs.stream()
                .map(sub -> sub.getPriceLkr() != null ? sub.getPriceLkr() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalKgFoodRescued = impactRecordRepository.sumTotalFoodWeightKg();
        Long peopleSupported = impactRecordRepository.sumTotalPeopleFed();
        Long animalsSupported = impactRecordRepository.sumTotalAnimalsFed();

        List<AuditLogResponseDto> recentLogs = getAuditLogs(null, null, null, 5);

        return PlatformOverviewDto.builder()
                .totalUsers(totalUsers)
                .activeUsers(activeUsers)
                .suspendedUsers(suspendedUsers)
                .usersByRole(usersByRole)
                .totalBusinesses(totalBusinesses)
                .verifiedBusinesses(verifiedBusinesses)
                .totalCharities(totalCharities)
                .verifiedCharities(verifiedCharities)
                .totalAnimalOrgs(totalAnimalOrgs)
                .verifiedAnimalOrgs(verifiedAnimalOrgs)
                .pendingVerifications(pendingVerifications)
                .activeFoodListings(activeFoodListings)
                .totalFoodListings(totalFoodListings)
                .activeGroceryOffers(activeGroceryOffers)
                .totalGroceryOffers(totalGroceryOffers)
                .totalCampaigns(totalCampaigns)
                .pendingCampaigns(pendingCampaigns)
                .activeCampaigns(activeCampaigns)
                .totalPartnerships(totalPartnerships)
                .activePartnerships(activePartnerships)
                .completedPartnerships(completedPartnerships)
                .totalContributions(totalContributions)
                .monetaryContributionsLkr(monetaryContributionsLkr != null ? monetaryContributionsLkr : BigDecimal.ZERO)
                .foodContributionsKg(foodContributionsKg != null ? foodContributionsKg : BigDecimal.ZERO)
                .totalSubscriptions(totalSubscriptions)
                .activeSubscriptions(activeSubscriptions)
                .platformRevenueLkr(platformRevenueLkr)
                .totalKgFoodRescued(totalKgFoodRescued != null ? totalKgFoodRescued : BigDecimal.ZERO)
                .peopleSupported(peopleSupported != null ? peopleSupported : 0L)
                .animalsSupported(animalsSupported != null ? animalsSupported : 0L)
                .recentAuditLogs(recentLogs)
                .build();
    }

    // =========================================================================
    // 2. USER MANAGEMENT
    // =========================================================================

    @Transactional(readOnly = true)
    public List<AdminUserDto> searchUsers(String query, Role role, String status) {
        List<User> allUsers = userRepository.findAll();

        return allUsers.stream()
                .filter(u -> {
                    if (role != null && u.getRole() != role) return false;
                    if ("ACTIVE".equalsIgnoreCase(status) && (u.getIsActive() == null || !u.getIsActive())) return false;
                    if ("SUSPENDED".equalsIgnoreCase(status) && (u.getIsActive() != null && u.getIsActive())) return false;

                    if (query != null && !query.trim().isEmpty()) {
                        String q = query.trim().toLowerCase();
                        boolean matchEmail = u.getEmail() != null && u.getEmail().toLowerCase().contains(q);
                        boolean matchName = u.getFullName() != null && u.getFullName().toLowerCase().contains(q);
                        boolean matchPhone = u.getPhoneNumber() != null && u.getPhoneNumber().contains(q);
                        if (!matchEmail && !matchName && !matchPhone) return false;
                    }
                    return true;
                })
                .sorted(Comparator.comparing(User::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .map(this::mapUserToAdminDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public AdminUserDto getUserDetails(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));
        return mapUserToAdminDto(user);
    }

    @Transactional
    public AdminUserDto updateUserStatus(String adminEmail, UUID userId, boolean isActive, String reason, String ipAddress) {
        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Admin user not found"));

        User targetUser = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));

        if (admin.getId().equals(targetUser.getId()) && !isActive) {
            throw new BadRequestException("Administrator cannot suspend their own account.");
        }

        targetUser.setIsActive(isActive);
        User saved = userRepository.save(targetUser);

        String action = isActive ? "USER_REACTIVATED" : "USER_SUSPENDED";
        String details = String.format("Admin %s updated status of user %s (%s) to %s. Reason: %s",
                admin.getEmail(), targetUser.getFullName(), targetUser.getEmail(),
                isActive ? "ACTIVE" : "SUSPENDED", reason != null ? reason : "Administrative review");

        auditLogService.record(admin, action, "USER", targetUser.getId(), details, ipAddress);

        return mapUserToAdminDto(saved);
    }

    @Transactional
    public AdminUserDto updateUserRole(String adminEmail, UUID userId, Role newRole, String reason, String ipAddress) {
        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Admin user not found"));

        User targetUser = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));

        Role oldRole = targetUser.getRole();
        targetUser.setRole(newRole);
        User saved = userRepository.save(targetUser);

        String details = String.format("Admin %s changed role of user %s (%s) from %s to %s. Reason: %s",
                admin.getEmail(), targetUser.getFullName(), targetUser.getEmail(), oldRole, newRole,
                reason != null ? reason : "Administrative role modification");

        auditLogService.record(admin, "USER_ROLE_CHANGED", "USER", targetUser.getId(), details, ipAddress);

        return mapUserToAdminDto(saved);
    }

    private AdminUserDto mapUserToAdminDto(User u) {
        String orgName = null;
        String orgType = "NONE";
        UUID orgId = null;
        String verificationStatus = "UNVERIFIED";

        Optional<Business> business = businessRepository.findByUserId(u.getId());
        if (business.isPresent()) {
            orgName = business.get().getBusinessName();
            orgType = "BUSINESS";
            orgId = business.get().getId();
            verificationStatus = business.get().getVerificationStatus() != null
                    ? business.get().getVerificationStatus().name() : "UNVERIFIED";
        } else {
            Optional<Charity> charity = charityRepository.findByUserId(u.getId());
            if (charity.isPresent()) {
                orgName = charity.get().getCharityName();
                orgType = "CHARITY";
                orgId = charity.get().getId();
                verificationStatus = charity.get().getVerificationStatus() != null
                        ? charity.get().getVerificationStatus().name() : "UNVERIFIED";
            } else {
                Optional<AnimalOrganization> animalOrg = animalOrganizationRepository.findByUserId(u.getId());
                if (animalOrg.isPresent()) {
                    orgName = animalOrg.get().getOrganizationName();
                    orgType = "ANIMAL_ORG";
                    orgId = animalOrg.get().getId();
                    verificationStatus = animalOrg.get().getVerificationStatus() != null
                            ? animalOrg.get().getVerificationStatus().name() : "UNVERIFIED";
                }
            }
        }

        return AdminUserDto.builder()
                .id(u.getId())
                .email(u.getEmail())
                .fullName(u.getFullName())
                .phoneNumber(u.getPhoneNumber())
                .role(u.getRole())
                .isActive(u.getIsActive() != null ? u.getIsActive() : true)
                .createdAt(u.getCreatedAt())
                .organizationName(orgName)
                .organizationType(orgType)
                .organizationId(orgId)
                .verificationStatus(verificationStatus)
                .build();
    }

    // =========================================================================
    // 3. LISTING MANAGEMENT (FOOD RESCUE & GROCERY OFFERS)
    // =========================================================================

    @Transactional(readOnly = true)
    public List<AdminListingDto> getAllListings(String type, String status, String search) {
        List<AdminListingDto> results = new ArrayList<>();

        boolean includeFood = type == null || "ALL".equalsIgnoreCase(type) || "FOOD_RESCUE".equalsIgnoreCase(type);
        boolean includeGrocery = type == null || "ALL".equalsIgnoreCase(type) || "GROCERY_OFFER".equalsIgnoreCase(type);

        if (includeFood) {
            List<FoodListing> foodListings = foodListingRepository.findAll();
            for (FoodListing f : foodListings) {
                if (status != null && !status.equalsIgnoreCase("ALL") && !f.getStatus().name().equalsIgnoreCase(status)) {
                    continue;
                }
                if (search != null && !search.trim().isEmpty()) {
                    String q = search.trim().toLowerCase();
                    boolean matchTitle = f.getTitle() != null && f.getTitle().toLowerCase().contains(q);
                    boolean matchBusiness = f.getBusiness() != null && f.getBusiness().getBusinessName().toLowerCase().contains(q);
                    if (!matchTitle && !matchBusiness) continue;
                }

                results.add(AdminListingDto.builder()
                        .id(f.getId())
                        .type("FOOD_RESCUE")
                        .title(f.getTitle())
                        .businessId(f.getBusiness() != null ? f.getBusiness().getId() : null)
                        .businessName(f.getBusiness() != null ? f.getBusiness().getBusinessName() : "Unknown")
                        .businessType(f.getBusiness() != null && f.getBusiness().getBusinessType() != null ? f.getBusiness().getBusinessType().name() : "RESTAURANT")
                        .category(f.getFoodCategory())
                        .quantity(f.getQuantity())
                        .unit(f.getUnit())
                        .price(BigDecimal.ZERO)
                        .originalPrice(BigDecimal.ZERO)
                        .status(f.getStatus().name())
                        .suitabilityType(f.getSuitabilityType() != null ? f.getSuitabilityType().name() : null)
                        .animalSuitable(f.getAnimalSuitable())
                        .expiryDate(f.getExpiryDate())
                        .createdAt(f.getCreatedAt())
                        .build());
            }
        }

        if (includeGrocery) {
            List<GroceryOffer> groceryOffers = groceryOfferRepository.findAll();
            for (GroceryOffer g : groceryOffers) {
                if (status != null && !status.equalsIgnoreCase("ALL") && !g.getStatus().name().equalsIgnoreCase(status)) {
                    continue;
                }
                if (search != null && !search.trim().isEmpty()) {
                    String q = search.trim().toLowerCase();
                    boolean matchTitle = g.getTitle() != null && g.getTitle().toLowerCase().contains(q);
                    boolean matchBusiness = g.getBusiness() != null && g.getBusiness().getBusinessName().toLowerCase().contains(q);
                    if (!matchTitle && !matchBusiness) continue;
                }

                results.add(AdminListingDto.builder()
                        .id(g.getId())
                        .type("GROCERY_OFFER")
                        .title(g.getTitle())
                        .businessId(g.getBusiness() != null ? g.getBusiness().getId() : null)
                        .businessName(g.getBusiness() != null ? g.getBusiness().getBusinessName() : "Unknown")
                        .businessType(g.getBusiness() != null && g.getBusiness().getBusinessType() != null ? g.getBusiness().getBusinessType().name() : "GROCERY")
                        .category(g.getCategory())
                        .quantity(g.getAvailableQuantity() != null ? BigDecimal.valueOf(g.getAvailableQuantity()) : BigDecimal.ZERO)
                        .unit("items")
                        .price(g.getDiscountedPrice())
                        .originalPrice(g.getOriginalPrice())
                        .status(g.getStatus().name())
                        .suitabilityType("HUMAN_AND_ANIMAL")
                        .animalSuitable(true)
                        .expiryDate(g.getExpiryDate())
                        .createdAt(g.getCreatedAt())
                        .build());
            }
        }

        results.sort(Comparator.comparing(AdminListingDto::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())));
        return results;
    }

    @Transactional
    public void updateListingStatus(String adminEmail, String type, UUID id, String newStatus, String reason, String ipAddress) {
        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Admin user not found"));

        if ("FOOD_RESCUE".equalsIgnoreCase(type)) {
            FoodListing listing = foodListingRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Food listing not found with ID: " + id));
            FoodListingStatus oldStatus = listing.getStatus();
            listing.setStatus(FoodListingStatus.valueOf(newStatus.toUpperCase()));
            foodListingRepository.save(listing);

            String details = String.format("Admin %s updated FoodListing '%s' status from %s to %s. Reason: %s",
                    admin.getEmail(), listing.getTitle(), oldStatus, newStatus, reason);
            auditLogService.record(admin, "FOOD_LISTING_STATUS_OVERRIDE", "FOOD_LISTING", id, details, ipAddress);

        } else if ("GROCERY_OFFER".equalsIgnoreCase(type)) {
            GroceryOffer offer = groceryOfferRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Grocery offer not found with ID: " + id));
            GroceryOfferStatus oldStatus = offer.getStatus();
            offer.setStatus(GroceryOfferStatus.valueOf(newStatus.toUpperCase()));
            groceryOfferRepository.save(offer);

            String details = String.format("Admin %s updated GroceryOffer '%s' status from %s to %s. Reason: %s",
                    admin.getEmail(), offer.getTitle(), oldStatus, newStatus, reason);
            auditLogService.record(admin, "GROCERY_OFFER_STATUS_OVERRIDE", "GROCERY_OFFER", id, details, ipAddress);

        } else {
            throw new BadRequestException("Invalid listing type: " + type + ". Must be FOOD_RESCUE or GROCERY_OFFER.");
        }
    }

    @Transactional
    public void deleteListing(String adminEmail, String type, UUID id, String reason, String ipAddress) {
        updateListingStatus(adminEmail, type, id, "CANCELLED", reason != null ? reason : "Removed by administrator", ipAddress);
    }

    // =========================================================================
    // 4. CAMPAIGN MODERATION & MANAGEMENT
    // =========================================================================

    @Transactional(readOnly = true)
    public List<CampaignResponse> getAllCampaigns(String status, String search) {
        List<Campaign> campaigns = campaignRepository.findAll();

        return campaigns.stream()
                .filter(c -> {
                    if (status != null && !status.equalsIgnoreCase("ALL") && !c.getStatus().name().equalsIgnoreCase(status)) {
                        return false;
                    }
                    if (search != null && !search.trim().isEmpty()) {
                        String q = search.trim().toLowerCase();
                        boolean matchTitle = c.getTitle() != null && c.getTitle().toLowerCase().contains(q);
                        boolean matchDistrict = c.getDistrict() != null && c.getDistrict().toLowerCase().contains(q);
                        if (!matchTitle && !matchDistrict) return false;
                    }
                    return true;
                })
                .sorted(Comparator.comparing(Campaign::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .map(CampaignResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public CampaignResponse toggleCampaignFeatured(String adminEmail, UUID id, boolean featured, String ipAddress) {
        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Admin user not found"));

        Campaign campaign = campaignRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Campaign not found with ID: " + id));

        campaign.setIsFeatured(featured);
        Campaign saved = campaignRepository.save(campaign);

        String details = String.format("Admin %s toggled featured status of campaign '%s' to %s",
                admin.getEmail(), campaign.getTitle(), featured);
        auditLogService.record(admin, "CAMPAIGN_FEATURED_TOGGLED", "CAMPAIGN", id, details, ipAddress);

        return CampaignResponse.fromEntity(saved);
    }

    @Transactional
    public CampaignResponse updateCampaignStatus(String adminEmail, UUID id, CampaignStatus status, String reason, String ipAddress) {
        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Admin user not found"));

        Campaign campaign = campaignRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Campaign not found with ID: " + id));

        CampaignStatus oldStatus = campaign.getStatus();
        campaign.setStatus(status);
        Campaign saved = campaignRepository.save(campaign);

        String details = String.format("Admin %s updated campaign '%s' status from %s to %s. Reason: %s",
                admin.getEmail(), campaign.getTitle(), oldStatus, status, reason);
        auditLogService.record(admin, "CAMPAIGN_STATUS_CHANGED", "CAMPAIGN", id, details, ipAddress);

        return CampaignResponse.fromEntity(saved);
    }

    // =========================================================================
    // 5. CONTRIBUTION MONITORING
    // =========================================================================

    @Transactional(readOnly = true)
    public List<AdminContributionDto> getAllContributions(ContributionStatus status, ContributionType type, String search) {
        List<CampaignContribution> contributions = campaignContributionRepository.findAll();

        return contributions.stream()
                .filter(c -> {
                    if (status != null && c.getStatus() != status) return false;
                    if (type != null && c.getContributionType() != type) return false;
                    if (search != null && !search.trim().isEmpty()) {
                        String q = search.trim().toLowerCase();
                        boolean matchDonor = c.getContributorName() != null && c.getContributorName().toLowerCase().contains(q);
                        boolean matchCampaign = c.getCampaign() != null && c.getCampaign().getTitle().toLowerCase().contains(q);
                        boolean matchNotes = c.getItemDescription() != null && c.getItemDescription().toLowerCase().contains(q);
                        if (!matchDonor && !matchCampaign && !matchNotes) return false;
                    }
                    return true;
                })
                .sorted(Comparator.comparing(CampaignContribution::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .map(this::mapToAdminContributionDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getContributionSummary() {
        long totalCount = campaignContributionRepository.count();
        BigDecimal totalMonetary = campaignContributionRepository.sumTotalConfirmedMonetaryAmount();
        BigDecimal totalFoodKg = campaignContributionRepository.sumTotalConfirmedFoodKg();
        long confirmedCount = campaignContributionRepository.findByStatus(ContributionStatus.CONFIRMED).size();
        long pledgedCount = campaignContributionRepository.findByStatus(ContributionStatus.PLEDGED).size();

        Map<String, Object> summary = new HashMap<>();
        summary.put("totalContributions", totalCount);
        summary.put("confirmedContributions", confirmedCount);
        summary.put("pledgedContributions", pledgedCount);
        summary.put("totalMonetaryAmountLkr", totalMonetary != null ? totalMonetary : BigDecimal.ZERO);
        summary.put("totalFoodAmountKg", totalFoodKg != null ? totalFoodKg : BigDecimal.ZERO);
        return summary;
    }

    private AdminContributionDto mapToAdminContributionDto(CampaignContribution c) {
        String charityName = "Community Campaign";
        if (c.getCampaign() != null) {
            if (c.getCampaign().getCharity() != null) {
                charityName = c.getCampaign().getCharity().getCharityName();
            } else if (c.getCampaign().getAnimalOrg() != null) {
                charityName = c.getCampaign().getAnimalOrg().getOrganizationName();
            }
        }

        String receiptNo = "REC-" + c.getId().toString().substring(0, 8).toUpperCase();

        return AdminContributionDto.builder()
                .id(c.getId())
                .campaignId(c.getCampaign() != null ? c.getCampaign().getId() : null)
                .campaignTitle(c.getCampaign() != null ? c.getCampaign().getTitle() : "Unknown Campaign")
                .charityName(charityName)
                .contributorUserId(c.getContributorUser() != null ? c.getContributorUser().getId() : null)
                .contributorName(c.getContributorName())
                .contributorEmail(c.getContributorEmail())
                .contributionType(c.getContributionType())
                .monetaryAmount(c.getMonetaryAmount())
                .foodAmountKg(c.getFoodAmountKg())
                .otherResourceDescription(c.getItemDescription())
                .status(c.getStatus())
                .receiptNumber(receiptNo)
                .createdAt(c.getCreatedAt())
                .build();
    }

    // =========================================================================
    // 6. AUDIT LOG VIEWER
    // =========================================================================

    @Transactional(readOnly = true)
    public List<AuditLogResponseDto> getAuditLogs(String action, String entityName, String search, Integer limit) {
        List<AuditLog> logs = auditLogRepository.findAll();

        int max = limit != null && limit > 0 ? Math.min(limit, 200) : 100;

        return logs.stream()
                .filter(l -> {
                    if (action != null && !action.equalsIgnoreCase("ALL") && !l.getAction().equalsIgnoreCase(action)) {
                        return false;
                    }
                    if (entityName != null && !entityName.equalsIgnoreCase("ALL") && !l.getEntityName().equalsIgnoreCase(entityName)) {
                        return false;
                    }
                    if (search != null && !search.trim().isEmpty()) {
                        String q = search.trim().toLowerCase();
                        boolean matchAction = l.getAction().toLowerCase().contains(q);
                        boolean matchDetails = l.getDetails() != null && l.getDetails().toLowerCase().contains(q);
                        boolean matchUser = l.getUser() != null && (
                                (l.getUser().getEmail() != null && l.getUser().getEmail().toLowerCase().contains(q)) ||
                                (l.getUser().getFullName() != null && l.getUser().getFullName().toLowerCase().contains(q))
                        );
                        if (!matchAction && !matchDetails && !matchUser) return false;
                    }
                    return true;
                })
                .sorted(Comparator.comparing(AuditLog::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .limit(max)
                .map(this::mapToAuditLogDto)
                .collect(Collectors.toList());
    }

    private AuditLogResponseDto mapToAuditLogDto(AuditLog log) {
        return AuditLogResponseDto.builder()
                .id(log.getId())
                .userId(log.getUser() != null ? log.getUser().getId() : null)
                .userEmail(log.getUser() != null ? log.getUser().getEmail() : "SYSTEM")
                .userName(log.getUser() != null ? log.getUser().getFullName() : "Automated System")
                .userRole(log.getUser() != null && log.getUser().getRole() != null ? log.getUser().getRole().name() : "SYSTEM")
                .action(log.getAction())
                .entityName(log.getEntityName())
                .entityId(log.getEntityId())
                .ipAddress(log.getIpAddress())
                .details(log.getDetails())
                .createdAt(log.getCreatedAt())
                .build();
    }

    // =========================================================================
    // 7. SETTINGS MANAGEMENT
    // =========================================================================

    @Transactional(readOnly = true)
    public PlatformSettingsDto getSettings() {
        PlatformSettings settings = platformSettingsRepository.findById("DEFAULT")
                .orElseGet(this::createDefaultSettings);
        return mapToSettingsDto(settings);
    }

    @Transactional
    public PlatformSettingsDto updateSettings(String adminEmail, PlatformSettingsDto dto, String ipAddress) {
        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Admin user not found"));

        PlatformSettings settings = platformSettingsRepository.findById("DEFAULT")
                .orElseGet(this::createDefaultSettings);

        settings.setPlatformName(dto.getPlatformName());
        settings.setSupportEmail(dto.getSupportEmail());
        settings.setSupportPhone(dto.getSupportPhone());
        settings.setContactAddress(dto.getContactAddress());
        settings.setMaintenanceMode(dto.getMaintenanceMode());
        settings.setRequireDocumentVerification(dto.getRequireDocumentVerification());
        settings.setMinFoodExpiryHours(dto.getMinFoodExpiryHours());
        settings.setAnimalWelfareEnabled(dto.getAnimalWelfareEnabled());
        settings.setGroceryCouponsEnabled(dto.getGroceryCouponsEnabled());
        settings.setEmailNotificationsEnabled(dto.getEmailNotificationsEnabled());
        if (dto.getBankName() != null) settings.setBankName(dto.getBankName());
        if (dto.getBankAccountName() != null) settings.setBankAccountName(dto.getBankAccountName());
        if (dto.getBankAccountNumber() != null) settings.setBankAccountNumber(dto.getBankAccountNumber());
        if (dto.getBankBranch() != null) settings.setBankBranch(dto.getBankBranch());
        settings.setUpdatedAt(OffsetDateTime.now(ZoneOffset.UTC));

        PlatformSettings saved = platformSettingsRepository.save(settings);

        String details = String.format("Admin %s updated platform operational settings.", admin.getEmail());
        auditLogService.record(admin, "PLATFORM_SETTINGS_UPDATED", "PLATFORM_SETTINGS", null, details, ipAddress);

        return mapToSettingsDto(saved);
    }

    private PlatformSettings createDefaultSettings() {
        PlatformSettings settings = PlatformSettings.builder()
                .id("DEFAULT")
                .platformName("FoodBridge Sri Lanka")
                .supportEmail("support@foodbridge.lk")
                .supportPhone("+94 11 234 5678")
                .contactAddress("100 Galle Road, Colombo 03, Sri Lanka")
                .maintenanceMode(false)
                .requireDocumentVerification(true)
                .minFoodExpiryHours(2)
                .animalWelfareEnabled(true)
                .groceryCouponsEnabled(true)
                .emailNotificationsEnabled(true)
                .bankName("Bank of Ceylon")
                .bankAccountName("FoodBridge (Pvt) Ltd")
                .bankAccountNumber("000847291038")
                .bankBranch("Corporate Branch, Colombo 01")
                .updatedAt(OffsetDateTime.now(ZoneOffset.UTC))
                .build();
        return platformSettingsRepository.save(settings);
    }

    private PlatformSettingsDto mapToSettingsDto(PlatformSettings s) {
        return PlatformSettingsDto.builder()
                .id(s.getId())
                .platformName(s.getPlatformName())
                .supportEmail(s.getSupportEmail())
                .supportPhone(s.getSupportPhone())
                .contactAddress(s.getContactAddress())
                .maintenanceMode(s.getMaintenanceMode())
                .requireDocumentVerification(s.getRequireDocumentVerification())
                .minFoodExpiryHours(s.getMinFoodExpiryHours())
                .animalWelfareEnabled(s.getAnimalWelfareEnabled())
                .groceryCouponsEnabled(s.getGroceryCouponsEnabled())
                .emailNotificationsEnabled(s.getEmailNotificationsEnabled())
                .bankName(s.getBankName())
                .bankAccountName(s.getBankAccountName())
                .bankAccountNumber(s.getBankAccountNumber())
                .bankBranch(s.getBankBranch())
                .updatedAt(s.getUpdatedAt())
                .build();
    }
}

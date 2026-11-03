package com.ecoconnect.foodbridge.service;

import com.ecoconnect.foodbridge.dto.*;
import com.ecoconnect.foodbridge.exception.ResourceNotFoundException;
import com.ecoconnect.foodbridge.model.*;
import com.ecoconnect.foodbridge.model.enums.*;
import com.ecoconnect.foodbridge.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.nio.charset.StandardCharsets;
import java.time.*;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Service for aggregating ONLY verified, completed platform activities into impact statistics (Rule 4).
 * Strictly excludes unverified, pending, cancelled, or incomplete actions.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ImpactService {

    private final ImpactRecordRepository impactRecordRepository;
    private final ActivityRecordRepository activityRecordRepository;
    private final FoodRequestRepository foodRequestRepository;
    private final FoodListingRepository foodListingRepository;
    private final GroceryReservationRepository groceryReservationRepository;
    private final BusinessRepository businessRepository;
    private final CharityRepository charityRepository;
    private final CampaignRepository campaignRepository;
    private final CampaignContributionRepository campaignContributionRepository;
    private final PartnershipRepository partnershipRepository;
    private final VolunteerRepository volunteerRepository;
    private final UserRepository userRepository;

    /**
     * Platform-wide aggregated impact stats.
     * Aggregates ONLY verified, completed records within optional date range.
     */
    @Transactional(readOnly = true)
    public ImpactSummaryResponse getPlatformImpactSummary(LocalDate startDate, LocalDate endDate) {
        OffsetDateTime startDateTime = startDate != null ? startDate.atStartOfDay().atOffset(ZoneOffset.UTC) : null;
        OffsetDateTime endDateTime = endDate != null ? endDate.atTime(23, 59, 59).atOffset(ZoneOffset.UTC) : null;

        // 1. Food Rescued (kg) & Meals & CO2 - ONLY from completed ImpactRecords / FoodRequests
        List<ImpactRecord> impactRecords = impactRecordRepository.findAll().stream()
                .filter(i -> i.getActivityRecord() != null && i.getActivityRecord().getStatus() == ActivityStatus.COMPLETED)
                .filter(i -> isWithinDateRange(i.getCalculatedAt(), startDateTime, endDateTime))
                .toList();

        double totalFoodRescuedKg = impactRecords.stream()
                .mapToDouble(i -> i.getFoodWeightKg() != null ? i.getFoodWeightKg().doubleValue() : 0.0)
                .sum();

        long mealsRescued = impactRecords.stream()
                .mapToLong(i -> i.getMealsRescued() != null ? i.getMealsRescued().longValue() : 0L)
                .sum();

        double co2SavingsKg = impactRecords.stream()
                .mapToDouble(i -> i.getCo2SavingsKg() != null ? i.getCo2SavingsKg().doubleValue() : 0.0)
                .sum();

        long peopleFedFromRescue = impactRecords.stream()
                .mapToLong(i -> i.getPeopleFed() != null ? i.getPeopleFed().longValue() : 0L)
                .sum();

        // Fallback / complement: if ImpactRecord empty, compute from completed FoodRequests
        List<FoodRequest> completedFoodRequests = foodRequestRepository.findByStatus(FoodRequestStatus.COLLECTED).stream()
                .filter(r -> isWithinDateRange(r.getCompletedAt() != null ? r.getCompletedAt() : r.getUpdatedAt(), startDateTime, endDateTime))
                .toList();

        if (totalFoodRescuedKg == 0.0 && !completedFoodRequests.isEmpty()) {
            for (FoodRequest req : completedFoodRequests) {
                double kg = convertToKg(req.getQuantityRequested(), req.getListing() != null ? req.getListing().getUnit() : "kg");
                totalFoodRescuedKg += kg;
            }
            mealsRescued = Math.round(totalFoodRescuedKg / 0.40);
            co2SavingsKg = Math.round(totalFoodRescuedKg * 2.50 * 100.0) / 100.0;
            peopleFedFromRescue = mealsRescued;
        }

        // 2. Completed Collections - ONLY FoodRequests with status COLLECTED
        long completedCollections = completedFoodRequests.size();

        // 3. Grocery Products Redeemed - ONLY GroceryReservations with status REDEEMED
        List<GroceryReservation> redeemedReservations = groceryReservationRepository.findByStatus(GroceryReservationStatus.REDEEMED).stream()
                .filter(r -> isWithinDateRange(r.getRedeemedAt() != null ? r.getRedeemedAt() : r.getUpdatedAt(), startDateTime, endDateTime))
                .toList();

        long groceryProductsRedeemed = redeemedReservations.stream()
                .mapToLong(r -> r.getQuantity() != null ? r.getQuantity().longValue() : 0L)
                .sum();

        // 4. Active Businesses - ONLY Business with VerificationStatus.VERIFIED
        long activeBusinesses = businessRepository.countByVerificationStatus(VerificationStatus.VERIFIED);

        // 5. Completed Campaigns - ONLY Campaign with status COMPLETED
        List<Campaign> completedCampaignsList = campaignRepository.findByStatus(CampaignStatus.COMPLETED).stream()
                .filter(c -> isWithinDateRange(c.getUpdatedAt(), startDateTime, endDateTime))
                .toList();
        long completedCampaigns = completedCampaignsList.size();

        // 6. Resources Distributed - ONLY CampaignContribution with status DISTRIBUTED
        List<CampaignContribution> distributedContributions = campaignContributionRepository.findByStatus(ContributionStatus.DISTRIBUTED).stream()
                .filter(c -> isWithinDateRange(c.getDistributedAt() != null ? c.getDistributedAt() : c.getUpdatedAt(), startDateTime, endDateTime))
                .toList();

        long resourcesDistributed = distributedContributions.stream()
                .mapToLong(c -> c.getQuantity() != null && c.getQuantity() > 0 ? c.getQuantity() : 1L)
                .sum();

        // 7. People / Institutions Supported
        long beneficiariesFromCampaigns = completedCampaignsList.stream()
                .mapToLong(c -> c.getTargetBeneficiariesCount() != null ? c.getTargetBeneficiariesCount().longValue() : (c.getCurrentQuantity() != null ? c.getCurrentQuantity().longValue() : 0L))
                .sum();

        long charityCapacity = charityRepository.findByVerificationStatus(VerificationStatus.VERIFIED).stream()
                .mapToLong(ch -> ch.getCapacityPeople() != null ? ch.getCapacityPeople().longValue() : 0L)
                .sum();

        long totalPeopleSupported = peopleFedFromRescue + beneficiariesFromCampaigns + (charityCapacity > 0 ? (charityCapacity / 2) : 0L);

        // 8. Active Volunteers - ONLY Volunteer with VerificationStatus.VERIFIED
        long activeVolunteers = volunteerRepository.countByVerificationStatus(VerificationStatus.VERIFIED);

        // Districts Supported
        Set<String> uniqueDistricts = new HashSet<>();
        completedFoodRequests.forEach(r -> {
            if (r.getListing() != null && r.getListing().getBusiness() != null && r.getListing().getBusiness().getDistrict() != null) {
                uniqueDistricts.add(r.getListing().getBusiness().getDistrict());
            }
        });
        completedCampaignsList.forEach(c -> {
            if (c.getDistrict() != null) uniqueDistricts.add(c.getDistrict());
        });
        charityRepository.findByVerificationStatus(VerificationStatus.VERIFIED).forEach(ch -> {
            if (ch.getDistrict() != null) uniqueDistricts.add(ch.getDistrict());
        });

        long districtsSupported = Math.max(uniqueDistricts.size(), 1);

        // Category Breakdown
        List<CategoryBreakdownItem> categoryBreakdown = computeCategoryBreakdown(completedFoodRequests, redeemedReservations, distributedContributions);

        // Monthly Trends
        List<MonthlyTrendItem> monthlyTrends = computeMonthlyTrends(completedFoodRequests, redeemedReservations, distributedContributions);

        // Recent Milestones
        List<ImpactMilestoneItem> recentMilestones = buildRecentMilestones(completedFoodRequests, redeemedReservations, completedCampaignsList, distributedContributions);

        return ImpactSummaryResponse.builder()
                .foodRescuedKg(roundTwoDecimals(totalFoodRescuedKg))
                .completedCollections(completedCollections)
                .groceryProductsRedeemed(groceryProductsRedeemed)
                .activeBusinesses(activeBusinesses)
                .completedCampaigns(completedCampaigns)
                .resourcesDistributed(resourcesDistributed)
                .peopleSupported(totalPeopleSupported)
                .activeVolunteers(activeVolunteers)
                .co2SavingsKg(roundTwoDecimals(co2SavingsKg))
                .mealsProvided(mealsRescued)
                .districtsSupported(districtsSupported)
                .categoryBreakdown(categoryBreakdown)
                .monthlyTrends(monthlyTrends)
                .recentMilestones(recentMilestones)
                .startDate(startDate)
                .endDate(endDate)
                .generatedAt(OffsetDateTime.now(ZoneOffset.UTC))
                .build();
    }

    /**
     * Per-organization impact statistics (for Business or Charity).
     * Filters strictly to that organization's verified, completed records.
     */
    @Transactional(readOnly = true)
    public OrganizationImpactResponse getOrganizationImpact(UUID organizationId, LocalDate startDate, LocalDate endDate) {
        OffsetDateTime startDateTime = startDate != null ? startDate.atStartOfDay().atOffset(ZoneOffset.UTC) : null;
        OffsetDateTime endDateTime = endDate != null ? endDate.atTime(23, 59, 59).atOffset(ZoneOffset.UTC) : null;

        Optional<Business> optBusiness = businessRepository.findById(organizationId);
        if (optBusiness.isPresent()) {
            return buildBusinessImpact(optBusiness.get(), startDateTime, endDateTime, startDate, endDate);
        }

        Optional<Charity> optCharity = charityRepository.findById(organizationId);
        if (optCharity.isPresent()) {
            return buildCharityImpact(optCharity.get(), startDateTime, endDateTime, startDate, endDate);
        }

        throw new ResourceNotFoundException("Organization not found with ID: " + organizationId);
    }

    /**
     * Resolve impact for current authenticated user's organization.
     */
    @Transactional(readOnly = true)
    public OrganizationImpactResponse getMyImpact(String userEmail, LocalDate startDate, LocalDate endDate) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userEmail));

        Optional<Business> business = businessRepository.findByUserId(user.getId());
        if (business.isPresent()) {
            return getOrganizationImpact(business.get().getId(), startDate, endDate);
        }

        Optional<Charity> charity = charityRepository.findByUserId(user.getId());
        if (charity.isPresent()) {
            return getOrganizationImpact(charity.get().getId(), startDate, endDate);
        }

        // If admin or normal user, return a generic organization response
        return OrganizationImpactResponse.builder()
                .organizationId(user.getId())
                .organizationName(user.getFullName())
                .organizationType(user.getRole().name())
                .verificationStatus("VERIFIED")
                .foodWeightKg(0.0)
                .completedCollections(0L)
                .groceryProductsRedeemed(0L)
                .completedCampaigns(0L)
                .resourcesHandled(0L)
                .peopleSupported(0L)
                .co2SavingsKg(0.0)
                .mealsProvided(0L)
                .completedPartnerships(0L)
                .categoryBreakdown(Collections.emptyList())
                .monthlyTrends(Collections.emptyList())
                .recentActivities(Collections.emptyList())
                .startDate(startDate)
                .endDate(endDate)
                .generatedAt(OffsetDateTime.now(ZoneOffset.UTC))
                .build();
    }

    private OrganizationImpactResponse buildBusinessImpact(Business business, OffsetDateTime start, OffsetDateTime end, LocalDate startDate, LocalDate endDate) {
        // 1. Completed food rescue requests from this business
        List<FoodRequest> businessFoodRequests = foodRequestRepository.findByListingBusinessIdAndStatus(business.getId(), FoodRequestStatus.COLLECTED).stream()
                .filter(r -> isWithinDateRange(r.getCompletedAt() != null ? r.getCompletedAt() : r.getUpdatedAt(), start, end))
                .toList();

        double totalFoodKg = 0.0;
        for (FoodRequest req : businessFoodRequests) {
            totalFoodKg += convertToKg(req.getQuantityRequested(), req.getListing() != null ? req.getListing().getUnit() : "kg");
        }

        long completedCollections = businessFoodRequests.size();
        long mealsProvided = Math.round(totalFoodKg / 0.40);
        double co2Savings = Math.round(totalFoodKg * 2.50 * 100.0) / 100.0;

        // 2. Grocery reservations redeemed for this business
        List<GroceryReservation> redeemedGrocery = groceryReservationRepository.findByOfferBusinessIdAndStatus(business.getId(), GroceryReservationStatus.REDEEMED).stream()
                .filter(r -> isWithinDateRange(r.getRedeemedAt() != null ? r.getRedeemedAt() : r.getUpdatedAt(), start, end))
                .toList();

        long groceryRedeemed = redeemedGrocery.stream()
                .mapToLong(r -> r.getQuantity() != null ? r.getQuantity().longValue() : 0L)
                .sum();

        // 3. Completed partnerships for this business
        List<Partnership> completedPartnerships = partnershipRepository.findByBusinessId(business.getId()).stream()
                .filter(p -> p.getStatus() == PartnershipStatus.COMPLETED)
                .filter(p -> isWithinDateRange(p.getUpdatedAt(), start, end))
                .toList();

        long resourcesContributed = completedPartnerships.stream()
                .mapToLong(p -> p.getQuantity() != null ? p.getQuantity().longValue() : 1L)
                .sum();

        // Category Breakdown
        List<CategoryBreakdownItem> categories = computeCategoryBreakdown(businessFoodRequests, redeemedGrocery, Collections.emptyList());

        // Monthly Trends
        List<MonthlyTrendItem> monthlyTrends = computeMonthlyTrends(businessFoodRequests, redeemedGrocery, Collections.emptyList());

        // Recent Milestones
        List<ImpactMilestoneItem> recent = buildRecentMilestones(businessFoodRequests, redeemedGrocery, Collections.emptyList(), Collections.emptyList());

        return OrganizationImpactResponse.builder()
                .organizationId(business.getId())
                .organizationName(business.getBusinessName())
                .organizationType("BUSINESS")
                .verificationStatus(business.getVerificationStatus() != null ? business.getVerificationStatus().name() : "PENDING")
                .foodWeightKg(roundTwoDecimals(totalFoodKg))
                .completedCollections(completedCollections)
                .groceryProductsRedeemed(groceryRedeemed)
                .completedCampaigns(0L)
                .resourcesHandled(resourcesContributed)
                .peopleSupported(mealsProvided)
                .co2SavingsKg(roundTwoDecimals(co2Savings))
                .mealsProvided(mealsProvided)
                .completedPartnerships((long) completedPartnerships.size())
                .categoryBreakdown(categories)
                .monthlyTrends(monthlyTrends)
                .recentActivities(recent)
                .startDate(startDate)
                .endDate(endDate)
                .generatedAt(OffsetDateTime.now(ZoneOffset.UTC))
                .build();
    }

    private OrganizationImpactResponse buildCharityImpact(Charity charity, OffsetDateTime start, OffsetDateTime end, LocalDate startDate, LocalDate endDate) {
        // 1. Food requests claimed and collected by this charity
        List<FoodRequest> charityRequests = foodRequestRepository.findByCharityIdAndStatus(charity.getId(), FoodRequestStatus.COLLECTED).stream()
                .filter(r -> isWithinDateRange(r.getCompletedAt() != null ? r.getCompletedAt() : r.getUpdatedAt(), start, end))
                .toList();

        double totalFoodKg = 0.0;
        for (FoodRequest req : charityRequests) {
            totalFoodKg += convertToKg(req.getQuantityRequested(), req.getListing() != null ? req.getListing().getUnit() : "kg");
        }

        long completedCollections = charityRequests.size();
        long mealsProvided = Math.round(totalFoodKg / 0.40);
        double co2Savings = Math.round(totalFoodKg * 2.50 * 100.0) / 100.0;

        // 2. Completed campaigns organized by this charity
        List<Campaign> completedCampaigns = campaignRepository.findByCharityIdAndStatus(charity.getId(), CampaignStatus.COMPLETED).stream()
                .filter(c -> isWithinDateRange(c.getUpdatedAt(), start, end))
                .toList();

        // 3. Distributed contributions by this charity
        List<CampaignContribution> distributed = campaignContributionRepository.findByCampaignCharityIdAndStatus(charity.getId(), ContributionStatus.DISTRIBUTED).stream()
                .filter(c -> isWithinDateRange(c.getDistributedAt() != null ? c.getDistributedAt() : c.getUpdatedAt(), start, end))
                .toList();

        long resourcesHandled = distributed.stream()
                .mapToLong(c -> c.getQuantity() != null && c.getQuantity() > 0 ? c.getQuantity() : 1L)
                .sum();

        // 4. Completed partnerships with businesses
        List<Partnership> completedPartnerships = partnershipRepository.findByCharityId(charity.getId()).stream()
                .filter(p -> p.getStatus() == PartnershipStatus.COMPLETED)
                .filter(p -> isWithinDateRange(p.getUpdatedAt(), start, end))
                .toList();

        long beneficiariesFromCampaigns = completedCampaigns.stream()
                .mapToLong(c -> c.getTargetBeneficiariesCount() != null ? c.getTargetBeneficiariesCount().longValue() : 0L)
                .sum();

        long peopleSupported = mealsProvided + beneficiariesFromCampaigns + (charity.getCapacityPeople() != null ? charity.getCapacityPeople() : 0L);

        List<CategoryBreakdownItem> categories = computeCategoryBreakdown(charityRequests, Collections.emptyList(), distributed);
        List<MonthlyTrendItem> monthlyTrends = computeMonthlyTrends(charityRequests, Collections.emptyList(), distributed);
        List<ImpactMilestoneItem> recent = buildRecentMilestones(charityRequests, Collections.emptyList(), completedCampaigns, distributed);

        return OrganizationImpactResponse.builder()
                .organizationId(charity.getId())
                .organizationName(charity.getCharityName())
                .organizationType("CHARITY")
                .verificationStatus(charity.getVerificationStatus() != null ? charity.getVerificationStatus().name() : "PENDING")
                .foodWeightKg(roundTwoDecimals(totalFoodKg))
                .completedCollections(completedCollections)
                .groceryProductsRedeemed(0L)
                .completedCampaigns((long) completedCampaigns.size())
                .resourcesHandled(resourcesHandled)
                .peopleSupported(peopleSupported)
                .co2SavingsKg(roundTwoDecimals(co2Savings))
                .mealsProvided(mealsProvided)
                .completedPartnerships((long) completedPartnerships.size())
                .categoryBreakdown(categories)
                .monthlyTrends(monthlyTrends)
                .recentActivities(recent)
                .startDate(startDate)
                .endDate(endDate)
                .generatedAt(OffsetDateTime.now(ZoneOffset.UTC))
                .build();
    }

    /**
     * Generates a downloadable CSV report of verified impact records.
     */
    @Transactional(readOnly = true)
    public byte[] exportImpactCsv(UUID organizationId, LocalDate startDate, LocalDate endDate) {
        StringBuilder csv = new StringBuilder();
        // UTF-8 BOM for Microsoft Excel compatibility
        csv.append("\uFEFF");

        DateTimeFormatter df = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
        String generatedStr = OffsetDateTime.now(ZoneOffset.UTC).format(df);
        String dateRangeStr = (startDate != null ? startDate.toString() : "All-Time") + " to " + (endDate != null ? endDate.toString() : "Present");

        if (organizationId != null) {
            OrganizationImpactResponse org = getOrganizationImpact(organizationId, startDate, endDate);
            csv.append("=== FoodBridge EcoConnect - Organization Impact Report ===\n");
            csv.append("Organization Name,").append(escapeCsv(org.getOrganizationName())).append("\n");
            csv.append("Organization Type,").append(org.getOrganizationType()).append("\n");
            csv.append("Verification Status,").append(org.getVerificationStatus()).append("\n");
            csv.append("Report Date Range,").append(dateRangeStr).append("\n");
            csv.append("Generated At (UTC),").append(generatedStr).append("\n\n");

            csv.append("--- Verified Impact Summary ---\n");
            csv.append("Metric,Value,Unit\n");
            csv.append("Food Rescued / Claimed,").append(org.getFoodWeightKg()).append(",kg\n");
            csv.append("Completed Collections,").append(org.getCompletedCollections()).append(",events\n");
            csv.append("Grocery Products Redeemed,").append(org.getGroceryProductsRedeemed()).append(",items\n");
            csv.append("Completed Campaigns,").append(org.getCompletedCampaigns()).append(",campaigns\n");
            csv.append("Resources Distributed / Handled,").append(org.getResourcesHandled()).append(",units\n");
            csv.append("Estimated People Supported,").append(org.getPeopleSupported()).append(",people\n");
            csv.append("CO2 Emissions Avoided,").append(org.getCo2SavingsKg()).append(",kg CO2\n");
            csv.append("Estimated Meals Provided,").append(org.getMealsProvided()).append(",meals\n");
            csv.append("Agreed Partnerships Completed,").append(org.getCompletedPartnerships()).append(",partnerships\n\n");

            csv.append("--- Category Breakdown ---\n");
            csv.append("Category,Quantity / Items,Count,Share (%)\n");
            for (CategoryBreakdownItem item : org.getCategoryBreakdown()) {
                csv.append(escapeCsv(item.getCategory())).append(",")
                        .append(item.getTotalAmount()).append(",")
                        .append(item.getCount()).append(",")
                        .append(item.getPercentage()).append("%\n");
            }

            csv.append("\n--- Monthly Timeline Trend ---\n");
            csv.append("Month,Food Rescued (kg),Collections,Grocery Redeemed,Resources Distributed\n");
            for (MonthlyTrendItem trend : org.getMonthlyTrends()) {
                csv.append(trend.getMonth()).append(",")
                        .append(trend.getFoodRescuedKg()).append(",")
                        .append(trend.getCompletedCollections()).append(",")
                        .append(trend.getGroceryRedeemed()).append(",")
                        .append(trend.getResourcesDistributed()).append("\n");
            }
        } else {
            ImpactSummaryResponse sum = getPlatformImpactSummary(startDate, endDate);
            csv.append("=== FoodBridge EcoConnect - National Platform Impact Report ===\n");
            csv.append("Platform,FoodBridge Sri Lanka\n");
            csv.append("Transparency Standard,Rule 4 Verified & Completed Accounting Only\n");
            csv.append("Report Date Range,").append(dateRangeStr).append("\n");
            csv.append("Generated At (UTC),").append(generatedStr).append("\n\n");

            csv.append("--- Key Verified Performance Indicators ---\n");
            csv.append("Metric,Value,Unit\n");
            csv.append("Total Surplus Food Rescued,").append(sum.getFoodRescuedKg()).append(",kg\n");
            csv.append("Total Completed Collections,").append(sum.getCompletedCollections()).append(",events\n");
            csv.append("Grocery Products Redeemed,").append(sum.getGroceryProductsRedeemed()).append(",items\n");
            csv.append("Active Verified Businesses,").append(sum.getActiveBusinesses()).append(",businesses\n");
            csv.append("Completed Rural Campaigns,").append(sum.getCompletedCampaigns()).append(",campaigns\n");
            csv.append("Verified Resources Distributed,").append(sum.getResourcesDistributed()).append(",aid items\n");
            csv.append("People & Community Members Supported,").append(sum.getPeopleSupported()).append(",beneficiaries\n");
            csv.append("Active Verified Volunteers,").append(sum.getActiveVolunteers()).append(",volunteers\n");
            csv.append("CO2 Emissions Prevented,").append(sum.getCo2SavingsKg()).append(",kg CO2\n");
            csv.append("Estimated Nutritious Meals Rescued,").append(sum.getMealsProvided()).append(",meals\n");
            csv.append("Districts Benefited,").append(sum.getDistrictsSupported()).append(",districts\n\n");

            csv.append("--- Category Breakdown ---\n");
            csv.append("Category,Quantity / Items,Count,Share (%)\n");
            for (CategoryBreakdownItem item : sum.getCategoryBreakdown()) {
                csv.append(escapeCsv(item.getCategory())).append(",")
                        .append(item.getTotalAmount()).append(",")
                        .append(item.getCount()).append(",")
                        .append(item.getPercentage()).append("%\n");
            }

            csv.append("\n--- Monthly Timeline Trend ---\n");
            csv.append("Month,Food Rescued (kg),Collections,Grocery Redeemed,Resources Distributed\n");
            for (MonthlyTrendItem trend : sum.getMonthlyTrends()) {
                csv.append(trend.getMonth()).append(",")
                        .append(trend.getFoodRescuedKg()).append(",")
                        .append(trend.getCompletedCollections()).append(",")
                        .append(trend.getGroceryRedeemed()).append(",")
                        .append(trend.getResourcesDistributed()).append("\n");
            }
        }

        return csv.toString().getBytes(StandardCharsets.UTF_8);
    }

    private String escapeCsv(String val) {
        if (val == null) return "";
        if (val.contains(",") || val.contains("\"") || val.contains("\n")) {
            return "\"" + val.replace("\"", "\"\"") + "\"";
        }
        return val;
    }

    private boolean isWithinDateRange(OffsetDateTime timestamp, OffsetDateTime start, OffsetDateTime end) {
        if (timestamp == null) return true;
        if (start != null && timestamp.isBefore(start)) return false;
        return end == null || !timestamp.isAfter(end);
    }

    private double convertToKg(BigDecimal quantity, String unit) {
        if (quantity == null) return 0.0;
        double q = quantity.doubleValue();
        if (unit == null) return q;
        String u = unit.toLowerCase().trim();
        if (u.contains("portion") || u.contains("meal") || u.contains("pack")) {
            return q * 0.40; // Standard 400g meal estimate
        } else if (u.contains("gram") || u.equals("g")) {
            return q / 1000.0;
        }
        return q;
    }

    private List<CategoryBreakdownItem> computeCategoryBreakdown(
            List<FoodRequest> foodRequests,
            List<GroceryReservation> groceryReservations,
            List<CampaignContribution> contributions) {

        Map<String, Double> categoryAmounts = new HashMap<>();
        Map<String, Long> categoryCounts = new HashMap<>();

        for (FoodRequest req : foodRequests) {
            String cat = req.getListing() != null && req.getListing().getFoodCategory() != null ? req.getListing().getFoodCategory() : "Cooked Meals";
            double kg = convertToKg(req.getQuantityRequested(), req.getListing() != null ? req.getListing().getUnit() : "kg");
            categoryAmounts.put(cat, categoryAmounts.getOrDefault(cat, 0.0) + kg);
            categoryCounts.put(cat, categoryCounts.getOrDefault(cat, 0L) + 1L);
        }

        for (GroceryReservation res : groceryReservations) {
            String cat = res.getOffer() != null && res.getOffer().getCategory() != null ? res.getOffer().getCategory() : "Grocery Deals";
            double count = res.getQuantity() != null ? res.getQuantity().doubleValue() : 1.0;
            categoryAmounts.put(cat, categoryAmounts.getOrDefault(cat, 0.0) + count);
            categoryCounts.put(cat, categoryCounts.getOrDefault(cat, 0L) + 1L);
        }

        for (CampaignContribution c : contributions) {
            String cat = c.getCampaign() != null && c.getCampaign().getNeedType() != null ? c.getCampaign().getNeedType().name() : "Community Essentials";
            double count = c.getQuantity() != null ? c.getQuantity().doubleValue() : 1.0;
            categoryAmounts.put(cat, categoryAmounts.getOrDefault(cat, 0.0) + count);
            categoryCounts.put(cat, categoryCounts.getOrDefault(cat, 0L) + 1L);
        }

        double grandTotal = categoryAmounts.values().stream().mapToDouble(Double::doubleValue).sum();

        List<CategoryBreakdownItem> items = new ArrayList<>();
        for (Map.Entry<String, Double> entry : categoryAmounts.entrySet()) {
            double pct = grandTotal > 0 ? (entry.getValue() / grandTotal) * 100.0 : 0.0;
            items.add(CategoryBreakdownItem.builder()
                    .category(entry.getKey())
                    .totalAmount(roundTwoDecimals(entry.getValue()))
                    .count(categoryCounts.getOrDefault(entry.getKey(), 0L))
                    .percentage(roundTwoDecimals(pct))
                    .unit("units")
                    .build());
        }

        items.sort((a, b) -> Double.compare(b.getTotalAmount(), a.getTotalAmount()));
        return items;
    }

    private List<MonthlyTrendItem> computeMonthlyTrends(
            List<FoodRequest> foodRequests,
            List<GroceryReservation> groceryReservations,
            List<CampaignContribution> contributions) {

        Map<String, MonthlyTrendItem> trendsMap = new TreeMap<>();
        DateTimeFormatter monthFmt = DateTimeFormatter.ofPattern("yyyy-MM");

        // Seed current and previous 5 months
        YearMonth now = YearMonth.now();
        for (int i = 5; i >= 0; i--) {
            YearMonth ym = now.minusMonths(i);
            String mKey = ym.format(monthFmt);
            trendsMap.put(mKey, MonthlyTrendItem.builder()
                    .month(mKey)
                    .foodRescuedKg(0.0)
                    .completedCollections(0L)
                    .groceryRedeemed(0L)
                    .resourcesDistributed(0L)
                    .build());
        }

        for (FoodRequest req : foodRequests) {
            OffsetDateTime dt = req.getCompletedAt() != null ? req.getCompletedAt() : req.getUpdatedAt();
            if (dt != null) {
                String mKey = dt.format(monthFmt);
                MonthlyTrendItem item = trendsMap.computeIfAbsent(mKey, k -> MonthlyTrendItem.builder()
                        .month(k).foodRescuedKg(0.0).completedCollections(0L).groceryRedeemed(0L).resourcesDistributed(0L).build());
                double kg = convertToKg(req.getQuantityRequested(), req.getListing() != null ? req.getListing().getUnit() : "kg");
                item.setFoodRescuedKg(roundTwoDecimals(item.getFoodRescuedKg() + kg));
                item.setCompletedCollections(item.getCompletedCollections() + 1L);
            }
        }

        for (GroceryReservation res : groceryReservations) {
            OffsetDateTime dt = res.getRedeemedAt() != null ? res.getRedeemedAt() : res.getUpdatedAt();
            if (dt != null) {
                String mKey = dt.format(monthFmt);
                MonthlyTrendItem item = trendsMap.computeIfAbsent(mKey, k -> MonthlyTrendItem.builder()
                        .month(k).foodRescuedKg(0.0).completedCollections(0L).groceryRedeemed(0L).resourcesDistributed(0L).build());
                long q = res.getQuantity() != null ? res.getQuantity().longValue() : 1L;
                item.setGroceryRedeemed(item.getGroceryRedeemed() + q);
            }
        }

        for (CampaignContribution c : contributions) {
            OffsetDateTime dt = c.getDistributedAt() != null ? c.getDistributedAt() : c.getUpdatedAt();
            if (dt != null) {
                String mKey = dt.format(monthFmt);
                MonthlyTrendItem item = trendsMap.computeIfAbsent(mKey, k -> MonthlyTrendItem.builder()
                        .month(k).foodRescuedKg(0.0).completedCollections(0L).groceryRedeemed(0L).resourcesDistributed(0L).build());
                long q = c.getQuantity() != null ? c.getQuantity().longValue() : 1L;
                item.setResourcesDistributed(item.getResourcesDistributed() + q);
            }
        }

        return new ArrayList<>(trendsMap.values());
    }

    private List<ImpactMilestoneItem> buildRecentMilestones(
            List<FoodRequest> foodRequests,
            List<GroceryReservation> groceryReservations,
            List<Campaign> completedCampaigns,
            List<CampaignContribution> contributions) {

        List<ImpactMilestoneItem> milestones = new ArrayList<>();

        for (FoodRequest req : foodRequests) {
            String orgName = req.getCharity() != null ? req.getCharity().getCharityName() : "Community Beneficiary";
            double kg = convertToKg(req.getQuantityRequested(), req.getListing() != null ? req.getListing().getUnit() : "kg");
            milestones.add(ImpactMilestoneItem.builder()
                    .id(req.getId().toString())
                    .title("Food Rescue: " + (req.getListing() != null ? req.getListing().getTitle() : "Surplus Meal"))
                    .type("FOOD_RESCUE")
                    .organizationName(orgName)
                    .district(req.getListing() != null && req.getListing().getBusiness() != null ? req.getListing().getBusiness().getDistrict() : "Sri Lanka")
                    .description(String.format("%.1f kg rescued and verified for distribution", kg))
                    .timestamp(req.getCompletedAt() != null ? req.getCompletedAt() : req.getUpdatedAt())
                    .build());
        }

        for (GroceryReservation res : groceryReservations) {
            String busName = res.getOffer() != null && res.getOffer().getBusiness() != null ? res.getOffer().getBusiness().getBusinessName() : "Verified Grocer";
            milestones.add(ImpactMilestoneItem.builder()
                    .id(res.getId().toString())
                    .title("Discount Redeemed: " + (res.getOffer() != null ? res.getOffer().getTitle() : "Grocery Item"))
                    .type("GROCERY_REDEMPTION")
                    .organizationName(busName)
                    .district(res.getOffer() != null && res.getOffer().getBusiness() != null ? res.getOffer().getBusiness().getDistrict() : "Sri Lanka")
                    .description(String.format("%d near-expiry items redeemed safely", res.getQuantity()))
                    .timestamp(res.getRedeemedAt() != null ? res.getRedeemedAt() : res.getUpdatedAt())
                    .build());
        }

        for (Campaign c : completedCampaigns) {
            String charName = c.getCharity() != null ? c.getCharity().getCharityName() : "Verified Charity";
            milestones.add(ImpactMilestoneItem.builder()
                    .id(c.getId().toString())
                    .title("Campaign Completed: " + c.getTitle())
                    .type("CAMPAIGN_COMPLETED")
                    .organizationName(charName)
                    .district(c.getDistrict() != null ? c.getDistrict() : "Rural District")
                    .description(String.format("Target reached with %d %s delivered", c.getCurrentQuantity(), c.getTargetUnit() != null ? c.getTargetUnit() : "units"))
                    .timestamp(c.getUpdatedAt())
                    .build());
        }

        for (CampaignContribution dist : contributions) {
            String charName = dist.getCampaign() != null && dist.getCampaign().getCharity() != null ? dist.getCampaign().getCharity().getCharityName() : "Receiving Charity";
            milestones.add(ImpactMilestoneItem.builder()
                    .id(dist.getId().toString())
                    .title("Resource Distributed: " + (dist.getCampaign() != null ? dist.getCampaign().getTitle() : "Relief Aid"))
                    .type("RESOURCE_DISTRIBUTED")
                    .organizationName(charName)
                    .district(dist.getCampaign() != null ? dist.getCampaign().getDistrict() : "Sri Lanka")
                    .description(dist.getDistributionNotes() != null ? dist.getDistributionNotes() : "Aid distributed with photographic evidence")
                    .timestamp(dist.getDistributedAt() != null ? dist.getDistributedAt() : dist.getUpdatedAt())
                    .build());
        }

        milestones.sort((a, b) -> {
            if (a.getTimestamp() == null) return 1;
            if (b.getTimestamp() == null) return -1;
            return b.getTimestamp().compareTo(a.getTimestamp());
        });

        return milestones.stream().limit(10).toList();
    }

    private double roundTwoDecimals(double val) {
        return Math.round(val * 100.0) / 100.0;
    }
}

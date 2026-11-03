package com.ecoconnect.foodbridge.service;

import com.ecoconnect.foodbridge.dto.MapMarkerResponse;
import com.ecoconnect.foodbridge.model.*;
import com.ecoconnect.foodbridge.model.enums.*;
import com.ecoconnect.foodbridge.repository.*;
import com.ecoconnect.foodbridge.util.GeoUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ExploreMapService {

    private final BusinessRepository businessRepository;
    private final FoodListingRepository foodListingRepository;
    private final GroceryOfferRepository groceryOfferRepository;
    private final CampaignRepository campaignRepository;
    private final CharityRepository charityRepository;
    private final AnimalLocationRepository animalLocationRepository;

    @Transactional(readOnly = true)
    public List<MapMarkerResponse> getExploreMarkers(
            MapMarkerType type,
            String category,
            Boolean availableOnly,
            String district,
            String search,
            Double userLat,
            Double userLng,
            Double radiusKm) {

        List<MapMarkerResponse> markers = new ArrayList<>();
        boolean onlyAvailable = availableOnly == null || availableOnly;
        OffsetDateTime now = OffsetDateTime.now();

        // 1. Participating Businesses (Verified Restaurants and Grocers)
        if (type == null || type == MapMarkerType.BUSINESS) {
            List<Business> businesses = businessRepository.findByVerificationStatus(VerificationStatus.VERIFIED);
            for (Business b : businesses) {
                Double lat = toDouble(b.getLatitude());
                Double lng = toDouble(b.getLongitude());
                if (lat != null && lng != null) {
                    markers.add(MapMarkerResponse.builder()
                            .id(b.getId())
                            .markerType(MapMarkerType.BUSINESS)
                            .title(b.getBusinessName())
                            .subtitle((b.getBusinessType() != null ? b.getBusinessType().name() : "Partner Business") +
                                    (b.getCity() != null ? " • " + b.getCity() : (b.getDistrict() != null ? " • " + b.getDistrict() : "")))
                            .category(b.getBusinessType() != null ? b.getBusinessType().name() : "BUSINESS")
                            .latitude(lat)
                            .longitude(lng)
                            .district(b.getDistrict())
                            .city(b.getCity())
                            .status("VERIFIED")
                            .isAvailable(true)
                            .quantityInfo(b.getBusinessType() == BusinessType.GROCERY ? "Discounted Packaged Goods" : "Prepared Food Rescue Partner")
                            .imageUrl(b.getLogoUrl())
                            .targetUrl(b.getBusinessType() == BusinessType.GROCERY ? "/grocery-offers" : "/how-it-works")
                            .isVerified(true)
                            .organizationName(b.getBusinessName())
                            .build());
                }
            }
        }

        // 2. Available Surplus Food Listings
        if (type == null || type == MapMarkerType.FOOD_LISTING) {
            List<FoodListing> listings = foodListingRepository.findByStatus(FoodListingStatus.AVAILABLE);
            for (FoodListing fl : listings) {
                if (onlyAvailable) {
                    if (fl.getExpiryDate() != null && fl.getExpiryDate().isBefore(now)) continue;
                    if (fl.getPickupEnd() != null && fl.getPickupEnd().isBefore(now)) continue;
                }

                Double lat = toDouble(fl.getLatitude());
                Double lng = toDouble(fl.getLongitude());
                if ((lat == null || lng == null) && fl.getBusiness() != null) {
                    lat = toDouble(fl.getBusiness().getLatitude());
                    lng = toDouble(fl.getBusiness().getLongitude());
                }

                if (lat != null && lng != null) {
                    String timeWin = fl.getPickupStart() != null && fl.getPickupEnd() != null
                            ? "Pickup: " + fl.getPickupStart().toLocalTime().toString().substring(0, 5) + " - " + fl.getPickupEnd().toLocalTime().toString().substring(0, 5)
                            : (fl.getExpiryDate() != null ? "Best before: " + fl.getExpiryDate().toLocalDate() : "Available Today");

                    markers.add(MapMarkerResponse.builder()
                            .id(fl.getId())
                            .markerType(MapMarkerType.FOOD_LISTING)
                            .title(fl.getTitle())
                            .subtitle(fl.getBusiness() != null ? fl.getBusiness().getBusinessName() : "Restaurant Surplus")
                            .category(fl.getFoodCategory() != null ? fl.getFoodCategory() : "SURPLUS_FOOD")
                            .latitude(lat)
                            .longitude(lng)
                            .district(fl.getBusiness() != null ? fl.getBusiness().getDistrict() : "Colombo")
                            .city(fl.getBusiness() != null ? fl.getBusiness().getCity() : "Colombo")
                            .status(fl.getStatus().name())
                            .isAvailable(fl.getStatus() == FoodListingStatus.AVAILABLE)
                            .quantityInfo(fl.getQuantity() + " " + (fl.getUnit() != null ? fl.getUnit() : "portions") + " (" + (fl.getSuitabilityType() == FoodSuitabilityType.HUMAN_CONSUMPTION ? "Human Safe" : "Animal Feed") + ")")
                            .timeWindow(timeWin)
                            .imageUrl(fl.getImageUrl())
                            .targetUrl("/dashboard/charity")
                            .isVerified(fl.getBusiness() != null && fl.getBusiness().getVerificationStatus() == VerificationStatus.VERIFIED)
                            .organizationName(fl.getBusiness() != null ? fl.getBusiness().getBusinessName() : "Verified Establishment")
                            .build());
                }
            }
        }

        // 3. Discounted Grocery Offers
        if (type == null || type == MapMarkerType.GROCERY_OFFER) {
            List<GroceryOffer> offers = groceryOfferRepository.findActiveAvailableOffers(GroceryOfferStatus.AVAILABLE, now);
            for (GroceryOffer go : offers) {
                if (onlyAvailable && (go.getAvailableQuantity() == null || go.getAvailableQuantity() <= 0)) {
                    continue;
                }

                Business b = go.getBusiness();
                Double lat = b != null ? toDouble(b.getLatitude()) : null;
                Double lng = b != null ? toDouble(b.getLongitude()) : null;

                if (lat != null && lng != null) {
                    String price = go.getDiscountedPrice() != null
                            ? "Rs. " + go.getDiscountedPrice().toPlainString() + (go.getOriginalPrice() != null ? " (Was Rs. " + go.getOriginalPrice().toPlainString() + ")" : "")
                            : "";
                    String bb = go.getBestBeforeDate() != null ? "Best-Before: " + go.getBestBeforeDate().toString() : "Near Date Stock";

                    markers.add(MapMarkerResponse.builder()
                            .id(go.getId())
                            .markerType(MapMarkerType.GROCERY_OFFER)
                            .title(go.getTitle())
                            .subtitle(b != null ? b.getBusinessName() : "Grocery Partner")
                            .category(go.getCategory() != null ? go.getCategory() : "GROCERY")
                            .latitude(lat)
                            .longitude(lng)
                            .district(b != null ? b.getDistrict() : "Colombo")
                            .city(b != null ? b.getCity() : "Colombo")
                            .status(go.getStatus().name())
                            .isAvailable(go.getStatus() == GroceryOfferStatus.AVAILABLE && go.getAvailableQuantity() > 0)
                            .quantityInfo(go.getAvailableQuantity() + " available in stock")
                            .priceInfo(price)
                            .timeWindow(bb)
                            .imageUrl(go.getImageUrl())
                            .targetUrl("/grocery-offers")
                            .isVerified(b != null && b.getVerificationStatus() == VerificationStatus.VERIFIED)
                            .organizationName(b != null ? b.getBusinessName() : "Verified Grocery Store")
                            .build());
                }
            }
        }

        // 4. Verified Rural Relief Campaigns (Using Area-Level Location for Privacy & Dignity)
        if (type == null || type == MapMarkerType.CAMPAIGN) {
            List<Campaign> campaigns = campaignRepository.findByStatusIn(List.of(CampaignStatus.ACTIVE, CampaignStatus.APPROVED));
            for (Campaign c : campaigns) {
                // Public Safety Guarantee: strictly use area-level district coordinates with deterministic scatter
                GeoUtils.Coordinates coords = GeoUtils.getSafeAreaCoordinates(c.getDistrict(), c.getId());

                int progress = 0;
                if (c.getTargetQuantity() != null && c.getTargetQuantity() > 0) {
                    int current = c.getCurrentQuantity() != null ? c.getCurrentQuantity() : 0;
                    progress = (int) Math.min(100, Math.round((current * 100.0) / c.getTargetQuantity()));
                }

                markers.add(MapMarkerResponse.builder()
                        .id(c.getId())
                        .markerType(MapMarkerType.CAMPAIGN)
                        .title(c.getTitle())
                        .subtitle((c.getCharity() != null ? c.getCharity().getCharityName() : "Sri Lankan Relief Organization") + " • " + c.getDistrict() + " District")
                        .category(c.getNeedType() != null ? c.getNeedType().name() : "COMMUNITY_AID")
                        .latitude(coords.latitude())
                        .longitude(coords.longitude())
                        .district(c.getDistrict())
                        .city(c.getDistrict() + " District")
                        .status(c.getStatus().name())
                        .isAvailable(true)
                        .quantityInfo("Target: " + c.getTargetQuantity() + " " + (c.getTargetUnit() != null ? c.getTargetUnit() : "Units") + " (" + (c.getCurrentQuantity() != null ? c.getCurrentQuantity() : 0) + " confirmed)")
                        .progressPercentage(progress)
                        .imageUrl(c.getCoverImageUrl())
                        .targetUrl("/campaigns/" + c.getId())
                        .isVerified(true)
                        .organizationName(c.getCharity() != null ? c.getCharity().getCharityName() : "Verified Charity")
                        .build());
            }
        }

        // 5. Charity Organization Hubs
        if (type == null || type == MapMarkerType.CHARITY) {
            List<Charity> charities = charityRepository.findByVerificationStatus(VerificationStatus.VERIFIED);
            for (Charity ch : charities) {
                Double lat = toDouble(ch.getLatitude());
                Double lng = toDouble(ch.getLongitude());
                if (lat == null || lng == null) {
                    GeoUtils.Coordinates coords = GeoUtils.getDistrictCentroid(ch.getDistrict());
                    lat = coords.latitude();
                    lng = coords.longitude();
                }

                markers.add(MapMarkerResponse.builder()
                        .id(ch.getId())
                        .markerType(MapMarkerType.CHARITY)
                        .title(ch.getCharityName())
                        .subtitle("NGO Hub • " + (ch.getOperatingArea() != null ? ch.getOperatingArea() : ch.getDistrict()))
                        .category("CHARITY_HUB")
                        .latitude(lat)
                        .longitude(lng)
                        .district(ch.getDistrict())
                        .city(ch.getCity() != null ? ch.getCity() : ch.getDistrict())
                        .status("VERIFIED")
                        .isAvailable(true)
                        .quantityInfo(ch.getCapacityPeople() != null ? "Serving ~" + ch.getCapacityPeople() + " people daily" : "Community Food Distribution Center")
                        .imageUrl(ch.getLogoUrl())
                        .targetUrl("/campaigns")
                        .isVerified(true)
                        .organizationName(ch.getCharityName())
                        .build());
            }
        }

        // 6. Community Animal Feeding Locations
        if (type == null || type == MapMarkerType.FEEDING_LOCATION) {
            List<AnimalLocation> feedingLocations = animalLocationRepository.findByIsActiveTrue();
            for (AnimalLocation al : feedingLocations) {
                Double lat = toDouble(al.getLatitude());
                Double lng = toDouble(al.getLongitude());
                if (lat != null && lng != null) {
                    String animalsInfo = (al.getEstimatedCount() != null ? "~" + al.getEstimatedCount() + " " : "") + al.getAnimalType();
                    String routine = al.getFeedingRoutine() != null ? "Feeding Routine: " + al.getFeedingRoutine() : "Community Stray Feeding Point";

                    markers.add(MapMarkerResponse.builder()
                            .id(al.getId())
                            .markerType(MapMarkerType.FEEDING_LOCATION)
                            .title(al.getLocationName())
                            .subtitle((al.getAnimalOrg() != null ? al.getAnimalOrg().getOrganizationName() : "Community Feeder") +
                                    (al.getCity() != null ? " • " + al.getCity() : " • " + al.getDistrict()))
                            .category(al.getAnimalType())
                            .latitude(lat)
                            .longitude(lng)
                            .district(al.getDistrict())
                            .city(al.getCity() != null ? al.getCity() : al.getDistrict())
                            .status(Boolean.TRUE.equals(al.getIsActive()) ? "ACTIVE" : "INACTIVE")
                            .isAvailable(Boolean.TRUE.equals(al.getIsActive()))
                            .quantityInfo(animalsInfo + (al.getUrgencyLevel() != null ? " (Urgency: " + al.getUrgencyLevel() + ")" : ""))
                            .timeWindow(routine)
                            .targetUrl("/dashboard/animal-welfare")
                            .isVerified(al.getAnimalOrg() != null && al.getAnimalOrg().getVerificationStatus() == VerificationStatus.VERIFIED)
                            .organizationName(al.getAnimalOrg() != null ? al.getAnimalOrg().getOrganizationName() : "Animal Welfare Partner")
                            .build());
                }
            }
        }

        // Filtering & Distance Calculations
        return filterAndSortMarkers(markers, category, district, search, userLat, userLng, radiusKm);
    }

    private Double toDouble(BigDecimal bd) {
        return bd != null ? bd.doubleValue() : null;
    }

    private List<MapMarkerResponse> filterAndSortMarkers(
            List<MapMarkerResponse> markers,
            String category,
            String district,
            String search,
            Double userLat,
            Double userLng,
            Double radiusKm) {

        final String catFilter = category != null && !category.equalsIgnoreCase("ALL") ? category.trim().toLowerCase() : null;
        final String distFilter = district != null && !district.equalsIgnoreCase("ALL") ? district.trim().toLowerCase() : null;
        final String searchFilter = search != null && !search.isBlank() ? search.trim().toLowerCase() : null;
        final boolean hasUserCoords = userLat != null && userLng != null;

        return markers.stream()
                .filter(m -> {
                    // Category filter
                    if (catFilter != null) {
                        String mCat = m.getCategory() != null ? m.getCategory().toLowerCase() : "";
                        String mType = m.getMarkerType() != null ? m.getMarkerType().name().toLowerCase() : "";
                        if (!mCat.contains(catFilter) && !mType.contains(catFilter)) {
                            return false;
                        }
                    }

                    // District filter
                    if (distFilter != null) {
                        String mDist = m.getDistrict() != null ? m.getDistrict().toLowerCase() : "";
                        if (!mDist.contains(distFilter)) {
                            return false;
                        }
                    }

                    // Keyword Search filter
                    if (searchFilter != null) {
                        String title = m.getTitle() != null ? m.getTitle().toLowerCase() : "";
                        String sub = m.getSubtitle() != null ? m.getSubtitle().toLowerCase() : "";
                        String org = m.getOrganizationName() != null ? m.getOrganizationName().toLowerCase() : "";
                        String d = m.getDistrict() != null ? m.getDistrict().toLowerCase() : "";
                        String c = m.getCity() != null ? m.getCity().toLowerCase() : "";
                        if (!title.contains(searchFilter) && !sub.contains(searchFilter) &&
                            !org.contains(searchFilter) && !d.contains(searchFilter) && !c.contains(searchFilter)) {
                            return false;
                        }
                    }

                    // Distance Calculation & Radius Filter
                    if (hasUserCoords && m.getLatitude() != null && m.getLongitude() != null) {
                        double dist = GeoUtils.haversineKm(userLat, userLng, m.getLatitude(), m.getLongitude());
                        m.setDistanceKm(dist);

                        if (radiusKm != null && radiusKm > 0 && dist > radiusKm) {
                            return false;
                        }
                    }

                    return true;
                })
                .sorted((a, b) -> {
                    // Sort by distance if available, otherwise by title
                    if (hasUserCoords && a.getDistanceKm() != null && b.getDistanceKm() != null) {
                        return Double.compare(a.getDistanceKm(), b.getDistanceKm());
                    }
                    return a.getTitle().compareToIgnoreCase(b.getTitle());
                })
                .collect(Collectors.toList());
    }
}

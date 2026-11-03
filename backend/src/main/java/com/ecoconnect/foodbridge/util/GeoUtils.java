package com.ecoconnect.foodbridge.util;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

public class GeoUtils {

    public record Coordinates(double latitude, double longitude) {}

    private static final Map<String, Coordinates> DISTRICT_CENTROIDS;

    static {
        Map<String, Coordinates> map = new HashMap<>();
        map.put("Colombo", new Coordinates(6.9271, 79.8612));
        map.put("Gampaha", new Coordinates(7.0840, 80.0098));
        map.put("Kalutara", new Coordinates(6.5854, 79.9607));
        map.put("Kandy", new Coordinates(7.2906, 80.6337));
        map.put("Matale", new Coordinates(7.4675, 80.6234));
        map.put("Nuwara Eliya", new Coordinates(6.9497, 80.7891));
        map.put("Galle", new Coordinates(6.0535, 80.2210));
        map.put("Matara", new Coordinates(5.9549, 80.5550));
        map.put("Hambantota", new Coordinates(6.1429, 81.1212));
        map.put("Jaffna", new Coordinates(9.6615, 80.0255));
        map.put("Kilinochchi", new Coordinates(9.3803, 80.3770));
        map.put("Mannar", new Coordinates(8.9810, 79.9044));
        map.put("Vavuniya", new Coordinates(8.7542, 80.4982));
        map.put("Mullaitivu", new Coordinates(9.2671, 80.8142));
        map.put("Batticaloa", new Coordinates(7.7310, 81.6747));
        map.put("Ampara", new Coordinates(7.2912, 81.6724));
        map.put("Trincomalee", new Coordinates(8.5874, 81.2152));
        map.put("Kurunegala", new Coordinates(7.4863, 80.3623));
        map.put("Puttalam", new Coordinates(8.0408, 79.8394));
        map.put("Anuradhapura", new Coordinates(8.3114, 80.4037));
        map.put("Polonnaruwa", new Coordinates(7.9403, 81.0188));
        map.put("Badulla", new Coordinates(6.9934, 81.0550));
        map.put("Monaragala", new Coordinates(6.8728, 81.3507));
        map.put("Ratnapura", new Coordinates(6.6828, 80.4037));
        map.put("Kegalle", new Coordinates(7.2513, 80.3464));
        DISTRICT_CENTROIDS = Collections.unmodifiableMap(map);
    }

    public static final Coordinates SRI_LANKA_CENTER = new Coordinates(7.8731, 80.7718);

    public static Coordinates getDistrictCentroid(String district) {
        if (district == null || district.isBlank()) {
            return SRI_LANKA_CENTER;
        }
        for (Map.Entry<String, Coordinates> entry : DISTRICT_CENTROIDS.entrySet()) {
            if (entry.getKey().equalsIgnoreCase(district.trim())) {
                return entry.getValue();
            }
        }
        return SRI_LANKA_CENTER;
    }

    /**
     * Applies a small deterministic offset within the district centroid (~300m - 1km)
     * so multiple campaigns in the same district don't sit on the exact same coordinate,
     * while strictly protecting the exact private location of vulnerable communities.
     */
    public static Coordinates getSafeAreaCoordinates(String district, UUID entityId) {
        Coordinates base = getDistrictCentroid(district);
        if (entityId == null) {
            return base;
        }
        int hash = Math.abs(entityId.hashCode());
        double angle = (hash % 360) * (Math.PI / 180.0);
        double offsetRadius = 0.004 + (Math.abs(entityId.getLeastSignificantBits()) % 8) * 0.001; // ~400m to ~1.1km
        double lat = base.latitude() + offsetRadius * Math.cos(angle);
        double lng = base.longitude() + offsetRadius * Math.sin(angle);
        return new Coordinates(round(lat, 5), round(lng, 5));
    }

    /**
     * Haversine formula to compute great-circle distance between two GPS points in kilometers.
     */
    public static double haversineKm(double lat1, double lon1, double lat2, double lon2) {
        final double R = 6371.0; // Earth radius in km
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2.0) * Math.sin(dLat / 2.0) +
                   Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) *
                   Math.sin(dLon / 2.0) * Math.sin(dLon / 2.0);
        double c = 2.0 * Math.atan2(Math.sqrt(a), Math.sqrt(1.0 - a));
        return round(R * c, 2);
    }

    private static double round(double val, int places) {
        double factor = Math.pow(10, places);
        return Math.round(val * factor) / factor;
    }
}

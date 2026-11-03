package com.ecoconnect.foodbridge.dto;

import com.ecoconnect.foodbridge.model.enums.MapMarkerType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MapMarkerResponse {

    private UUID id;
    private MapMarkerType markerType;
    private String title;
    private String subtitle;
    private String category;
    private Double latitude;
    private Double longitude;
    private String district;
    private String city;
    private String status;
    private Boolean isAvailable;

    // Rich display attributes for popups and lists
    private String quantityInfo;
    private String priceInfo;
    private String timeWindow;
    private Integer progressPercentage;
    private String imageUrl;
    private String targetUrl;
    private Double distanceKm;

    // Safety and verification credentials
    private Boolean isVerified;
    private String organizationName;
}


package com.ecoconnect.foodbridge.controller;

import com.ecoconnect.foodbridge.dto.MapMarkerResponse;
import com.ecoconnect.foodbridge.model.enums.MapMarkerType;
import com.ecoconnect.foodbridge.service.ExploreMapService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/map")
@RequiredArgsConstructor
public class ExploreMapController {

    private final ExploreMapService exploreMapService;

    @GetMapping("/explore")
    public ResponseEntity<List<MapMarkerResponse>> getExploreMarkers(
            @RequestParam(required = false) MapMarkerType type,
            @RequestParam(required = false) String category,
            @RequestParam(required = false, defaultValue = "true") Boolean availableOnly,
            @RequestParam(required = false) String district,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Double userLat,
            @RequestParam(required = false) Double userLng,
            @RequestParam(required = false) Double radiusKm) {

        List<MapMarkerResponse> markers = exploreMapService.getExploreMarkers(
                type, category, availableOnly, district, search, userLat, userLng, radiusKm);
        return ResponseEntity.ok(markers);
    }

    @GetMapping("/pins")
    public ResponseEntity<List<MapMarkerResponse>> getPins(
            @RequestParam(required = false) MapMarkerType type,
            @RequestParam(required = false) String category,
            @RequestParam(required = false, defaultValue = "true") Boolean availableOnly,
            @RequestParam(required = false) String district,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Double userLat,
            @RequestParam(required = false) Double userLng,
            @RequestParam(required = false) Double radiusKm) {

        return getExploreMarkers(type, category, availableOnly, district, search, userLat, userLng, radiusKm);
    }
}

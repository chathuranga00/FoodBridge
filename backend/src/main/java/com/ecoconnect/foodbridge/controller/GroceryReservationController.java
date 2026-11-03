package com.ecoconnect.foodbridge.controller;

import com.ecoconnect.foodbridge.dto.GroceryReservationResponse;
import com.ecoconnect.foodbridge.dto.RedeemCodeRequest;
import com.ecoconnect.foodbridge.service.GroceryOfferService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/grocery")
public class GroceryReservationController {

    private final GroceryOfferService groceryOfferService;

    public GroceryReservationController(GroceryOfferService groceryOfferService) {
        this.groceryOfferService = groceryOfferService;
    }

    /**
     * Customer views all their reserved offers / coupons.
     */
    @GetMapping("/reservations/my")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<GroceryReservationResponse>> getMyReservations(Authentication authentication) {
        List<GroceryReservationResponse> reservations = groceryOfferService.getMyReservations(authentication.getName());
        return ResponseEntity.ok(reservations);
    }

    /**
     * Customer or business cancels a reservation, immediately releasing stock back to the offer.
     */
    @PostMapping("/reservations/{id}/cancel")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<GroceryReservationResponse> cancelReservation(
            Authentication authentication,
            @PathVariable UUID id) {
        GroceryReservationResponse response = groceryOfferService.cancelReservation(authentication.getName(), id);
        return ResponseEntity.ok(response);
    }

    /**
     * Business checks details of a redemption code before confirming.
     */
    @PostMapping("/redemptions/verify")
    @PreAuthorize("hasAnyRole('GROCERY', 'RESTAURANT', 'ADMIN')")
    public ResponseEntity<GroceryReservationResponse> verifyCode(
            Authentication authentication,
            @Valid @RequestBody RedeemCodeRequest request) {
        GroceryReservationResponse response = groceryOfferService.verifyRedemptionCode(
                authentication.getName(),
                request.getRedemptionCode()
        );
        return ResponseEntity.ok(response);
    }

    /**
     * Business confirms customer pickup by redeeming code.
     */
    @PostMapping("/redemptions/confirm")
    @PreAuthorize("hasAnyRole('GROCERY', 'RESTAURANT', 'ADMIN')")
    public ResponseEntity<GroceryReservationResponse> confirmRedemption(
            Authentication authentication,
            @Valid @RequestBody RedeemCodeRequest request) {
        GroceryReservationResponse response = groceryOfferService.redeemReservation(
                authentication.getName(),
                request.getRedemptionCode()
        );
        return ResponseEntity.ok(response);
    }

    /**
     * Business views all reservations and redemptions for their store.
     */
    @GetMapping("/redemptions/business")
    @PreAuthorize("hasAnyRole('GROCERY', 'RESTAURANT', 'ADMIN')")
    public ResponseEntity<List<GroceryReservationResponse>> getBusinessRedemptions(Authentication authentication) {
        List<GroceryReservationResponse> redemptions = groceryOfferService.getBusinessRedemptions(authentication.getName());
        return ResponseEntity.ok(redemptions);
    }
}

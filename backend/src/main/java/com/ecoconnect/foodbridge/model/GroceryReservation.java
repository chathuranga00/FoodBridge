package com.ecoconnect.foodbridge.model;

import com.ecoconnect.foodbridge.model.enums.GroceryReservationStatus;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "grocery_reservations")
public class GroceryReservation extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "offer_id", nullable = false)
    private GroceryOffer offer;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @NotBlank
    @Size(max = 50)
    @Column(name = "redemption_code", nullable = false, unique = true, length = 50)
    private String redemptionCode;

    @NotNull
    @Column(name = "quantity", nullable = false)
    private Integer quantity;

    @NotNull
    @Column(name = "unit_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal unitPrice;

    @NotNull
    @Column(name = "total_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalPrice;

    @NotNull
    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    private GroceryReservationStatus status = GroceryReservationStatus.RESERVED;

    @NotNull
    @Column(name = "reserved_at", nullable = false)
    private OffsetDateTime reservedAt;

    @Column(name = "redeemed_at")
    private OffsetDateTime redeemedAt;

    @Column(name = "cancelled_at")
    private OffsetDateTime cancelledAt;

    @NotNull
    @Column(name = "expires_at", nullable = false)
    private OffsetDateTime expiresAt;
}


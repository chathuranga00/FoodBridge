package com.ecoconnect.foodbridge.model;

import com.ecoconnect.foodbridge.model.enums.GroceryOfferStatus;
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
@Table(name = "grocery_offers")
public class GroceryOffer extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "business_id", nullable = false)
    private Business business;

    @NotBlank
    @Size(max = 200)
    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "category", length = 100)
    private String category;

    @Column(name = "image_url", length = 500)
    private String imageUrl;

    @NotNull
    @Column(name = "original_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal originalPrice;

    @NotNull
    @Column(name = "discounted_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal discountedPrice;

    @Builder.Default
    @NotBlank
    @Size(max = 10)
    @Column(name = "currency", nullable = false, length = 10)
    private String currency = "LKR";

    @NotNull
    @Column(name = "available_quantity", nullable = false)
    private Integer availableQuantity;

    /**
     * Best-Before date indicates quality peak, not safe-consumption expiry.
     * Distinct from Use-By date.
     */
    @Column(name = "best_before_date")
    private OffsetDateTime bestBeforeDate;

    @NotNull
    @Column(name = "expiry_date", nullable = false)
    private OffsetDateTime expiryDate;

    @Column(name = "pickup_start")
    private OffsetDateTime pickupStart;

    @Column(name = "pickup_end")
    private OffsetDateTime pickupEnd;

    @Column(name = "pickup_address")
    private String pickupAddress;

    @Builder.Default
    @Column(name = "safety_confirmed", nullable = false)
    private Boolean safetyConfirmed = false;

    @NotNull
    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    private GroceryOfferStatus status = GroceryOfferStatus.AVAILABLE;
}

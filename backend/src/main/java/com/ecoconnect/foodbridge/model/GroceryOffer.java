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

    @NotNull
    @Column(name = "expiry_date", nullable = false)
    private OffsetDateTime expiryDate;

    @NotNull
    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    private GroceryOfferStatus status = GroceryOfferStatus.AVAILABLE;
}


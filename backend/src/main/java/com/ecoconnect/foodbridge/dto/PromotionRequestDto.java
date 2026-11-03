package com.ecoconnect.foodbridge.dto;

import com.ecoconnect.foodbridge.model.enums.PromotionType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PromotionRequestDto {

    @NotBlank(message = "Promotion title is required")
    @Size(max = 200)
    private String title;

    private String description;

    @NotNull(message = "Promotion type is required")
    private PromotionType promotionType;

    @Size(max = 500)
    private String bannerUrl;

    @Size(max = 100)
    private String targetAudience;

    @Size(max = 50)
    private String promoCode;

    @Size(max = 255)
    private String discountDetails;

    @Size(max = 500)
    private String ctaLink;

    @NotNull(message = "Start date is required")
    private OffsetDateTime startDate;

    @NotNull(message = "End date is required")
    private OffsetDateTime endDate;

    private BigDecimal costLkr;

    private Boolean isActive;
}


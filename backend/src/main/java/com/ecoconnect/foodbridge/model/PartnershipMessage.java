package com.ecoconnect.foodbridge.model;

import com.ecoconnect.foodbridge.model.enums.ContributionType;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
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
@Table(name = "partnership_messages")
public class PartnershipMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "partnership_id", nullable = false)
    private Partnership partnership;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_user_id", nullable = false)
    private User senderUser;

    @NotBlank
    @Column(name = "sender_role", nullable = false, length = 30)
    private String senderRole;

    @NotBlank
    @Column(name = "sender_name", nullable = false, length = 150)
    private String senderName;

    @NotBlank
    @Column(name = "message_text", columnDefinition = "TEXT", nullable = false)
    private String messageText;

    @NotNull
    @Builder.Default
    @Column(name = "is_counter_proposal", nullable = false)
    private Boolean isCounterProposal = false;

    @Enumerated(EnumType.STRING)
    @Column(name = "counter_contribution_type", length = 50)
    private ContributionType counterContributionType;

    @Column(name = "counter_monetary_amount", precision = 12, scale = 2)
    private BigDecimal counterMonetaryAmount;

    @Column(name = "counter_quantity")
    private Integer counterQuantity;

    @Column(name = "counter_unit", length = 50)
    private String counterUnit;

    @Column(name = "counter_item_description", length = 255)
    private String counterItemDescription;

    @Column(name = "counter_recognition", length = 150)
    private String counterRecognition;

    @NotNull
    @Builder.Default
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt = OffsetDateTime.now();
}


package com.ecoconnect.foodbridge.model.enums;

/**
 * Enforces Rule 5: No payment processing - contributions are only recorded
 * and confirmed by the receiving charity.
 */
public enum ContributionStatus {
    PENDING_CONFIRMATION,
    CONFIRMED,
    REJECTED,
    CANCELLED
}


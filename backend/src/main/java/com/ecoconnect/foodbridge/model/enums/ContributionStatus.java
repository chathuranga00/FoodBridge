package com.ecoconnect.foodbridge.model.enums;

/**
 * Enforces Rule 5 & Rule 8:
 * No payment processing - contributions are only recorded as pledges,
 * confirmed by the receiving charity, and tracked through distribution with evidence.
 * Kept fully separate from platform subscription revenue.
 */
public enum ContributionStatus {
    PLEDGED,
    PENDING_CONFIRMATION,
    CONFIRMED,
    DISTRIBUTED,
    REJECTED,
    CANCELLED
}

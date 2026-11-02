package com.ecoconnect.foodbridge.model.enums;

/**
 * Enforces Rule 4: Only VERIFIED, COMPLETED activities count toward impact statistics.
 */
public enum ActivityStatus {
    PENDING,
    IN_PROGRESS,
    VERIFIED,
    COMPLETED,
    REJECTED
}


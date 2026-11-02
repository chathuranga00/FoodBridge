package com.ecoconnect.foodbridge.model.enums;

/**
 * Enforces Rule 3: Campaigns need admin approval before going public.
 */
public enum CampaignStatus {
    PENDING_APPROVAL,
    APPROVED,
    REJECTED,
    ACTIVE,
    COMPLETED,
    CANCELLED
}


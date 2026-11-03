-- =============================================================================
-- V11: Business Subscriptions, Feature Gating, and Sponsored Campaigns
-- =============================================================================

CREATE TABLE business_subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    business_id UUID NOT NULL,
    plan VARCHAR(30) NOT NULL,
    billing_cycle VARCHAR(30) NOT NULL DEFAULT 'MONTHLY',
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING_ACTIVATION',
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    price_lkr NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    invoice_number VARCHAR(100),
    payment_method VARCHAR(50) DEFAULT 'MANUAL_BANK_TRANSFER',
    payment_reference VARCHAR(255),
    notes TEXT,
    activated_at TIMESTAMP WITH TIME ZONE,
    activated_by UUID,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_bus_subs_business FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE,
    CONSTRAINT fk_bus_subs_activated_by FOREIGN KEY (activated_by) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT chk_bus_subs_plan CHECK (plan IN ('FREE', 'PROMOTION', 'PREMIUM')),
    CONSTRAINT chk_bus_subs_cycle CHECK (billing_cycle IN ('MONTHLY', 'ANNUAL')),
    CONSTRAINT chk_bus_subs_status CHECK (status IN ('PENDING_ACTIVATION', 'ACTIVE', 'EXPIRED', 'CANCELLED'))
);

CREATE INDEX idx_bus_subs_business_id ON business_subscriptions(business_id);
CREATE INDEX idx_bus_subs_status ON business_subscriptions(status);
CREATE INDEX idx_bus_subs_plan ON business_subscriptions(plan);
CREATE INDEX idx_bus_subs_created_at ON business_subscriptions(created_at);

-- Add sponsor support to campaigns table for sponsored sustainability campaigns
ALTER TABLE campaigns ADD COLUMN sponsor_business_id UUID;
ALTER TABLE campaigns ADD COLUMN is_sponsored BOOLEAN DEFAULT FALSE;
ALTER TABLE campaigns ADD COLUMN sponsorship_message VARCHAR(255);
ALTER TABLE campaigns ADD COLUMN sponsorship_amount NUMERIC(12, 2);

ALTER TABLE campaigns ADD CONSTRAINT fk_campaign_sponsor_business FOREIGN KEY (sponsor_business_id) REFERENCES businesses(id) ON DELETE SET NULL;


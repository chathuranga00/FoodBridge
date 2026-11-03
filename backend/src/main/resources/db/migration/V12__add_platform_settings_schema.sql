-- =============================================================================
-- V12: Platform Settings Schema & Default Values
-- Administrator dashboard configuration and operational toggles
-- =============================================================================

CREATE TABLE platform_settings (
    id VARCHAR(50) PRIMARY KEY,
    platform_name VARCHAR(100) NOT NULL,
    support_email VARCHAR(255) NOT NULL,
    support_phone VARCHAR(50),
    contact_address VARCHAR(255),
    maintenance_mode BOOLEAN NOT NULL DEFAULT FALSE,
    require_document_verification BOOLEAN NOT NULL DEFAULT TRUE,
    min_food_expiry_hours INT NOT NULL DEFAULT 2,
    animal_welfare_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    grocery_coupons_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    email_notifications_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    bank_name VARCHAR(100) DEFAULT 'Bank of Ceylon',
    bank_account_name VARCHAR(150) DEFAULT 'FoodBridge (Pvt) Ltd',
    bank_account_number VARCHAR(50) DEFAULT '000847291038',
    bank_branch VARCHAR(100) DEFAULT 'Corporate Branch, Colombo 01',
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO platform_settings (
    id, platform_name, support_email, support_phone, contact_address,
    maintenance_mode, require_document_verification, min_food_expiry_hours,
    animal_welfare_enabled, grocery_coupons_enabled, email_notifications_enabled,
    bank_name, bank_account_name, bank_account_number, bank_branch
) VALUES (
    'DEFAULT',
    'FoodBridge Sri Lanka',
    'support@foodbridge.lk',
    '+94 11 234 5678',
    '100 Galle Road, Colombo 03, Sri Lanka',
    FALSE,
    TRUE,
    2,
    TRUE,
    TRUE,
    TRUE,
    'Bank of Ceylon',
    'FoodBridge (Pvt) Ltd',
    '000847291038',
    'Corporate Branch, Colombo 01'
);

-- Admin campaign featured flag
ALTER TABLE campaigns ADD COLUMN is_featured BOOLEAN DEFAULT FALSE;

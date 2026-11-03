-- =============================================================================
-- V8: Business Public Profiles, Featured Listings, Promotions & Promo Analytics
-- =============================================================================

-- 1. Add featured profile columns to businesses table
ALTER TABLE businesses ADD COLUMN is_featured BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE businesses ADD COLUMN featured_until TIMESTAMP WITH TIME ZONE;

CREATE INDEX idx_businesses_is_featured ON businesses(is_featured);

-- 2. Add description, promotion_type, promo details, featured flag, and analytics to promotions table
ALTER TABLE promotions ADD COLUMN description TEXT;
ALTER TABLE promotions ADD COLUMN promotion_type VARCHAR(50) NOT NULL DEFAULT 'PROMOTIONAL_OFFER';
ALTER TABLE promotions ADD COLUMN promo_code VARCHAR(50);
ALTER TABLE promotions ADD COLUMN discount_details VARCHAR(255);
ALTER TABLE promotions ADD COLUMN cta_link VARCHAR(500);
ALTER TABLE promotions ADD COLUMN is_featured BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE promotions ADD COLUMN views_count BIGINT NOT NULL DEFAULT 0;
ALTER TABLE promotions ADD COLUMN clicks_count BIGINT NOT NULL DEFAULT 0;
ALTER TABLE promotions ADD COLUMN redemptions_count BIGINT NOT NULL DEFAULT 0;

CREATE INDEX idx_promotions_is_featured ON promotions(is_featured);
CREATE INDEX idx_promotions_is_active ON promotions(is_active);
CREATE INDEX idx_promotions_type ON promotions(promotion_type);


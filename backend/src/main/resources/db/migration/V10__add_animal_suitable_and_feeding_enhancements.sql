-- =============================================================================
-- V10: Animal Suitable flag on food listings, Feeding Location enhancements,
-- and Animal Feed Requirements table (Rule 7 enforcement)
-- =============================================================================

-- 1. Add animal_suitable flag to food_listings
ALTER TABLE food_listings ADD COLUMN animal_suitable BOOLEAN NOT NULL DEFAULT FALSE;
CREATE INDEX idx_food_listings_animal_suitable ON food_listings(animal_suitable);

-- 2. Enhance animal_locations with city, address_line, and urgency_level
ALTER TABLE animal_locations ADD COLUMN city VARCHAR(100);
ALTER TABLE animal_locations ADD COLUMN address_line VARCHAR(255);
ALTER TABLE animal_locations ADD COLUMN urgency_level VARCHAR(30) DEFAULT 'NORMAL';

-- 3. Create animal_feed_requirements table for verified animal orgs to publish requirements
CREATE TABLE animal_feed_requirements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    animal_org_id UUID NOT NULL,
    title VARCHAR(200) NOT NULL,
    animal_types VARCHAR(100) NOT NULL,
    suitable_feed_types TEXT NOT NULL,
    prohibited_items TEXT,
    daily_quantity_needed NUMERIC(10, 2),
    unit VARCHAR(20),
    urgency VARCHAR(30) NOT NULL DEFAULT 'MEDIUM',
    delivery_or_pickup_instructions TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_feed_req_org FOREIGN KEY (animal_org_id) REFERENCES animal_organizations(id) ON DELETE CASCADE,
    CONSTRAINT chk_feed_req_urgency CHECK (urgency IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL'))
);

CREATE INDEX idx_feed_req_org_id ON animal_feed_requirements(animal_org_id);
CREATE INDEX idx_feed_req_active ON animal_feed_requirements(is_active);


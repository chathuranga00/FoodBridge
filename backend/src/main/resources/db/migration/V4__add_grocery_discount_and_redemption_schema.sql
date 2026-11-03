-- =============================================================================
-- Migration V4: Add Grocery Discount Offer fields and Grocery Reservations
-- =============================================================================

ALTER TABLE grocery_offers ADD COLUMN best_before_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE grocery_offers ADD COLUMN pickup_start TIMESTAMP WITH TIME ZONE;
ALTER TABLE grocery_offers ADD COLUMN pickup_end TIMESTAMP WITH TIME ZONE;
ALTER TABLE grocery_offers ADD COLUMN category VARCHAR(100);
ALTER TABLE grocery_offers ADD COLUMN image_url VARCHAR(500);
ALTER TABLE grocery_offers ADD COLUMN safety_confirmed BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE grocery_offers ADD COLUMN pickup_address VARCHAR(255);

CREATE INDEX idx_grocery_offers_category ON grocery_offers(category);
CREATE INDEX idx_grocery_offers_pickup_end ON grocery_offers(pickup_end);

-- -----------------------------------------------------------------------------
-- Grocery Reservations (Unique coupon / redemption code per reservation)
-- -----------------------------------------------------------------------------
CREATE TABLE grocery_reservations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    offer_id UUID NOT NULL REFERENCES grocery_offers(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    redemption_code VARCHAR(50) NOT NULL UNIQUE,
    quantity INT NOT NULL DEFAULT 1,
    unit_price DECIMAL(10, 2) NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'RESERVED',
    reserved_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    redeemed_at TIMESTAMP WITH TIME ZONE,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_grocery_reservations_status CHECK (status IN ('RESERVED', 'REDEEMED', 'CANCELLED', 'EXPIRED')),
    CONSTRAINT chk_grocery_reservations_qty CHECK (quantity > 0)
);

CREATE INDEX idx_grocery_reservations_offer_id ON grocery_reservations(offer_id);
CREATE INDEX idx_grocery_reservations_user_id ON grocery_reservations(user_id);
CREATE INDEX idx_grocery_reservations_code ON grocery_reservations(redemption_code);
CREATE INDEX idx_grocery_reservations_status ON grocery_reservations(status);
CREATE INDEX idx_grocery_reservations_expires_at ON grocery_reservations(expires_at);

-- Migration: Add image_url and food_safety_confirmed to food_listings, and quantity_kg to activity_records

ALTER TABLE food_listings ADD COLUMN image_url VARCHAR(500);
ALTER TABLE food_listings ADD COLUMN food_safety_confirmed BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE activity_records ADD COLUMN quantity_kg DECIMAL(10, 2);


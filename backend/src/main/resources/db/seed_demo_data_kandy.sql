-- =============================================================================
-- FoodBridge Demo Data Seed Script (Kandy & Central Province, Sri Lanka)
-- Team EcoConnect - Sri Lanka
--
-- This script populates high-fidelity, realistic demonstration data:
--   - 13 demo accounts covering all platform roles (ADMIN, RESTAURANT, GROCERY, CHARITY, ANIMAL_ORG, USER)
--   - 4 verified restaurants (Kandy City, Dalada Veediya, Peradeniya, Hanthana)
--   - 3 verified grocery shops (Peradeniya, Katugastota, Digana)
--   - 2 verified charities (Kandy Central, Gampola & Nawalapitiya)
--   - 1 verified animal welfare organization (Kundasale Sanctuary) with 3 feeding points & requirements
--   - 5 community campaigns with varied progress (85%, 50%, 25%, 60%, 100%)
--   - Sample food listings (Cooked meals, bakery, animal-suitable items, collected listings)
--   - Sample grocery discount offers (produce, dairy, bakery, fruits, staples)
--   - 1 completed CSR partnership with message history and active sponsor recognition
--   - 3 volunteer events (food distribution, animal care, supply drive) with attended hours
--   - 5 completed activity & impact records (1,450 kg food rescued, 2,900 meals, 3,625 kg CO2e saved)
--   - Business subscription plans (Premium, Promotion, Free)
--
-- ALL DEMO DATA IS CLEARLY LABELED WITH [DEMO DATA] OR (Demo Data).
--
-- PASSWORDS:
--   ADMIN:      Admin@FoodBridge2026
--   ALL OTHERS: Demo@FoodBridge2026!
-- =============================================================================

BEGIN;

-- =============================================================================
-- 1. DEMO USERS
-- =============================================================================
INSERT INTO users (id, email, password_hash, full_name, phone_number, role, is_active, created_at, updated_at)
VALUES
  -- Admin
  ('a1000000-0000-0000-0000-000000000001', 'admin@foodbridge.lk', '$2a$10$ztM9S2.p9VsS1.56paa.1.nwcTzg8ffOOuq5xf6HMzEcne7YC7aEe', 'FoodBridge Platform Administrator [DEMO]', '+94112345678', 'ADMIN', true, NOW() - INTERVAL '60 days', NOW()),
  -- Restaurants
  ('a1000000-0000-0000-0000-000000000002', 'restaurant@foodbridge.lk', '$2a$10$5xNzz9CC/hFZaIWMRLxet.Dk/PxDJ8txyc4GpXkt95TCdszPOTny6', 'Chef Sunimal Perera [DEMO]', '+94812234001', 'RESTAURANT', true, NOW() - INTERVAL '50 days', NOW()),
  ('a1000000-0000-0000-0000-000000000003', 'devon.bakery@foodbridge.lk', '$2a$10$5xNzz9CC/hFZaIWMRLxet.Dk/PxDJ8txyc4GpXkt95TCdszPOTny6', 'Gamini Jayasuriya [DEMO]', '+94812234002', 'RESTAURANT', true, NOW() - INTERVAL '45 days', NOW()),
  ('a1000000-0000-0000-0000-000000000004', 'peradeniya.curry@foodbridge.lk', '$2a$10$5xNzz9CC/hFZaIWMRLxet.Dk/PxDJ8txyc4GpXkt95TCdszPOTny6', 'Manjula Rathnayake [DEMO]', '+94812234003', 'RESTAURANT', true, NOW() - INTERVAL '40 days', NOW()),
  ('a1000000-0000-0000-0000-000000000005', 'hillside.spice@foodbridge.lk', '$2a$10$5xNzz9CC/hFZaIWMRLxet.Dk/PxDJ8txyc4GpXkt95TCdszPOTny6', 'Chandana Alahakoon [DEMO]', '+94812234004', 'RESTAURANT', true, NOW() - INTERVAL '35 days', NOW()),
  -- Groceries
  ('a1000000-0000-0000-0000-000000000006', 'grocery@foodbridge.lk', '$2a$10$5xNzz9CC/hFZaIWMRLxet.Dk/PxDJ8txyc4GpXkt95TCdszPOTny6', 'Nimali Jayawardena [DEMO]', '+94812235001', 'GROCERY', true, NOW() - INTERVAL '40 days', NOW()),
  ('a1000000-0000-0000-0000-000000000007', 'cargills.katugastota@foodbridge.lk', '$2a$10$5xNzz9CC/hFZaIWMRLxet.Dk/PxDJ8txyc4GpXkt95TCdszPOTny6', 'Roshan Ranasinghe [DEMO]', '+94812235002', 'GROCERY', true, NOW() - INTERVAL '35 days', NOW()),
  ('a1000000-0000-0000-0000-000000000008', 'digana.harvest@foodbridge.lk', '$2a$10$5xNzz9CC/hFZaIWMRLxet.Dk/PxDJ8txyc4GpXkt95TCdszPOTny6', 'Kithsiri Abeyratne [DEMO]', '+94812235003', 'GROCERY', true, NOW() - INTERVAL '30 days', NOW()),
  -- Charities
  ('a1000000-0000-0000-0000-000000000009', 'charity@foodbridge.lk', '$2a$10$5xNzz9CC/hFZaIWMRLxet.Dk/PxDJ8txyc4GpXkt95TCdszPOTny6', 'Dr. Rohana Wijesinghe [DEMO]', '+94812236001', 'CHARITY', true, NOW() - INTERVAL '50 days', NOW()),
  ('a1000000-0000-0000-0000-000000000010', 'centralhills.trust@foodbridge.lk', '$2a$10$5xNzz9CC/hFZaIWMRLxet.Dk/PxDJ8txyc4GpXkt95TCdszPOTny6', 'Rev. Sister Mary Theresa [DEMO]', '+94812236002', 'CHARITY', true, NOW() - INTERVAL '45 days', NOW()),
  -- Animal Organization
  ('a1000000-0000-0000-0000-000000000011', 'animalorg@foodbridge.lk', '$2a$10$5xNzz9CC/hFZaIWMRLxet.Dk/PxDJ8txyc4GpXkt95TCdszPOTny6', 'Anula Bandara [DEMO]', '+94812237001', 'ANIMAL_ORG', true, NOW() - INTERVAL '40 days', NOW()),
  -- Public Users & Volunteers
  ('a1000000-0000-0000-0000-000000000012', 'volunteer@foodbridge.lk', '$2a$10$5xNzz9CC/hFZaIWMRLxet.Dk/PxDJ8txyc4GpXkt95TCdszPOTny6', 'Kasun Senanayake [DEMO]', '+94771238001', 'USER', true, NOW() - INTERVAL '30 days', NOW()),
  ('a1000000-0000-0000-0000-000000000013', 'citizen@foodbridge.lk', '$2a$10$5xNzz9CC/hFZaIWMRLxet.Dk/PxDJ8txyc4GpXkt95TCdszPOTny6', 'Priyantha Dissanayake [DEMO]', '+94771238002', 'USER', true, NOW() - INTERVAL '25 days', NOW())
ON CONFLICT (email) DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  full_name = EXCLUDED.full_name,
  is_active = true,
  updated_at = NOW();

-- =============================================================================
-- 2. BUSINESSES (4 Restaurants, 3 Groceries in Kandy & Central Province)
-- =============================================================================
INSERT INTO businesses (id, user_id, business_name, business_type, registration_number, contact_person, contact_email, contact_phone, address_line1, address_line2, city, district, latitude, longitude, verification_status, verified_at, verified_by, verification_notes, created_at, updated_at)
VALUES
  -- Restaurant 1: The Royal Kandyan Resto
  ('b1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000002', 'The Royal Kandyan Resto [DEMO DATA]', 'RESTAURANT', 'BRC-KND-REST-001', 'Chef Sunimal Perera', 'resto@foodbridge.lk', '+94812234001', '12 Dalada Veediya, Kandy', 'City Center', 'Kandy', 'Kandy', 7.2906, 80.6337, 'VERIFIED', NOW() - INTERVAL '49 days', 'a1000000-0000-0000-0000-000000000001', 'Admin verified city center buffet restaurant [DEMO]', NOW() - INTERVAL '50 days', NOW()),
  -- Restaurant 2: Devon Heritage Bakery & Tea Lounge
  ('b1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000003', 'Devon Heritage Bakery & Tea Lounge [DEMO DATA]', 'RESTAURANT', 'BRC-KND-REST-002', 'Gamini Jayasuriya', 'devon.bakery@foodbridge.lk', '+94812234002', '22 Dalada Veediya, Kandy', 'Heritage Quarter', 'Kandy', 'Kandy', 7.2930, 80.6380, 'VERIFIED', NOW() - INTERVAL '44 days', 'a1000000-0000-0000-0000-000000000001', 'Verified landmark Kandy bakery [DEMO]', NOW() - INTERVAL '45 days', NOW()),
  -- Restaurant 3: Peradeniya Riverside Curry Pot
  ('b1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000004', 'Peradeniya Riverside Curry Pot [DEMO DATA]', 'RESTAURANT', 'BRC-KND-REST-003', 'Manjula Rathnayake', 'peradeniya.curry@foodbridge.lk', '+94812234003', '85 Peradeniya Road, Peradeniya', 'Near Botanical Gardens', 'Peradeniya', 'Kandy', 7.2580, 80.5970, 'VERIFIED', NOW() - INTERVAL '39 days', 'a1000000-0000-0000-0000-000000000001', 'Verified rice and curry provider [DEMO]', NOW() - INTERVAL '40 days', NOW()),
  -- Restaurant 4: Kandy Hillside Spice Kitchen
  ('b1000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000005', 'Kandy Hillside Spice Kitchen [DEMO DATA]', 'RESTAURANT', 'BRC-KND-REST-004', 'Chandana Alahakoon', 'hillside.spice@foodbridge.lk', '+94812234004', '40 Hanthana Road, Kandy', 'Hanthana Foothills', 'Kandy', 'Kandy', 7.2800, 80.6250, 'VERIFIED', NOW() - INTERVAL '34 days', 'a1000000-0000-0000-0000-000000000001', 'Verified hillside sustainable kitchen [DEMO]', NOW() - INTERVAL '35 days', NOW()),
  -- Grocery 1: Kandy Central Green Grocers
  ('b1000000-0000-0000-0000-000000000005', 'a1000000-0000-0000-0000-000000000006', 'Kandy Central Green Grocers [DEMO DATA]', 'GROCERY', 'BRC-KND-GROC-001', 'Nimali Jayawardena', 'grocery@foodbridge.lk', '+94812235001', '10 Peradeniya Market Junction', 'Peradeniya Market', 'Peradeniya', 'Kandy', 7.2610, 80.5980, 'VERIFIED', NOW() - INTERVAL '39 days', 'a1000000-0000-0000-0000-000000000001', 'Verified fresh produce grocer [DEMO]', NOW() - INTERVAL '40 days', NOW()),
  -- Grocery 2: Cargills Food City Katugastota
  ('b1000000-0000-0000-0000-000000000006', 'a1000000-0000-0000-0000-000000000007', 'Cargills Food City Katugastota [DEMO DATA]', 'GROCERY', 'BRC-KND-GROC-002', 'Roshan Ranasinghe', 'cargills.katugastota@foodbridge.lk', '+94812235002', '15 Kurunegala Road, Katugastota', 'Town Center', 'Katugastota', 'Kandy', 7.3260, 80.6190, 'VERIFIED', NOW() - INTERVAL '34 days', 'a1000000-0000-0000-0000-000000000001', 'Verified supermarket chain outlet [DEMO]', NOW() - INTERVAL '35 days', NOW()),
  -- Grocery 3: Digana Valley Fresh Harvest Super
  ('b1000000-0000-0000-0000-000000000007', 'a1000000-0000-0000-0000-000000000008', 'Digana Valley Fresh Harvest Super [DEMO DATA]', 'GROCERY', 'BRC-KND-GROC-003', 'Kithsiri Abeyratne', 'digana.harvest@foodbridge.lk', '+94812235003', '8 Victoria Highway, Digana', 'Victoria Valley', 'Digana', 'Kandy', 7.3000, 80.7460, 'VERIFIED', NOW() - INTERVAL '29 days', 'a1000000-0000-0000-0000-000000000001', 'Verified agricultural grocery [DEMO]', NOW() - INTERVAL '30 days', NOW())
ON CONFLICT (registration_number) DO UPDATE SET
  business_name = EXCLUDED.business_name,
  verification_status = 'VERIFIED',
  latitude = EXCLUDED.latitude,
  longitude = EXCLUDED.longitude,
  updated_at = NOW();

-- =============================================================================
-- 3. CHARITIES (2 Verified in Central Province)
-- =============================================================================
INSERT INTO charities (id, user_id, charity_name, registration_number, description, contact_person, contact_email, contact_phone, address_line1, address_line2, city, district, latitude, longitude, capacity_people, verification_status, verified_at, verified_by, verification_notes, created_at, updated_at)
VALUES
  -- Charity 1: Kandy Community Relief Foundation
  ('c1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000009', 'Kandy Community Relief Foundation [DEMO DATA]', 'NGO-KND-001', 'Non-profit community foundation coordinating daily hot meal distribution for children and low-income families.', 'Dr. Rohana Wijesinghe', 'charity@foodbridge.lk', '+94812236001', '50 Ampitiya Road, Kandy', 'Central District', 'Kandy', 'Kandy', 7.2880, 80.6450, 450, 'VERIFIED', NOW() - INTERVAL '49 days', 'a1000000-0000-0000-0000-000000000001', 'Verified community non-profit foundation [DEMO]', NOW() - INTERVAL '50 days', NOW()),
  -- Charity 2: Central Hills Hope & Nutrition Trust
  ('c1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000010', 'Central Hills Hope & Nutrition Trust [DEMO DATA]', 'NGO-KND-002', 'Relief trust dedicated to supporting tea estate workers, elderly care homes, and rural villages across Gampola and Nawalapitiya.', 'Rev. Sister Mary Theresa', 'centralhills.trust@foodbridge.lk', '+94812236002', '14 Temple Road, Gampola', 'Hill Country Center', 'Gampola', 'Kandy', 7.1660, 80.5690, 300, 'VERIFIED', NOW() - INTERVAL '44 days', 'a1000000-0000-0000-0000-000000000001', 'Verified upcountry nutrition trust [DEMO]', NOW() - INTERVAL '45 days', NOW())
ON CONFLICT (registration_number) DO UPDATE SET
  charity_name = EXCLUDED.charity_name,
  verification_status = 'VERIFIED',
  latitude = EXCLUDED.latitude,
  longitude = EXCLUDED.longitude,
  updated_at = NOW();

-- =============================================================================
-- 4. ANIMAL WELFARE ORGANIZATION (1 Verified in Kundasale)
-- =============================================================================
INSERT INTO animal_organizations (id, user_id, organization_name, registration_number, animal_types, shelter_capacity, contact_person, contact_email, contact_phone, address_line1, address_line2, city, district, latitude, longitude, verification_status, verified_at, verified_by, verification_notes, created_at, updated_at)
VALUES
  ('c2000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000011', 'Kandy Street Animal Care & Welfare Society [DEMO DATA]', 'AW-KND-001', 'Street Dogs, Sanctuary Cats, Community Cattle', 180, 'Anula Bandara', 'animalorg@foodbridge.lk', '+94812237001', 'Kundasale Animal Sanctuary, Digana Road', 'Sanctuary Grounds', 'Kundasale', 'Kandy', 7.2860, 80.6810, 'VERIFIED', NOW() - INTERVAL '39 days', 'a1000000-0000-0000-0000-000000000001', 'Verified animal welfare rescue sanctuary [DEMO]', NOW() - INTERVAL '40 days', NOW())
ON CONFLICT (registration_number) DO UPDATE SET
  organization_name = EXCLUDED.organization_name,
  verification_status = 'VERIFIED',
  latitude = EXCLUDED.latitude,
  longitude = EXCLUDED.longitude,
  updated_at = NOW();

-- Registered Feeding Locations
INSERT INTO animal_locations (id, animal_org_id, location_name, target_animals, animal_count, feeding_time, latitude, longitude, city, address_line, urgency_level, is_active, created_at, updated_at)
VALUES
  ('c3000000-0000-0000-0000-000000000001', 'c2000000-0000-0000-0000-000000000001', 'Kundasale Sanctuary Animal Feeding Point [DEMO DATA]', 'DOG', 65, 'Daily 8:00 AM & 5:00 PM', 7.2860, 80.6810, 'Kundasale', 'Kundasale Sanctuary Main Yard', 'NORMAL', true, NOW() - INTERVAL '30 days', NOW()),
  ('c3000000-0000-0000-0000-000000000002', 'c2000000-0000-0000-0000-000000000001', 'Katugastota Mahaweli Riverbank Feeding Spot [DEMO DATA]', 'DOG_CAT', 40, 'Every evening at 6:00 PM', 7.3240, 80.6170, 'Katugastota', 'Near Mahaweli Bridge Riverbank', 'NORMAL', true, NOW() - INTERVAL '25 days', NOW()),
  ('c3000000-0000-0000-0000-000000000003', 'c2000000-0000-0000-0000-000000000001', 'Digana Victoria Reservoir Foothills Habitat [DEMO DATA]', 'MIXED_COMMUNITY', 50, 'Morning 7:30 AM', 7.2980, 80.7440, 'Digana', 'Victoria Dam Foothills Approach', 'NORMAL', true, NOW() - INTERVAL '20 days', NOW())
ON CONFLICT (id) DO NOTHING;

-- Animal Feed Requirements (Rule 7 Separation Enforced)
INSERT INTO animal_feed_requirements (id, animal_org_id, title, animal_types, suitable_feed_types, prohibited_items, daily_quantity_needed, unit, urgency, delivery_or_pickup_instructions, is_active, created_at, updated_at)
VALUES
  ('c4000000-0000-0000-0000-000000000001', 'c2000000-0000-0000-0000-000000000001', 'Cooked Rice, Fish Broth & Poultry Leftovers for Sanctuary Dogs [DEMO DATA]', 'Dogs, Puppies', 'Cooked plain rice, fish scrap broth, unseasoned chicken necks & cartilage.', 'STRICTLY NO ONIONS, GARLIC, SPICES, OR CHOCOLATE.', 50.00, 'kg', 'HIGH', 'Please deliver to Kundasale sanctuary gate before 4:00 PM daily.', true, NOW() - INTERVAL '25 days', NOW()),
  ('c4000000-0000-0000-0000-000000000002', 'c2000000-0000-0000-0000-000000000001', 'Clean Vegetable Trimmings & Day-End Bread Ends [DEMO DATA]', 'Shelter animals, Herbivores', 'Carrot tops, cabbage outer leaves, plain day-end bread, boiled pumpkin.', 'No moldy items, spicy gravies, or onion trimmings.', 25.00, 'kg', 'MEDIUM', 'Drop off at Katugastota hub or call for volunteer pickup.', true, NOW() - INTERVAL '20 days', NOW())
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- 5. BUSINESS SUBSCRIPTIONS (Rule 8 Financial Segregation)
-- =============================================================================
INSERT INTO business_subscriptions (id, business_id, plan_name, billing_cycle, price, start_date, end_date, status, payment_reference, activated_by, created_at, updated_at)
VALUES
  ('s1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001', 'PREMIUM', 'ANNUAL', 48000.00, NOW() - INTERVAL '40 days', NOW() + INTERVAL '325 days', 'ACTIVE', 'MANUAL-ADMIN-ACT-001', 'a1000000-0000-0000-0000-000000000001', NOW() - INTERVAL '40 days', NOW()),
  ('s1000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000002', 'PROMOTION', 'MONTHLY', 5000.00, NOW() - INTERVAL '20 days', NOW() + INTERVAL '10 days', 'ACTIVE', 'MANUAL-ADMIN-ACT-002', 'a1000000-0000-0000-0000-000000000001', NOW() - INTERVAL '20 days', NOW()),
  ('s1000000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000006', 'PREMIUM', 'MONTHLY', 6000.00, NOW() - INTERVAL '15 days', NOW() + INTERVAL '15 days', 'ACTIVE', 'MANUAL-ADMIN-ACT-003', 'a1000000-0000-0000-0000-000000000001', NOW() - INTERVAL '15 days', NOW())
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- 6. COMMUNITY CAMPAIGNS (5 Campaigns with varied progress)
-- =============================================================================
INSERT INTO campaigns (id, charity_id, animal_org_id, title, description, need_type, target_quantity, unit, current_quantity, target_amount, current_amount, start_date, end_date, status, latitude, longitude, approved_by, approved_at, is_sponsored, sponsored_by_business_id, sponsor_recognition_text, created_at, updated_at)
VALUES
  -- Campaign 1: 85% Progress (Charity 1, Sponsored by Devon Bakery)
  ('d1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000001', null, 'Midday Meals for Rural School Children in Gampola [DEMO DATA]', 'Providing wholesome hot lunch packs (red rice, dhal, fresh greens, egg) for 200 disadvantaged rural school students in Gampola for the school term.', 'FOOD', 2000, 'Meals', 1700, 400000.00, 340000.00, CURRENT_DATE - INTERVAL '28 days', CURRENT_DATE + INTERVAL '28 days', 'ACTIVE', 7.1650, 80.5680, 'a1000000-0000-0000-0000-000000000001', NOW() - INTERVAL '27 days', true, 'b1000000-0000-0000-0000-000000000002', 'Sponsored by Devon Heritage Bakery', NOW() - INTERVAL '28 days', NOW()),
  -- Campaign 2: 50% Progress (Charity 2 - Nawalapitiya)
  ('d1000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000002', null, 'Clean Water & Nutrition Rations for Tea Estate Families - Nawalapitiya [DEMO DATA]', 'Distributing monthly dry ration parcels (rice, dhal, milk powder, tea, canned fish) to 250 tea plantation families facing severe seasonal food insecurity.', 'FOOD', 1000, 'Ration Kits', 500, 500000.00, 250000.00, CURRENT_DATE - INTERVAL '21 days', CURRENT_DATE + INTERVAL '35 days', 'ACTIVE', 7.0540, 80.5330, 'a1000000-0000-0000-0000-000000000001', NOW() - INTERVAL '20 days', false, null, null, NOW() - INTERVAL '21 days', NOW()),
  -- Campaign 3: 25% Progress (Charity 1 - Teldeniya)
  ('d1000000-0000-0000-0000-000000000003', 'c1000000-0000-0000-0000-000000000001', null, 'Emergency Food Relief for Vulnerable Elders in Teldeniya [DEMO DATA]', 'Weekly nutrition packs, fortified grains, and medical groceries delivered directly to homebound elderly citizens across Teldeniya and Victoria Valley.', 'FOOD', 500, 'Care Kits', 125, 250000.00, 62500.00, CURRENT_DATE - INTERVAL '7 days', CURRENT_DATE + INTERVAL '49 days', 'ACTIVE', 7.3050, 80.7720, 'a1000000-0000-0000-0000-000000000001', NOW() - INTERVAL '6 days', false, null, null, NOW() - INTERVAL '7 days', NOW()),
  -- Campaign 4: 60% Progress (Animal Org - Kundasale, Sponsored by Cargills Food City)
  ('d1000000-0000-0000-0000-000000000004', null, 'c2000000-0000-0000-0000-000000000001', 'Community Stray Dog & Cat Nutrition Drive - Kundasale [DEMO DATA]', 'Procuring high-nutrition feed, rice, and veterinary broth to feed 180 sanctuary animals and 150 community strays around Kundasale and Digana.', 'FOOD', 1000, 'kg Feed', 600, 200000.00, 120000.00, CURRENT_DATE - INTERVAL '14 days', CURRENT_DATE + INTERVAL '42 days', 'ACTIVE', 7.2850, 80.6800, 'a1000000-0000-0000-0000-000000000001', NOW() - INTERVAL '13 days', true, 'b1000000-0000-0000-0000-000000000006', 'Sponsored by Cargills Food City', NOW() - INTERVAL '14 days', NOW()),
  -- Campaign 5: 100% Completed (Charity 2 - Knuckles)
  ('d1000000-0000-0000-0000-000000000005', 'c1000000-0000-0000-0000-000000000002', null, 'Dry Ration Supply Drive for Knuckles Foothill Villages [DEMO DATA]', 'Emergency pre-monsoon dry food distribution for 150 families in isolated Knuckles foothill villages. Successfully concluded and 100% fulfilled.', 'FOOD', 300, 'Emergency Kits', 300, 300000.00, 300000.00, CURRENT_DATE - INTERVAL '60 days', CURRENT_DATE - INTERVAL '7 days', 'COMPLETED', 7.3300, 80.7200, 'a1000000-0000-0000-0000-000000000001', NOW() - INTERVAL '59 days', false, null, null, NOW() - INTERVAL '60 days', NOW() - INTERVAL '7 days')
ON CONFLICT (id) DO NOTHING;

-- Campaign Updates
INSERT INTO campaign_updates (id, campaign_id, title, description, photo_url, distribution_date, created_at)
VALUES
  ('d2000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000001', 'Midterm Milestone Reached: 1,700 Meals Distributed!', 'Thanks to our generous community donors and Devon Bakery CSR, we have surpassed 1,700 hot midday meals served to primary students.', 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c', CURRENT_DATE - INTERVAL '7 days', NOW() - INTERVAL '7 days'),
  ('d2000000-0000-0000-0000-000000000002', 'd1000000-0000-0000-0000-000000000002', 'First 500 Dry Ration Kits Handed Over at Nawalapitiya Division', 'Community volunteers completed distribution of the first 500 packages at the community center.', 'https://images.unsplash.com/photo-1593113598332-cd288d649433', CURRENT_DATE - INTERVAL '5 days', NOW() - INTERVAL '5 days')
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- 7. FOOD LISTINGS (Surplus food with suitability separation)
-- =============================================================================
INSERT INTO food_listings (id, business_id, title, description, food_category, suitability_type, animal_suitable, quantity, unit, perishable, prepared_at, expiry_date, dietary_flags, storage_instructions, status, pickup_start, pickup_end, pickup_address, latitude, longitude, created_at, updated_at)
VALUES
  -- Listing 1: Available Cooked Meals
  ('e1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001', 'Surplus Traditional Rice & Curry Buffet Trays [DEMO DATA]', 'Fresh surplus from afternoon lunch buffet: steamed white rice, dhal curry, polos ambula, and tempered potato. Packed in food-grade trays.', 'Cooked Meals', 'HUMAN_CONSUMPTION', false, 25.00, 'kg', true, NOW() - INTERVAL '2 hours', NOW() + INTERVAL '6 hours', 'Vegetarian, Halal Friendly', 'Keep hot or consume within 4 hours', 'AVAILABLE', NOW() + INTERVAL '1 hour', NOW() + INTERVAL '5 hours', '12 Dalada Veediya, Kandy', 7.2906, 80.6337, NOW() - INTERVAL '2 hours', NOW()),
  -- Listing 2: Available Bakery Goods (Marked Animal Suitable)
  ('e1000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000002', 'Day-End Fresh Roast Paan, Buns & Pastries [DEMO DATA]', 'Batch of day-end freshly baked roast bread, breadcrumbs, vegetable rolls, and plain buns. Suitable for human consumption or animal welfare feed.', 'Bakery', 'HUMAN_CONSUMPTION', true, 15.00, 'kg', true, NOW() - INTERVAL '3 hours', NOW() + INTERVAL '12 hours', 'Vegetarian', 'Store dry at room temperature', 'AVAILABLE', NOW(), NOW() + INTERVAL '8 hours', '22 Dalada Veediya, Kandy', 7.2930, 80.6380, NOW() - INTERVAL '3 hours', NOW()),
  -- Listing 3: Reserved Cooked Meals
  ('e1000000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000003', 'Lunch Pack Surplus: Red Rice, Pol Sambol & Fish Curry [DEMO DATA]', '40 wrapped lunch packets packed at 11:30 AM. Stored at safe temperature, ready for charity collection.', 'Cooked Meals', 'HUMAN_CONSUMPTION', false, 20.00, 'kg', true, NOW() - INTERVAL '4 hours', NOW() + INTERVAL '5 hours', 'Contains Fish', 'Keep in insulated cooler box', 'RESERVED', NOW() - INTERVAL '1 hour', NOW() + INTERVAL '3 hours', '85 Peradeniya Road, Peradeniya', 7.2580, 80.5970, NOW() - INTERVAL '4 hours', NOW()),
  -- Listing 4: Collected Listing (Feeds Impact Dashboard)
  ('e1000000-0000-0000-0000-000000000004', 'b1000000-0000-0000-0000-000000000004', 'Nutritious Rice & Dhal Surplus for Community Kitchens [DEMO DATA]', 'Surplus bulk cooked red rice, dhal, and vegetable curry collected and distributed by Kandy Community Relief Foundation.', 'Cooked Meals', 'HUMAN_CONSUMPTION', true, 35.00, 'kg', true, NOW() - INTERVAL '24 hours', NOW() - INTERVAL '10 hours', 'Vegetarian', 'Thermal transport containers used', 'COLLECTED', NOW() - INTERVAL '18 hours', NOW() - INTERVAL '12 hours', '40 Hanthana Road, Kandy', 7.2800, 80.6250, NOW() - INTERVAL '24 hours', NOW() - INTERVAL '12 hours')
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- 8. GROCERY OFFERS (Discounted items & coupons)
-- =============================================================================
INSERT INTO grocery_offers (id, business_id, title, description, category, original_price, discounted_price, quantity_available, valid_from, valid_until, pickup_location, image_url, status, created_at, updated_at)
VALUES
  ('f1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000005', 'Fresh Upcountry Cabbage & Carrot Crates (Best Before Tomorrow) [DEMO DATA]', 'Crisp, Grade-A Nuwara Eliya cabbage and washed carrots reaching optimal sales window. 55% discount.', 'Fresh Produce', 500.00, 220.00, 20, NOW() - INTERVAL '2 hours', NOW() + INTERVAL '24 hours', '10 Peradeniya Market Junction, Peradeniya', 'https://images.unsplash.com/photo-1540420773420-3366772f4999', 'AVAILABLE', NOW() - INTERVAL '2 hours', NOW()),
  ('f1000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000005', 'Highland Fresh Milk 1L Cartons (Best-Before 2 Days) [DEMO DATA]', 'Pasteurized fresh cow milk cartons approaching best-before date. Kept strictly refrigerated at 4C.', 'Dairy', 480.00, 260.00, 15, NOW() - INTERVAL '3 hours', NOW() + INTERVAL '48 hours', '10 Peradeniya Market Junction, Peradeniya', 'https://images.unsplash.com/photo-1550583724-b2692b85b150', 'AVAILABLE', NOW() - INTERVAL '3 hours', NOW()),
  ('f1000000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000006', 'Bakery Sliced Sandwich Bread Family Loaves [DEMO DATA]', 'Standard white sliced sandwich bread family loaves fresh from morning delivery. 50% discount.', 'Bakery', 380.00, 190.00, 25, NOW() - INTERVAL '4 hours', NOW() + INTERVAL '24 hours', '15 Kurunegala Road, Katugastota', 'https://images.unsplash.com/photo-1589367920969-ab8e050bbb04', 'AVAILABLE', NOW() - INTERVAL '4 hours', NOW()),
  ('f1000000-0000-0000-0000-000000000004', 'b1000000-0000-0000-0000-000000000006', 'Mixed Tropical Fruit Boxes (Ripe Papaya & Bananas) [DEMO DATA]', 'Ready-to-eat sweet Embul bananas and ripe red papayas ideal for immediate home consumption or desserts.', 'Fruits', 750.00, 350.00, 12, NOW() - INTERVAL '1 hour', NOW() + INTERVAL '48 hours', '15 Kurunegala Road, Katugastota', 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b', 'AVAILABLE', NOW() - INTERVAL '1 hour', NOW()),
  ('f1000000-0000-0000-0000-000000000005', 'b1000000-0000-0000-0000-000000000007', 'Munchee Cream Cracker & Biscuit Bundle Pack [DEMO DATA]', 'Assorted cream cracker bundles and Marie biscuits reaching inventory turnaround date. Perfect condition.', 'Pantry Staples', 600.00, 320.00, 30, NOW() - INTERVAL '5 hours', NOW() + INTERVAL '30 days', '8 Victoria Highway, Digana', 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35', 'AVAILABLE', NOW() - INTERVAL '5 hours', NOW()),
  ('f1000000-0000-0000-0000-000000000006', 'b1000000-0000-0000-0000-000000000007', 'Surplus Cleaned Vegetable Trimmings for Animal Feeding [DEMO DATA]', 'Cleaned bulk trimmings: pumpkin rinds, carrot shavings, and cabbage leaves. Safe for animal sanctuary feeding.', 'Animal Feed', 200.00, 50.00, 40, NOW() - INTERVAL '2 hours', NOW() + INTERVAL '48 hours', '8 Victoria Highway, Digana', 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37', 'AVAILABLE', NOW() - INTERVAL '2 hours', NOW())
ON CONFLICT (id) DO NOTHING;

-- Sample Coupon Reservation
INSERT INTO grocery_reservations (id, grocery_offer_id, user_id, redemption_code, quantity, unit_price, total_price, expires_at, status, created_at, updated_at)
VALUES
  ('f2000000-0000-0000-0000-000000000001', 'f1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000013', 'GROC-KND-9821', 2, 260.00, 520.00, NOW() + INTERVAL '24 hours', 'RESERVED', NOW() - INTERVAL '4 hours', NOW())
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- 9. COMPLETED CSR PARTNERSHIP (Devon Bakery & Kandy Community Relief)
-- =============================================================================
INSERT INTO partnerships (id, business_id, charity_id, campaign_id, title, description, agreement_terms, status, initiated_by_business, start_date, end_date, reviewed_by, reviewed_at, approval_notes, proof_of_delivery_url, delivery_notes, created_at, updated_at)
VALUES
  ('p1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000001', 'CSR Partnership: Devon Bakery Midday Bun & Baked Goods Support [DEMO DATA]', 'Weekly supply of 500 fortified buns and baked rolls to augment midday meals for Gampola school children.', 'Devon Heritage Bakery supplies 500 freshly baked buns every Tuesday and Thursday directly to Kandy Community Relief collection team.', 'COMPLETED', true, CURRENT_DATE - INTERVAL '25 days', CURRENT_DATE - INTERVAL '4 days', 'a1000000-0000-0000-0000-000000000001', NOW() - INTERVAL '24 days', 'Approved by FoodBridge Admin. Highly impactful CSR partnership.', 'https://images.unsplash.com/photo-1509440159596-0249088772ff', 'Delivered 2,000 buns over 4 weeks with full distribution confirmation sign-offs.', NOW() - INTERVAL '25 days', NOW() - INTERVAL '4 days')
ON CONFLICT (id) DO NOTHING;

INSERT INTO partnership_messages (id, partnership_id, sender_id, message, created_at)
VALUES
  ('p2000000-0000-0000-0000-000000000001', 'p1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000003', 'Greetings Dr. Rohana! We are delighted to sponsor your Gampola midday meals program with daily baked rolls.', NOW() - INTERVAL '25 days'),
  ('p2000000-0000-0000-0000-000000000002', 'p1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000009', 'Thank you Mr. Jayasuriya and Devon Bakery! The students and teachers are extremely grateful for this wholesome support.', NOW() - INTERVAL '24 days'),
  ('p2000000-0000-0000-0000-000000000003', 'p1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000009', 'Confirming final dispatch of 500 buns completed yesterday. We have uploaded delivery proof.', NOW() - INTERVAL '4 days')
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- 10. VOLUNTEER OPPORTUNITIES & ATTENDANCE
-- =============================================================================
INSERT INTO volunteer_opportunities (id, creator_id, charity_id, animal_org_id, organizer_name, organizer_type, title, description, category, district, city, address, latitude, longitude, event_date, start_time, end_time, duration_hours, required_volunteers, registered_volunteers, status, created_at, updated_at)
VALUES
  -- Event 1: Active
  ('v1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000009', 'c1000000-0000-0000-0000-000000000001', null, 'Kandy Community Relief Foundation [DEMO DATA]', 'CHARITY', 'Rural School Lunchbox Packing & Distribution Drive [DEMO DATA]', 'Assist our team in packaging 500 hot meal lunchboxes and loading them into distribution vans for Gampola rural schools.', 'FOOD_DISTRIBUTION', 'Kandy', 'Peradeniya', 'Peradeniya Community Center, Station Road', 7.2600, 80.5960, CURRENT_DATE + INTERVAL '4 days', '08:30 AM', '12:30 PM', 4.0, 10, 1, 'ACTIVE', NOW() - INTERVAL '5 days', NOW()),
  -- Event 2: Completed (Animal Welfare)
  ('v1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000011', null, 'c2000000-0000-0000-0000-000000000001', 'Kandy Street Animal Care & Welfare Society [DEMO DATA]', 'ANIMAL_ORG', 'Weekend Stray Animal Feeding & Sanctuary Care [DEMO DATA]', 'Hands-on weekend feeding and medical grooming for 180 rescue dogs and sanctuary cats at Kundasale.', 'ANIMAL_WELFARE', 'Kandy', 'Kundasale', 'Kundasale Animal Sanctuary, Digana Road', 7.2860, 80.6810, CURRENT_DATE - INTERVAL '3 days', '09:00 AM', '01:00 PM', 4.0, 5, 5, 'COMPLETED', NOW() - INTERVAL '10 days', NOW() - INTERVAL '3 days'),
  -- Event 3: Completed (Relief dispatch)
  ('v1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000010', 'c1000000-0000-0000-0000-000000000002', null, 'Central Hills Hope & Nutrition Trust [DEMO DATA]', 'CHARITY', 'Knuckles Foothills Food Relief Dispatch Drive [DEMO DATA]', 'Loading 4x4 trucks and coordinating dry ration supply distribution to remote Knuckles villages.', 'SCHOOL_SUPPLIES', 'Kandy', 'Gampola', 'Gampola Central Dispatch Hub, 14 Temple Road', 7.1660, 80.5690, CURRENT_DATE - INTERVAL '7 days', '07:30 AM', '01:30 PM', 6.0, 8, 8, 'COMPLETED', NOW() - INTERVAL '14 days', NOW() - INTERVAL '7 days')
ON CONFLICT (id) DO NOTHING;

INSERT INTO volunteer_participations (id, opportunity_id, user_id, status, hours_contributed, registered_at, confirmed_at, feedback_notes, created_at, updated_at)
VALUES
  ('v2000000-0000-0000-0000-000000000001', 'v1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000012', 'REGISTERED', 0.0, NOW() - INTERVAL '1 day', null, 'Registered for morning packing shift.', NOW() - INTERVAL '1 day', NOW()),
  ('v2000000-0000-0000-0000-000000000002', 'v1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000012', 'ATTENDED', 4.0, NOW() - INTERVAL '5 days', NOW() - INTERVAL '3 days', 'Faithfully attended and completed full 4 hours of animal feeding.', NOW() - INTERVAL '5 days', NOW() - INTERVAL '3 days'),
  ('v2000000-0000-0000-0000-000000000003', 'v1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000012', 'ATTENDED', 6.0, NOW() - INTERVAL '10 days', NOW() - INTERVAL '7 days', 'Exemplary volunteer service; completed 6 hours of field distribution.', NOW() - INTERVAL '10 days', NOW() - INTERVAL '7 days')
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- 11. VERIFIED ACTIVITIES & IMPACT RECORDS (Feeds Impact Dashboard)
-- Total Food Rescued: 1,450 kg | Meals: 2,900 | CO2e Saved: 3,625 kg
-- =============================================================================
-- Activity 1: The Royal Kandyan Resto (450 kg -> 900 meals)
INSERT INTO activity_records (id, donor_id, recipient_id, listing_id, campaign_id, activity_type, quantity, unit, verification_status, status, completed_at, created_at, updated_at)
VALUES
  ('i1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000009', 'e1000000-0000-0000-0000-000000000004', 'd1000000-0000-0000-0000-000000000001', 'FOOD_RESCUE_DISTRIBUTION', 450.00, 'kg', 'VERIFIED', 'COMPLETED', NOW() - INTERVAL '6 days', NOW() - INTERVAL '6 days', NOW())
ON CONFLICT (id) DO NOTHING;

INSERT INTO impact_records (id, activity_record_id, meals_rescued, food_weight_kg, co2_savings_kg, people_fed, animals_fed, calculated_at, created_at, updated_at)
VALUES
  ('i2000000-0000-0000-0000-000000000001', 'i1000000-0000-0000-0000-000000000001', 900, 450.00, 1125.00, 450, 0, NOW() - INTERVAL '6 days', NOW() - INTERVAL '6 days', NOW())
ON CONFLICT (id) DO NOTHING;

-- Activity 2: Hillside Spice Kitchen (350 kg -> 700 meals)
INSERT INTO activity_records (id, donor_id, recipient_id, listing_id, campaign_id, activity_type, quantity, unit, verification_status, status, completed_at, created_at, updated_at)
VALUES
  ('i1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000005', 'a1000000-0000-0000-0000-000000000010', null, 'd1000000-0000-0000-0000-000000000002', 'FOOD_RESCUE_DISTRIBUTION', 350.00, 'kg', 'VERIFIED', 'COMPLETED', NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days', NOW())
ON CONFLICT (id) DO NOTHING;

INSERT INTO impact_records (id, activity_record_id, meals_rescued, food_weight_kg, co2_savings_kg, people_fed, animals_fed, calculated_at, created_at, updated_at)
VALUES
  ('i2000000-0000-0000-0000-000000000002', 'i1000000-0000-0000-0000-000000000002', 700, 350.00, 875.00, 350, 0, NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days', NOW())
ON CONFLICT (id) DO NOTHING;

-- Activity 3: Devon Heritage Bakery (250 kg -> 500 meals)
INSERT INTO activity_records (id, donor_id, recipient_id, listing_id, campaign_id, activity_type, quantity, unit, verification_status, status, completed_at, created_at, updated_at)
VALUES
  ('i1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000009', null, 'd1000000-0000-0000-0000-000000000001', 'BAKERY_RESCUE', 250.00, 'kg', 'VERIFIED', 'COMPLETED', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days', NOW())
ON CONFLICT (id) DO NOTHING;

INSERT INTO impact_records (id, activity_record_id, meals_rescued, food_weight_kg, co2_savings_kg, people_fed, animals_fed, calculated_at, created_at, updated_at)
VALUES
  ('i2000000-0000-0000-0000-000000000003', 'i1000000-0000-0000-0000-000000000003', 500, 250.00, 625.00, 250, 0, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days', NOW())
ON CONFLICT (id) DO NOTHING;

-- Activity 4: Devon Bakery Surplus to Sanctuary (200 kg -> 400 animal meals)
INSERT INTO activity_records (id, donor_id, recipient_id, listing_id, campaign_id, activity_type, quantity, unit, verification_status, status, completed_at, created_at, updated_at)
VALUES
  ('i1000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000011', null, 'd1000000-0000-0000-0000-000000000004', 'ANIMAL_FEED_RESCUE', 200.00, 'kg', 'VERIFIED', 'COMPLETED', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days', NOW())
ON CONFLICT (id) DO NOTHING;

INSERT INTO impact_records (id, activity_record_id, meals_rescued, food_weight_kg, co2_savings_kg, people_fed, animals_fed, calculated_at, created_at, updated_at)
VALUES
  ('i2000000-0000-0000-0000-000000000004', 'i1000000-0000-0000-0000-000000000004', 400, 200.00, 500.00, 0, 120, NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days', NOW())
ON CONFLICT (id) DO NOTHING;

-- Activity 5: Digana Harvest Super to Sanctuary (200 kg -> 400 animal meals)
INSERT INTO activity_records (id, donor_id, recipient_id, listing_id, campaign_id, activity_type, quantity, unit, verification_status, status, completed_at, created_at, updated_at)
VALUES
  ('i1000000-0000-0000-0000-000000000005', 'a1000000-0000-0000-0000-000000000008', 'a1000000-0000-0000-0000-000000000011', null, 'd1000000-0000-0000-0000-000000000004', 'ANIMAL_FEED_RESCUE', 200.00, 'kg', 'VERIFIED', 'COMPLETED', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day', NOW())
ON CONFLICT (id) DO NOTHING;

INSERT INTO impact_records (id, activity_record_id, meals_rescued, food_weight_kg, co2_savings_kg, people_fed, animals_fed, calculated_at, created_at, updated_at)
VALUES
  ('i2000000-0000-0000-0000-000000000005', 'i1000000-0000-0000-0000-000000000005', 400, 200.00, 500.00, 0, 150, NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day', NOW())
ON CONFLICT (id) DO NOTHING;

COMMIT;

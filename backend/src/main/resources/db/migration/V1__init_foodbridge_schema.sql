-- =============================================================================
-- FoodBridge Database Schema Migration (Flyway V1)
-- Team EcoConnect - Sri Lanka
-- Community Sustainability & Food Rescue Platform
-- =============================================================================

-- =============================================================================
-- 1. USERS TABLE
-- Core platform identity supporting all 6 roles
-- =============================================================================
CREATE TABLE users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    phone_number VARCHAR(30),
    role VARCHAR(30) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_users_role CHECK (role IN ('ADMIN', 'RESTAURANT', 'GROCERY', 'CHARITY', 'ANIMAL_ORG', 'USER'))
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_created_at ON users(created_at);

-- =============================================================================
-- 2. BUSINESSES TABLE
-- Restaurants and Grocery Stores (Subject to Admin Verification before publishing)
-- =============================================================================
CREATE TABLE businesses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE,
    business_name VARCHAR(200) NOT NULL,
    business_type VARCHAR(30) NOT NULL,
    registration_number VARCHAR(100) UNIQUE NOT NULL,
    contact_person VARCHAR(150),
    contact_email VARCHAR(255),
    contact_phone VARCHAR(30),
    address_line1 VARCHAR(255) NOT NULL,
    address_line2 VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    district VARCHAR(100) NOT NULL,
    latitude DECIMAL(10, 7) NOT NULL,
    longitude DECIMAL(10, 7) NOT NULL,
    verification_status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    verified_at TIMESTAMP WITH TIME ZONE,
    verified_by UUID,
    verification_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_businesses_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_businesses_verifier FOREIGN KEY (verified_by) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT chk_businesses_type CHECK (business_type IN ('RESTAURANT', 'GROCERY')),
    CONSTRAINT chk_businesses_verif_status CHECK (verification_status IN ('PENDING', 'VERIFIED', 'REJECTED', 'SUSPENDED'))
);

CREATE INDEX idx_businesses_user_id ON businesses(user_id);
CREATE INDEX idx_businesses_verif_status ON businesses(verification_status);
CREATE INDEX idx_businesses_type ON businesses(business_type);
CREATE INDEX idx_businesses_location ON businesses(latitude, longitude);
CREATE INDEX idx_businesses_district ON businesses(district);

-- =============================================================================
-- 3. CHARITIES TABLE
-- Registered Non-Profit Charities (Distributing human-edible food)
-- =============================================================================
CREATE TABLE charities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE,
    charity_name VARCHAR(200) NOT NULL,
    registration_number VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    contact_person VARCHAR(150),
    contact_email VARCHAR(255),
    contact_phone VARCHAR(30),
    address_line1 VARCHAR(255) NOT NULL,
    address_line2 VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    district VARCHAR(100) NOT NULL,
    latitude DECIMAL(10, 7) NOT NULL,
    longitude DECIMAL(10, 7) NOT NULL,
    capacity_people INT,
    verification_status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    verified_at TIMESTAMP WITH TIME ZONE,
    verified_by UUID,
    verification_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_charities_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_charities_verifier FOREIGN KEY (verified_by) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT chk_charities_verif_status CHECK (verification_status IN ('PENDING', 'VERIFIED', 'REJECTED', 'SUSPENDED'))
);

CREATE INDEX idx_charities_user_id ON charities(user_id);
CREATE INDEX idx_charities_verif_status ON charities(verification_status);
CREATE INDEX idx_charities_location ON charities(latitude, longitude);
CREATE INDEX idx_charities_district ON charities(district);

-- =============================================================================
-- 4. ANIMAL_ORGANIZATIONS TABLE
-- Shelters and Animal Welfare Organizations (Animal feed & welfare campaigns)
-- =============================================================================
CREATE TABLE animal_organizations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE,
    organization_name VARCHAR(200) NOT NULL,
    registration_number VARCHAR(100) UNIQUE,
    animal_types VARCHAR(255),
    shelter_capacity INT,
    contact_person VARCHAR(150),
    contact_email VARCHAR(255),
    contact_phone VARCHAR(30),
    address_line1 VARCHAR(255) NOT NULL,
    address_line2 VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    district VARCHAR(100) NOT NULL,
    latitude DECIMAL(10, 7) NOT NULL,
    longitude DECIMAL(10, 7) NOT NULL,
    verification_status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    verified_at TIMESTAMP WITH TIME ZONE,
    verified_by UUID,
    verification_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_animal_org_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_animal_org_verifier FOREIGN KEY (verified_by) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT chk_animal_org_verif_status CHECK (verification_status IN ('PENDING', 'VERIFIED', 'REJECTED', 'SUSPENDED'))
);

CREATE INDEX idx_animal_org_user_id ON animal_organizations(user_id);
CREATE INDEX idx_animal_org_verif_status ON animal_organizations(verification_status);
CREATE INDEX idx_animal_org_location ON animal_organizations(latitude, longitude);
CREATE INDEX idx_animal_org_district ON animal_organizations(district);

-- =============================================================================
-- 5. FOOD_LISTINGS TABLE
-- Surplus food listed by verified restaurants and grocers
-- Strictly enforces suitability separation (Human Consumption vs Animal Feed)
-- =============================================================================
CREATE TABLE food_listings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    business_id UUID NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    food_category VARCHAR(50) NOT NULL,
    suitability_type VARCHAR(30) NOT NULL,
    quantity DECIMAL(10, 2) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    perishable BOOLEAN NOT NULL DEFAULT TRUE,
    prepared_at TIMESTAMP WITH TIME ZONE,
    expiry_date TIMESTAMP WITH TIME ZONE NOT NULL,
    dietary_flags VARCHAR(255),
    storage_instructions VARCHAR(255),
    status VARCHAR(30) NOT NULL DEFAULT 'AVAILABLE',
    pickup_start TIMESTAMP WITH TIME ZONE NOT NULL,
    pickup_end TIMESTAMP WITH TIME ZONE NOT NULL,
    pickup_address VARCHAR(255) NOT NULL,
    latitude DECIMAL(10, 7) NOT NULL,
    longitude DECIMAL(10, 7) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_listings_business FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE,
    CONSTRAINT chk_listings_suitability CHECK (suitability_type IN ('HUMAN_CONSUMPTION', 'ANIMAL_FEED')),
    CONSTRAINT chk_listings_status CHECK (status IN ('AVAILABLE', 'RESERVED', 'COLLECTED', 'EXPIRED', 'CANCELLED'))
);

CREATE INDEX idx_food_listings_business_id ON food_listings(business_id);
CREATE INDEX idx_food_listings_status ON food_listings(status);
CREATE INDEX idx_food_listings_suitability ON food_listings(suitability_type);
CREATE INDEX idx_food_listings_expiry ON food_listings(expiry_date);
CREATE INDEX idx_food_listings_location ON food_listings(latitude, longitude);

-- =============================================================================
-- 6. FOOD_REQUESTS TABLE
-- Claims/Requests made on food listings by charities or animal organizations
-- =============================================================================
CREATE TABLE food_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    listing_id UUID NOT NULL,
    requester_type VARCHAR(30) NOT NULL,
    charity_id UUID,
    animal_org_id UUID,
    quantity_requested DECIMAL(10, 2) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    volunteer_id UUID,
    notes TEXT,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_requests_listing FOREIGN KEY (listing_id) REFERENCES food_listings(id) ON DELETE CASCADE,
    CONSTRAINT fk_requests_charity FOREIGN KEY (charity_id) REFERENCES charities(id) ON DELETE CASCADE,
    CONSTRAINT fk_requests_animal_org FOREIGN KEY (animal_org_id) REFERENCES animal_organizations(id) ON DELETE CASCADE,
    CONSTRAINT fk_requests_volunteer FOREIGN KEY (volunteer_id) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT chk_requests_requester_type CHECK (requester_type IN ('CHARITY', 'ANIMAL_ORG')),
    CONSTRAINT chk_requests_status CHECK (status IN ('PENDING', 'ACCEPTED', 'REJECTED', 'COLLECTED', 'CANCELLED'))
);

CREATE INDEX idx_food_requests_listing_id ON food_requests(listing_id);
CREATE INDEX idx_food_requests_charity_id ON food_requests(charity_id);
CREATE INDEX idx_food_requests_animal_org_id ON food_requests(animal_org_id);
CREATE INDEX idx_food_requests_status ON food_requests(status);
CREATE INDEX idx_food_requests_volunteer_id ON food_requests(volunteer_id);

-- =============================================================================
-- 7. GROCERY_OFFERS TABLE
-- Discounted near-expiry groceries for consumer waste reduction
-- =============================================================================
CREATE TABLE grocery_offers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    business_id UUID NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    original_price DECIMAL(10, 2) NOT NULL,
    discounted_price DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'LKR',
    available_quantity INT NOT NULL,
    expiry_date TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'AVAILABLE',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_grocery_offers_business FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE,
    CONSTRAINT chk_grocery_offers_status CHECK (status IN ('AVAILABLE', 'SOLD_OUT', 'EXPIRED', 'CANCELLED'))
);

CREATE INDEX idx_grocery_offers_business_id ON grocery_offers(business_id);
CREATE INDEX idx_grocery_offers_status ON grocery_offers(status);
CREATE INDEX idx_grocery_offers_expiry ON grocery_offers(expiry_date);

-- =============================================================================
-- 8. COUPONS TABLE
-- Business coupons for users to incentivize zero-waste purchases
-- =============================================================================
CREATE TABLE coupons (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    business_id UUID NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    discount_percentage DECIMAL(5, 2),
    discount_amount DECIMAL(10, 2),
    min_purchase_amount DECIMAL(10, 2),
    valid_from TIMESTAMP WITH TIME ZONE NOT NULL,
    valid_until TIMESTAMP WITH TIME ZONE NOT NULL,
    max_uses INT NOT NULL DEFAULT 100,
    used_count INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_coupons_business FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE
);

CREATE INDEX idx_coupons_business_id ON coupons(business_id);
CREATE INDEX idx_coupons_code ON coupons(code);
CREATE INDEX idx_coupons_validity ON coupons(valid_from, valid_until);

-- =============================================================================
-- 9. CAMPAIGNS TABLE
-- Feeding and relief drives organized by charities and animal organizations
-- Requires explicit Admin Approval before going public (Rule 3)
-- =============================================================================
CREATE TABLE campaigns (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    organizer_type VARCHAR(30) NOT NULL,
    charity_id UUID,
    animal_org_id UUID,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    target_beneficiaries_count INT,
    target_food_amount_kg DECIMAL(10, 2),
    target_fund_amount DECIMAL(12, 2),
    raised_fund_amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING_APPROVAL',
    approval_notes TEXT,
    approved_by UUID,
    approved_at TIMESTAMP WITH TIME ZONE,
    district VARCHAR(100),
    latitude DECIMAL(10, 7),
    longitude DECIMAL(10, 7),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_campaigns_charity FOREIGN KEY (charity_id) REFERENCES charities(id) ON DELETE CASCADE,
    CONSTRAINT fk_campaigns_animal_org FOREIGN KEY (animal_org_id) REFERENCES animal_organizations(id) ON DELETE CASCADE,
    CONSTRAINT fk_campaigns_approver FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT chk_campaigns_organizer_type CHECK (organizer_type IN ('CHARITY', 'ANIMAL_ORG')),
    CONSTRAINT chk_campaigns_status CHECK (status IN ('PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'ACTIVE', 'COMPLETED', 'CANCELLED'))
);

CREATE INDEX idx_campaigns_charity_id ON campaigns(charity_id);
CREATE INDEX idx_campaigns_animal_org_id ON campaigns(animal_org_id);
CREATE INDEX idx_campaigns_status ON campaigns(status);
CREATE INDEX idx_campaigns_district ON campaigns(district);
CREATE INDEX idx_campaigns_dates ON campaigns(start_date, end_date);

-- =============================================================================
-- 10. PARTNERSHIPS TABLE
-- Formal collaboration agreements between businesses and charitable bodies
-- =============================================================================
CREATE TABLE partnerships (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    business_id UUID NOT NULL,
    partner_type VARCHAR(30) NOT NULL,
    charity_id UUID,
    animal_org_id UUID,
    agreement_details TEXT,
    status VARCHAR(30) NOT NULL DEFAULT 'PROPOSED',
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_partnerships_business FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE,
    CONSTRAINT fk_partnerships_charity FOREIGN KEY (charity_id) REFERENCES charities(id) ON DELETE CASCADE,
    CONSTRAINT fk_partnerships_animal_org FOREIGN KEY (animal_org_id) REFERENCES animal_organizations(id) ON DELETE CASCADE,
    CONSTRAINT chk_partnerships_partner_type CHECK (partner_type IN ('CHARITY', 'ANIMAL_ORG')),
    CONSTRAINT chk_partnerships_status CHECK (status IN ('PROPOSED', 'ACCEPTED', 'REJECTED', 'TERMINATED'))
);

CREATE INDEX idx_partnerships_business_id ON partnerships(business_id);
CREATE INDEX idx_partnerships_charity_id ON partnerships(charity_id);
CREATE INDEX idx_partnerships_animal_org_id ON partnerships(animal_org_id);
CREATE INDEX idx_partnerships_status ON partnerships(status);

-- =============================================================================
-- 11. CAMPAIGN_CONTRIBUTIONS TABLE
-- Pledges and offline donations recorded for campaigns
-- Strictly NO payment processing; confirmed by receiving charity (Rules 5 & 8)
-- =============================================================================
CREATE TABLE campaign_contributions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    campaign_id UUID NOT NULL,
    contributor_user_id UUID,
    contributor_name VARCHAR(150) NOT NULL,
    contributor_email VARCHAR(255),
    contributor_phone VARCHAR(30),
    contribution_type VARCHAR(30) NOT NULL,
    monetary_amount DECIMAL(12, 2),
    food_amount_kg DECIMAL(10, 2),
    item_description TEXT,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING_CONFIRMATION',
    confirmed_by UUID,
    confirmed_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_contributions_campaign FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE,
    CONSTRAINT fk_contributions_user FOREIGN KEY (contributor_user_id) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_contributions_confirmer FOREIGN KEY (confirmed_by) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT chk_contributions_type CHECK (contribution_type IN ('MONETARY_PLEDGE', 'FOOD_ITEMS', 'EQUIPMENT', 'OTHER')),
    CONSTRAINT chk_contributions_status CHECK (status IN ('PENDING_CONFIRMATION', 'CONFIRMED', 'REJECTED', 'CANCELLED'))
);

CREATE INDEX idx_contributions_campaign_id ON campaign_contributions(campaign_id);
CREATE INDEX idx_contributions_user_id ON campaign_contributions(contributor_user_id);
CREATE INDEX idx_contributions_status ON campaign_contributions(status);
CREATE INDEX idx_contributions_created_at ON campaign_contributions(created_at);

-- =============================================================================
-- 12. VOLUNTEERS TABLE
-- Community volunteers available for food transport and logistics
-- =============================================================================
CREATE TABLE volunteers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE,
    skills TEXT,
    vehicle_type VARCHAR(50),
    availability_status VARCHAR(30) NOT NULL DEFAULT 'AVAILABLE',
    current_latitude DECIMAL(10, 7),
    current_longitude DECIMAL(10, 7),
    preferred_districts VARCHAR(255),
    verification_status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    total_tasks_completed INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_volunteers_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT chk_volunteers_availability CHECK (availability_status IN ('AVAILABLE', 'BUSY', 'INACTIVE')),
    CONSTRAINT chk_volunteers_verification CHECK (verification_status IN ('PENDING', 'VERIFIED', 'REJECTED'))
);

CREATE INDEX idx_volunteers_user_id ON volunteers(user_id);
CREATE INDEX idx_volunteers_availability ON volunteers(availability_status);
CREATE INDEX idx_volunteers_verification ON volunteers(verification_status);
CREATE INDEX idx_volunteers_location ON volunteers(current_latitude, current_longitude);

-- =============================================================================
-- 13. ANIMAL_LOCATIONS TABLE
-- Community-reported stray feeding locations and feeding points in Sri Lanka
-- =============================================================================
CREATE TABLE animal_locations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    animal_org_id UUID,
    reported_by_user_id UUID,
    location_name VARCHAR(200) NOT NULL,
    animal_type VARCHAR(100) NOT NULL,
    estimated_count INT,
    feeding_routine VARCHAR(255),
    latitude DECIMAL(10, 7) NOT NULL,
    longitude DECIMAL(10, 7) NOT NULL,
    district VARCHAR(100) NOT NULL,
    notes TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_animal_loc_org FOREIGN KEY (animal_org_id) REFERENCES animal_organizations(id) ON DELETE SET NULL,
    CONSTRAINT fk_animal_loc_reporter FOREIGN KEY (reported_by_user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_animal_locations_org_id ON animal_locations(animal_org_id);
CREATE INDEX idx_animal_locations_district ON animal_locations(district);
CREATE INDEX idx_animal_locations_geo ON animal_locations(latitude, longitude);

-- =============================================================================
-- 14. ACTIVITY_RECORDS TABLE
-- Verified historical activities (Rule 4 prerequisites for impact accounting)
-- =============================================================================
CREATE TABLE activity_records (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    activity_type VARCHAR(50) NOT NULL,
    related_listing_id UUID,
    related_campaign_id UUID,
    performed_by_user_id UUID NOT NULL,
    verified_by_user_id UUID,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    completion_timestamp TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_activity_listing FOREIGN KEY (related_listing_id) REFERENCES food_listings(id) ON DELETE SET NULL,
    CONSTRAINT fk_activity_campaign FOREIGN KEY (related_campaign_id) REFERENCES campaigns(id) ON DELETE SET NULL,
    CONSTRAINT fk_activity_performer FOREIGN KEY (performed_by_user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_activity_verifier FOREIGN KEY (verified_by_user_id) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT chk_activity_status CHECK (status IN ('PENDING', 'IN_PROGRESS', 'VERIFIED', 'COMPLETED', 'REJECTED'))
);

CREATE INDEX idx_activity_listing_id ON activity_records(related_listing_id);
CREATE INDEX idx_activity_campaign_id ON activity_records(related_campaign_id);
CREATE INDEX idx_activity_status ON activity_records(status);
CREATE INDEX idx_activity_performer ON activity_records(performed_by_user_id);
CREATE INDEX idx_activity_completion ON activity_records(completion_timestamp);

-- =============================================================================
-- 15. PROMOTIONS TABLE
-- Platform operational revenue from featured business advertisements (Rule 8)
-- =============================================================================
CREATE TABLE promotions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    business_id UUID NOT NULL,
    title VARCHAR(200) NOT NULL,
    banner_url VARCHAR(500),
    target_audience VARCHAR(100),
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    cost_lkr DECIMAL(10, 2) NOT NULL,
    payment_status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_promotions_business FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE,
    CONSTRAINT chk_promotions_payment_status CHECK (payment_status IN ('PENDING', 'PAID', 'FAILED', 'REFUNDED'))
);

CREATE INDEX idx_promotions_business_id ON promotions(business_id);
CREATE INDEX idx_promotions_payment_status ON promotions(payment_status);
CREATE INDEX idx_promotions_dates ON promotions(start_date, end_date);

-- =============================================================================
-- 16. SUBSCRIPTIONS TABLE
-- Platform operational revenue from premium business memberships (Rule 8)
-- =============================================================================
CREATE TABLE subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    business_id UUID NOT NULL,
    plan_name VARCHAR(100) NOT NULL,
    billing_cycle VARCHAR(30) NOT NULL,
    amount_lkr DECIMAL(10, 2) NOT NULL,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_subscriptions_business FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE,
    CONSTRAINT chk_subscriptions_billing_cycle CHECK (billing_cycle IN ('MONTHLY', 'ANNUAL')),
    CONSTRAINT chk_subscriptions_status CHECK (status IN ('ACTIVE', 'PAST_DUE', 'CANCELLED', 'EXPIRED'))
);

CREATE INDEX idx_subscriptions_business_id ON subscriptions(business_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_dates ON subscriptions(start_date, end_date);

-- =============================================================================
-- 17. IMPACT_RECORDS TABLE
-- Official impact statistics (Calculated only from VERIFIED & COMPLETED activities, Rule 4)
-- =============================================================================
CREATE TABLE impact_records (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    activity_record_id UUID NOT NULL UNIQUE,
    meals_rescued INT NOT NULL DEFAULT 0,
    food_weight_kg DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    co2_savings_kg DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    people_fed INT NOT NULL DEFAULT 0,
    animals_fed INT NOT NULL DEFAULT 0,
    calculated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_impact_activity FOREIGN KEY (activity_record_id) REFERENCES activity_records(id) ON DELETE CASCADE
);

CREATE INDEX idx_impact_activity_id ON impact_records(activity_record_id);
CREATE INDEX idx_impact_calculated_at ON impact_records(calculated_at);

-- =============================================================================
-- 18. NOTIFICATIONS TABLE
-- Real-time notification log for all users
-- =============================================================================
CREATE TABLE notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    reference_id UUID,
    reference_type VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);

-- =============================================================================
-- 19. AUDIT_LOGS TABLE
-- Platform security and governance audit trail (Rule 1 & Rule 9)
-- =============================================================================
CREATE TABLE audit_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID,
    action VARCHAR(100) NOT NULL,
    entity_name VARCHAR(50) NOT NULL,
    entity_id UUID,
    ip_address VARCHAR(50),
    details TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_audit_logs_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_name, entity_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

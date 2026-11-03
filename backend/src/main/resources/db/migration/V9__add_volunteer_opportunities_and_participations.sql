-- =============================================================================
-- V9: Volunteer Opportunities, Volunteer Participations, and Indexes
-- =============================================================================

CREATE TABLE volunteer_opportunities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    organizer_user_id UUID NOT NULL,
    charity_id UUID,
    animal_org_id UUID,
    organizer_name VARCHAR(255) NOT NULL,
    organizer_type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(50) NOT NULL,
    district VARCHAR(100) NOT NULL,
    city VARCHAR(100),
    address_line VARCHAR(255),
    latitude NUMERIC(10, 7),
    longitude NUMERIC(10, 7),
    event_date DATE NOT NULL,
    start_time VARCHAR(20),
    end_time VARCHAR(20),
    estimated_hours NUMERIC(4, 1) NOT NULL DEFAULT 2.0,
    volunteers_needed INT NOT NULL DEFAULT 1,
    volunteers_registered INT NOT NULL DEFAULT 0,
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    skills_required TEXT,
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_vol_opp_organizer FOREIGN KEY (organizer_user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_vol_opp_charity FOREIGN KEY (charity_id) REFERENCES charities(id) ON DELETE SET NULL,
    CONSTRAINT fk_vol_opp_animal_org FOREIGN KEY (animal_org_id) REFERENCES animal_organizations(id) ON DELETE SET NULL,
    CONSTRAINT chk_vol_opp_category CHECK (category IN ('FOOD_DISTRIBUTION', 'SCHOOL_SUPPLIES', 'ENVIRONMENTAL', 'ANIMAL_WELFARE')),
    CONSTRAINT chk_vol_opp_status CHECK (status IN ('ACTIVE', 'COMPLETED', 'CANCELLED'))
);

CREATE INDEX idx_vol_opp_organizer_id ON volunteer_opportunities(organizer_user_id);
CREATE INDEX idx_vol_opp_category ON volunteer_opportunities(category);
CREATE INDEX idx_vol_opp_district ON volunteer_opportunities(district);
CREATE INDEX idx_vol_opp_event_date ON volunteer_opportunities(event_date);
CREATE INDEX idx_vol_opp_status ON volunteer_opportunities(status);

CREATE TABLE volunteer_participations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    opportunity_id UUID NOT NULL,
    user_id UUID NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'REGISTERED',
    hours_volunteered NUMERIC(5, 2) NOT NULL DEFAULT 0.0,
    attendance_notes TEXT,
    feedback TEXT,
    registered_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    attended_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_vol_part_opportunity FOREIGN KEY (opportunity_id) REFERENCES volunteer_opportunities(id) ON DELETE CASCADE,
    CONSTRAINT fk_vol_part_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT uk_opportunity_user UNIQUE (opportunity_id, user_id),
    CONSTRAINT chk_vol_part_status CHECK (status IN ('REGISTERED', 'ATTENDED', 'NO_SHOW', 'CANCELLED'))
);

CREATE INDEX idx_vol_part_opportunity_id ON volunteer_participations(opportunity_id);
CREATE INDEX idx_vol_part_user_id ON volunteer_participations(user_id);
CREATE INDEX idx_vol_part_status ON volunteer_participations(status);

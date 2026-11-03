-- =============================================================================
-- Migration V5: Add Community Campaign fields and Distribution Updates table
-- =============================================================================

ALTER TABLE campaigns ADD COLUMN need_type VARCHAR(50);
ALTER TABLE campaigns ADD COLUMN target_quantity INT;
ALTER TABLE campaigns ADD COLUMN target_unit VARCHAR(50);
ALTER TABLE campaigns ADD COLUMN current_quantity INT DEFAULT 0;
ALTER TABLE campaigns ADD COLUMN cover_image_url VARCHAR(500);
ALTER TABLE campaigns ADD COLUMN evidence_url VARCHAR(500);

CREATE INDEX idx_campaigns_need_type ON campaigns(need_type);

-- -----------------------------------------------------------------------------
-- Distribution Updates (Charities post field distribution updates with photos)
-- -----------------------------------------------------------------------------
CREATE TABLE campaign_updates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    photo_url VARCHAR(500),
    quantity_distributed INT DEFAULT 0,
    distribution_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_campaign_updates_campaign_id ON campaign_updates(campaign_id);
CREATE INDEX idx_campaign_updates_date ON campaign_updates(distribution_date);


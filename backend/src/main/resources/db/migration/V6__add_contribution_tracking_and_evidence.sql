-- =============================================================================
-- Migration V6: Add Contribution Tracking and Distribution Evidence Schema
-- =============================================================================

ALTER TABLE campaign_contributions DROP CONSTRAINT IF EXISTS chk_contributions_status;
ALTER TABLE campaign_contributions DROP CONSTRAINT IF EXISTS chk_contributions_type;

ALTER TABLE campaign_contributions ADD COLUMN quantity INT;
ALTER TABLE campaign_contributions ADD COLUMN unit VARCHAR(50);
ALTER TABLE campaign_contributions ADD COLUMN distribution_evidence_url VARCHAR(500);
ALTER TABLE campaign_contributions ADD COLUMN distribution_notes TEXT;
ALTER TABLE campaign_contributions ADD COLUMN distributed_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE campaign_contributions ADD COLUMN distributed_by UUID REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE campaigns ADD COLUMN payment_instructions TEXT;
ALTER TABLE campaigns ADD COLUMN handover_instructions TEXT;

CREATE INDEX idx_contributions_campaign_status ON campaign_contributions(campaign_id, status);
CREATE INDEX idx_contributions_distributed_at ON campaign_contributions(distributed_at);

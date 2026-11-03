-- =============================================================================
-- V7: Business-to-Charity Partnership Workflow & Promotional Recognition Schema
-- Supports: Proposal -> Counter/Negotiation thread -> Immutable Agreed Terms
--           -> Delivery -> Confirmation (Completed) -> Platform Recognition
-- =============================================================================

-- 1. Update check constraint on partnerships status
ALTER TABLE partnerships DROP CONSTRAINT IF EXISTS chk_partnerships_status;

ALTER TABLE partnerships ADD CONSTRAINT chk_partnerships_status 
    CHECK (status IN ('PROPOSED', 'COUNTERED', 'DECLINED', 'AGREED', 'DELIVERED', 'COMPLETED', 'CANCELLED', 'ACCEPTED', 'REJECTED', 'TERMINATED'));

-- 2. Add workflow, immutable terms snapshot, and recognition activation columns
ALTER TABLE partnerships ADD COLUMN campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL;
ALTER TABLE partnerships ADD COLUMN contribution_type VARCHAR(50);
ALTER TABLE partnerships ADD COLUMN monetary_amount DECIMAL(12, 2);
ALTER TABLE partnerships ADD COLUMN quantity INT;
ALTER TABLE partnerships ADD COLUMN unit VARCHAR(50);
ALTER TABLE partnerships ADD COLUMN item_description VARCHAR(255);
ALTER TABLE partnerships ADD COLUMN requested_recognition VARCHAR(150);
ALTER TABLE partnerships ADD COLUMN agreed_recognition VARCHAR(150);
ALTER TABLE partnerships ADD COLUMN recognition_active BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE partnerships ADD COLUMN agreed_terms_snapshot TEXT;
ALTER TABLE partnerships ADD COLUMN agreed_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE partnerships ADD COLUMN agreed_by_business_user_id UUID REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE partnerships ADD COLUMN agreed_by_charity_user_id UUID REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE partnerships ADD COLUMN delivered_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE partnerships ADD COLUMN delivery_notes TEXT;
ALTER TABLE partnerships ADD COLUMN completed_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE partnerships ADD COLUMN completed_by UUID REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE partnerships ADD COLUMN completion_notes TEXT;
ALTER TABLE partnerships ADD COLUMN last_counter_by_role VARCHAR(30);
ALTER TABLE partnerships ADD COLUMN campaign_contribution_id UUID REFERENCES campaign_contributions(id) ON DELETE SET NULL;

CREATE INDEX idx_partnerships_campaign_id ON partnerships(campaign_id);
CREATE INDEX idx_partnerships_recognition_active ON partnerships(recognition_active);

-- 3. Create partnership_messages table for negotiation thread
CREATE TABLE partnership_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    partnership_id UUID NOT NULL REFERENCES partnerships(id) ON DELETE CASCADE,
    sender_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    sender_role VARCHAR(30) NOT NULL,
    sender_name VARCHAR(150) NOT NULL,
    message_text TEXT NOT NULL,
    is_counter_proposal BOOLEAN NOT NULL DEFAULT FALSE,
    counter_contribution_type VARCHAR(50),
    counter_monetary_amount DECIMAL(12, 2),
    counter_quantity INT,
    counter_unit VARCHAR(50),
    counter_item_description VARCHAR(255),
    counter_recognition VARCHAR(150),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_partnership_messages_partnership_id ON partnership_messages(partnership_id);
CREATE INDEX idx_partnership_messages_created_at ON partnership_messages(created_at);

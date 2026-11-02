-- Migration: Add profile and document fields for Business and Charity verification

ALTER TABLE businesses ADD COLUMN description TEXT;
ALTER TABLE businesses ADD COLUMN logo_url VARCHAR(500);
ALTER TABLE businesses ADD COLUMN document_url VARCHAR(500);

ALTER TABLE charities ADD COLUMN logo_url VARCHAR(500);
ALTER TABLE charities ADD COLUMN document_url VARCHAR(500);
ALTER TABLE charities ADD COLUMN operating_area VARCHAR(255);


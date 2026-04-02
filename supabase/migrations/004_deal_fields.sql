-- Migration: Add deal_value and rating to contacts
-- deal_value: monetary value of the opportunity (e.g. 2000.00)
-- rating: lead quality score 1-5

ALTER TABLE contacts
  ADD COLUMN IF NOT EXISTS deal_value numeric(12,2) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS rating integer DEFAULT NULL CHECK (rating >= 1 AND rating <= 5);

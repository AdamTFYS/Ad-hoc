-- Migration: Create account_deletion_feedback table
-- Run this in the Supabase SQL editor

CREATE TABLE IF NOT EXISTS account_deletion_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  reason text NOT NULL,
  details text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS (service role bypasses RLS by default)
ALTER TABLE account_deletion_feedback ENABLE ROW LEVEL SECURITY;

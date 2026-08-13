CREATE TABLE IF NOT EXISTS visitor_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  mobile_number TEXT NOT NULL,
  email TEXT,
  city TEXT,
  interested_service TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE visitor_leads ENABLE ROW LEVEL SECURITY;

-- Policies for authenticated users (admin)
CREATE POLICY "select_visitor_leads" ON visitor_leads FOR SELECT
  TO authenticated USING (true);
CREATE POLICY "insert_visitor_leads" ON visitor_leads FOR INSERT
  TO anon, authenticated WITH CHECK (true);

-- Index for common queries
CREATE INDEX idx_visitor_leads_created_at ON visitor_leads(created_at DESC);
CREATE INDEX idx_visitor_leads_service ON visitor_leads(interested_service);
CREATE INDEX idx_visitor_leads_city ON visitor_leads(city);
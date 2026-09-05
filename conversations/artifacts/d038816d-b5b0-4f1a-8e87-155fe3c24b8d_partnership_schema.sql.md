-- Run this in your Supabase SQL Editor to create the Partnerships table

CREATE TABLE IF NOT EXISTS partnership_inquiries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  organisation TEXT NOT NULL,
  email TEXT NOT NULL,
  type TEXT NOT NULL,
  message TEXT,
  status TEXT DEFAULT 'New',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE partnership_inquiries ENABLE ROW LEVEL SECURITY;

-- Allow public to insert (so the frontend form can submit)
CREATE POLICY "Allow public inserts on partnership_inquiries" 
  ON partnership_inquiries FOR INSERT WITH CHECK (true);

-- Allow public (or admins) to read (so the Admin OS can fetch them)
CREATE POLICY "Allow public select on partnership_inquiries" 
  ON partnership_inquiries FOR SELECT USING (true);

-- Allow public (or admins) to update (so the Admin OS can change status)
CREATE POLICY "Allow public update on partnership_inquiries" 
  ON partnership_inquiries FOR UPDATE USING (true);

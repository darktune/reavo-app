-- Create Payouts Table
CREATE TABLE payouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recipient_name TEXT NOT NULL,
  account_number TEXT NOT NULL,
  bank_code TEXT NOT NULL,
  amount DECIMAL NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  reference TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE payouts ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view payouts
CREATE POLICY "Enable read access for authenticated users" ON payouts
  FOR SELECT USING (auth.role() = 'authenticated');

-- Allow authenticated users to insert payouts
CREATE POLICY "Enable insert for authenticated users" ON payouts
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

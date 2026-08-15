-- Table for Company Info
CREATE TABLE IF NOT EXISTS company (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    project TEXT NOT NULL,
    tagline TEXT,
    period TEXT
);

-- Table for Inventory / Styles
CREATE TABLE IF NOT EXISTS inventory (
    id TEXT PRIMARY KEY,
    sno INTEGER,
    vendor TEXT,
    style TEXT,
    balance NUMERIC DEFAULT 0,
    unit TEXT,
    invoice_date TEXT,
    invoice_no TEXT,
    invoice_amount NUMERIC DEFAULT 0,
    status INTEGER,
    sheet_name TEXT
);

-- Table for Inventory Lots
CREATE TABLE IF NOT EXISTS lots (
    lot_id TEXT PRIMARY KEY,
    inventory_id TEXT REFERENCES inventory(id) ON DELETE CASCADE,
    inward_date TEXT,
    inward_challan TEXT,
    received_qty NUMERIC DEFAULT 0,
    item_desc TEXT,
    status TEXT,
    invoice_no TEXT,
    invoice_date TEXT,
    invoice_amount NUMERIC DEFAULT 0
);

-- Table for Transactions (Job Work / Ledger etc for each style)
CREATE TABLE IF NOT EXISTS transactions (
    id SERIAL PRIMARY KEY,
    inventory_id TEXT REFERENCES inventory(id) ON DELETE CASCADE,
    date TEXT,
    challan_no TEXT,
    size_item TEXT,
    inward_qty NUMERIC DEFAULT 0,
    outward_qty NUMERIC DEFAULT 0,
    balance NUMERIC DEFAULT 0
);

-- Basic setup for Financials (as JSONB for flexibility)
CREATE TABLE IF NOT EXISTS financials_data (
    id SERIAL PRIMARY KEY,
    type TEXT UNIQUE NOT NULL, -- e.g., 'pl', 'ledgers', 'payroll'
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Setup RLS (Row Level Security) - Allowing anon access for now (assuming development mode)
-- WARNING: In a real production app, you should configure proper auth and policies.
ALTER TABLE company ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE lots ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE financials_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all actions for anon on company" ON company FOR ALL USING (true);
CREATE POLICY "Allow all actions for anon on inventory" ON inventory FOR ALL USING (true);
CREATE POLICY "Allow all actions for anon on lots" ON lots FOR ALL USING (true);
CREATE POLICY "Allow all actions for anon on transactions" ON transactions FOR ALL USING (true);
CREATE POLICY "Allow all actions for anon on financials_data" ON financials_data FOR ALL USING (true);

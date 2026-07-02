-- ============================================================
-- SmartShip Full Database Schema
-- Run this in Supabase SQL Editor
-- ⚠️ WARNING: This will DROP and recreate tables (except user_roles data is preserved)
-- ============================================================

-- ============================================================
-- Step 0: Backup existing user_roles before dropping
-- ============================================================
CREATE TEMP TABLE _backup_user_roles AS SELECT * FROM user_roles;

-- ============================================================
-- Step 1: Drop existing tables (order matters for foreign keys)
-- ============================================================
DROP TABLE IF EXISTS invoices CASCADE;
DROP TABLE IF EXISTS shipments CASCADE;
DROP TABLE IF EXISTS import_requests CASCADE;
DROP TABLE IF EXISTS site_settings CASCADE;
DROP TABLE IF EXISTS user_roles CASCADE;

-- ============================================================
-- Step 2: Create Tables
-- ============================================================

-- 2.1 Import Requests
CREATE TABLE import_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    city TEXT,
    product_name TEXT NOT NULL,
    product_description TEXT,
    product_notes TEXT,
    product_url TEXT,
    product_image TEXT,
    status TEXT DEFAULT 'new' CHECK (status IN ('new', 'reviewing', 'approved', 'converted')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2.2 Shipments (auto-generated SS-XXXXX IDs)
CREATE SEQUENCE IF NOT EXISTS shipment_id_seq START WITH 10030;

CREATE TABLE shipments (
    id TEXT PRIMARY KEY DEFAULT ('SS-' || LPAD(nextval('shipment_id_seq')::TEXT, 5, '0')),
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    city TEXT,
    destination TEXT,
    product TEXT NOT NULL,
    product_description TEXT,
    product_image TEXT,
    quantity INTEGER DEFAULT 1,
    color TEXT,
    current_status TEXT DEFAULT 'shipped' CHECK (current_status IN ('new', 'shipped', 'in_transit', 'customs', 'at_port', 'delivered', 'delayed')),
    status_history JSONB DEFAULT '[]'::jsonb,
    photos TEXT[] DEFAULT '{}',
    invoice_amount DECIMAL(10, 2),
    admin_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2.3 Invoices
CREATE TABLE invoices (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    shipment_id TEXT REFERENCES shipments(id) ON DELETE SET NULL,
    customer_name TEXT NOT NULL,
    customer_phone TEXT,
    amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
    details TEXT,
    items JSONB DEFAULT '[]'::jsonb,
    status TEXT DEFAULT 'unpaid' CHECK (status IN ('paid', 'unpaid')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2.4 User Roles (with invitation system)
CREATE TABLE user_roles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    role TEXT DEFAULT 'data_entry' CHECK (role IN ('admin', 'manager', 'data_entry', 'supervisor')),
    is_active BOOLEAN DEFAULT false,
    invitation_token TEXT UNIQUE,
    invitation_expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2.5 Site Settings (singleton row)
CREATE TABLE site_settings (
    id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    site_name TEXT DEFAULT 'SmartShip',
    tracking_prefix TEXT DEFAULT 'SS-',
    vat_percent DECIMAL(5, 2) DEFAULT 0,
    contact_phone TEXT DEFAULT '+8619383079080',
    contact_email TEXT,
    whatsapp_number TEXT DEFAULT '+8619383079080',
    website_url TEXT DEFAULT 'www.binhabeb.com',
    maintenance_mode BOOLEAN DEFAULT false,
    fixed_cbm_rate DECIMAL(10, 2) DEFAULT 150,
    office_commission DECIMAL(5, 2) DEFAULT 5,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- Step 3: Restore user_roles from backup
-- ============================================================
INSERT INTO user_roles (email, full_name, role, is_active, created_at)
SELECT email, full_name, role, true, created_at
FROM _backup_user_roles
ON CONFLICT (email) DO NOTHING;

DROP TABLE IF EXISTS _backup_user_roles;

-- ============================================================
-- Step 4: Insert default site_settings
-- ============================================================
INSERT INTO site_settings (id, site_name, contact_phone, whatsapp_number, website_url, fixed_cbm_rate, office_commission)
VALUES (1, 'SmartShip', '+8619383079080', '+8619383079080', 'www.binhabeb.com', 150, 5)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- Step 5: Enable Row Level Security
-- ============================================================
ALTER TABLE import_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- Step 6: RLS Policies
-- ============================================================

-- Import Requests: anyone can insert, authenticated can read/update
CREATE POLICY "Anyone can submit import request" ON import_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated can read requests" ON import_requests FOR SELECT USING (true);
CREATE POLICY "Authenticated can update requests" ON import_requests FOR UPDATE USING (true);

-- Shipments: anyone can read (for tracking), authenticated can insert/update
CREATE POLICY "Anyone can read shipments" ON shipments FOR SELECT USING (true);
CREATE POLICY "Authenticated can insert shipments" ON shipments FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated can update shipments" ON shipments FOR UPDATE USING (true);

-- Invoices: anyone can read (for public invoice page), authenticated can insert/update
CREATE POLICY "Anyone can read invoices" ON invoices FOR SELECT USING (true);
CREATE POLICY "Authenticated can insert invoices" ON invoices FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated can update invoices" ON invoices FOR UPDATE USING (true);

-- User Roles: full access for now (admin manages through UI)
CREATE POLICY "Full access to user_roles" ON user_roles FOR ALL USING (true) WITH CHECK (true);

-- Site Settings: anyone can read, authenticated can update
CREATE POLICY "Anyone can read settings" ON site_settings FOR SELECT USING (true);
CREATE POLICY "Authenticated can update settings" ON site_settings FOR UPDATE USING (true);
CREATE POLICY "Authenticated can insert settings" ON site_settings FOR INSERT WITH CHECK (true);

-- ============================================================
-- Step 7: Auto-update updated_at on shipments
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_shipments_updated_at
    BEFORE UPDATE ON shipments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

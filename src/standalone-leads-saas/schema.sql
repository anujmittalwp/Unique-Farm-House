-- ==============================================================================
-- STANDALONE MULTI-TENANT SAAS LEADS MANAGEMENT SYSTEM - SUPABASE SQL SCHEMA
-- ==============================================================================
-- Run this script inside your Supabase Project's SQL Editor (https://app.supabase.com)
-- It creates isolated tables with multi-tenant company_id isolation & RLS policies.
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Companies / Tenants Table
CREATE TABLE IF NOT EXISTS saas_companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    plan TEXT DEFAULT 'starter' CHECK (plan IN ('free', 'starter', 'pro', 'enterprise')),
    logo_url TEXT,
    settings JSONB DEFAULT '{"currency": "INR", "whatsappTemplate": "Hello {name}, thank you for reaching out!"}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Users / Team Members Table
CREATE TABLE IF NOT EXISTS saas_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES saas_companies(id) ON DELETE CASCADE,
    auth_user_id UUID, -- Links to auth.users if using Supabase Auth
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    role TEXT NOT NULL DEFAULT 'agent' CHECK (role IN ('owner', 'admin', 'manager', 'agent')),
    avatar TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Leads Table
CREATE TABLE IF NOT EXISTS saas_leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES saas_companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT NOT NULL,
    source TEXT DEFAULT 'Direct',
    status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'quotation_sent', 'hot', 'converted', 'lost')),
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
    score TEXT DEFAULT 'WARM' CHECK (score IN ('HOT', 'WARM', 'COLD')),
    remarks TEXT,
    budget TEXT,
    guests TEXT,
    city TEXT,
    booking_date DATE,
    booking_time TEXT,
    occasion TEXT,
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    email_sent BOOLEAN DEFAULT FALSE,
    whatsapp_sent BOOLEAN DEFAULT FALSE,
    follow_up_date DATE,
    follow_up_time TEXT,
    follow_up_remarks TEXT,
    follow_up_type TEXT DEFAULT 'call',
    assigned_agent_id UUID REFERENCES saas_users(id) ON DELETE SET NULL,
    assigned_agent_name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Lead Activity & Follow-up Logs Table
CREATE TABLE IF NOT EXISTS saas_lead_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_id UUID NOT NULL REFERENCES saas_leads(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES saas_companies(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('status', 'remark', 'assignment', 'followup', 'automated', 'call', 'whatsapp', 'email', 'visit')),
    content TEXT NOT NULL,
    user_name TEXT NOT NULL,
    user_id UUID REFERENCES saas_users(id) ON DELETE SET NULL,
    outcome TEXT DEFAULT 'none' CHECK (outcome IN ('positive', 'neutral', 'negative', 'none')),
    reminder_date DATE,
    reminder_time TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_leads_company_id ON saas_leads(company_id);
CREATE INDEX IF NOT EXISTS idx_leads_status ON saas_leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_phone ON saas_leads(phone);
CREATE INDEX IF NOT EXISTS idx_leads_followup ON saas_leads(follow_up_date);
CREATE INDEX IF NOT EXISTS idx_activities_lead ON saas_lead_activities(lead_id);
CREATE INDEX IF NOT EXISTS idx_users_company ON saas_users(company_id);

-- 7. Trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_leads_updated_at ON saas_leads;
CREATE TRIGGER set_leads_updated_at
BEFORE UPDATE ON saas_leads
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- 8. Row Level Security (RLS) Setup (Optional: enable when using Supabase Auth)
-- ALTER TABLE saas_companies ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE saas_users ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE saas_leads ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE saas_lead_activities ENABLE ROW LEVEL SECURITY;

-- 9. Sample Seed Data for immediate testing
INSERT INTO saas_companies (id, name, slug, email, phone, plan)
VALUES 
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Acme Luxury Resorts', 'acme-resorts', 'owner@acmeresorts.com', '+91 98765 43210', 'pro')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO saas_users (id, company_id, name, email, role, phone)
VALUES 
    ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Rajesh Sharma', 'owner@acmeresorts.com', 'owner', '+91 98765 43210'),
    ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Pooja Verma', 'pooja@acmeresorts.com', 'manager', '+91 98765 43211'),
    ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Amit Kumar', 'amit@acmeresorts.com', 'agent', '+91 98765 43212')
ON CONFLICT DO NOTHING;

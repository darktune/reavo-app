-- ==============================================================================
-- REAVO CORPORATE ADMIN OS — MASTER SUPABASE DATABASE SCHEMA
-- Compatible with PostgreSQL 15+ / Supabase
-- Includes: Products, Orders, Inventory, Customers, Trade-Ins, Payments,
-- Discounts, Content Blocks, Staff & RBAC, Audit Logs, Settings & Stored Procedures
-- ==============================================================================

-- Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- 1. PRODUCTS & INVENTORY
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    sku TEXT UNIQUE,
    price NUMERIC(12, 2) NOT NULL DEFAULT 0,
    compare_at_price NUMERIC(12, 2),
    cost_price NUMERIC(12, 2),
    category TEXT NOT NULL DEFAULT 'creators',
    brand TEXT DEFAULT 'REAVO',
    stock_quantity INTEGER NOT NULL DEFAULT 0,
    restock_threshold INTEGER NOT NULL DEFAULT 5,
    image TEXT,
    images TEXT[] DEFAULT ARRAY[]::TEXT[],
    description TEXT,
    specs TEXT,
    seo_title TEXT,
    seo_description TEXT,
    quality_score INTEGER DEFAULT 85,
    status TEXT DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
    is_featured BOOLEAN DEFAULT FALSE,
    last_restocked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_sku ON public.products(sku);
CREATE INDEX IF NOT EXISTS idx_products_status ON public.products(status);

-- ==============================================================================
-- 2. CUSTOMERS CRM
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.customers (
    id TEXT PRIMARY KEY DEFAULT ('cust_' || substr(md5(random()::text), 1, 8)),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    avatar_url TEXT,
    total_orders INTEGER DEFAULT 0,
    total_spent NUMERIC(14, 2) DEFAULT 0,
    ltv_tier TEXT DEFAULT 'New' CHECK (ltv_tier IN ('VIP', 'Regular', 'New')),
    status TEXT DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive')),
    notes TEXT,
    last_order_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_customers_email ON public.customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_ltv ON public.customers(ltv_tier);

-- ==============================================================================
-- 3. ORDERS & FULFILLMENT
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY DEFAULT ('ord-' || substr(md5(random()::text), 1, 8)),
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT,
    total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
    subtotal NUMERIC(12, 2),
    discount_amount NUMERIC(12, 2) DEFAULT 0,
    delivery_fee NUMERIC(12, 2) DEFAULT 0,
    status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'Paid', 'Shipped', 'Delivered', 'Cancelled', 'Refunded')),
    payment_method TEXT DEFAULT 'Kora Pay',
    payment_reference TEXT,
    shipping_address JSONB,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON public.orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);

-- Order Items Join Table
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id TEXT REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id TEXT REFERENCES public.products(id) ON DELETE SET NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    price NUMERIC(12, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);

-- ==============================================================================
-- 4. TRADE-INS & DEVICE RECYCLING
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.trade_ins (
    id TEXT PRIMARY KEY DEFAULT ('ti-' || substr(md5(random()::text), 1, 8)),
    device_name TEXT NOT NULL,
    device_brand TEXT,
    device_model TEXT,
    device_storage TEXT,
    condition TEXT DEFAULT 'Good' CHECK (condition IN ('Flawless', 'Excellent', 'Good', 'Fair', 'Damaged')),
    condition_notes TEXT,
    images TEXT[] DEFAULT ARRAY[]::TEXT[],
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT,
    estimated_value NUMERIC(12, 2) DEFAULT 0,
    payout_amount NUMERIC(12, 2),
    admin_grade TEXT,
    admin_notes TEXT,
    status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Rejected', 'Completed')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_trade_ins_status ON public.trade_ins(status);

-- ==============================================================================
-- 5. PAYMENTS & GATEWAYS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.payments (
    id TEXT PRIMARY KEY DEFAULT ('tx_' || substr(md5(random()::text), 1, 10)),
    order_id TEXT REFERENCES public.orders(id) ON DELETE SET NULL,
    customer_name TEXT,
    customer_email TEXT,
    amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
    currency TEXT DEFAULT 'NGN',
    gateway TEXT DEFAULT 'Kora Pay' CHECK (gateway IN ('Kora Pay', 'Paystack', 'Bank Transfer', 'Card')),
    gateway_reference TEXT UNIQUE,
    status TEXT DEFAULT 'Successful' CHECK (status IN ('Successful', 'Pending', 'Failed', 'Refunded')),
    card_type TEXT,
    card_last4 TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON public.payments(order_id);

-- ==============================================================================
-- 6. DISCOUNTS & PROMOTIONS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.discounts (
    id TEXT PRIMARY KEY DEFAULT ('disc_' || substr(md5(random()::text), 1, 8)),
    code TEXT UNIQUE NOT NULL,
    type TEXT DEFAULT 'percentage' CHECK (type IN ('percentage', 'fixed')),
    value NUMERIC(10, 2) NOT NULL DEFAULT 0,
    min_order_amount NUMERIC(12, 2) DEFAULT 0,
    max_uses INTEGER,
    times_used INTEGER DEFAULT 0,
    valid_from TIMESTAMPTZ DEFAULT NOW(),
    valid_until TIMESTAMPTZ,
    applies_to TEXT DEFAULT 'all',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_discounts_code ON public.discounts(code);

-- ==============================================================================
-- 7. CONTENT MANAGEMENT (CMS)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.content_blocks (
    id TEXT PRIMARY KEY DEFAULT ('cnt_' || substr(md5(random()::text), 1, 8)),
    type TEXT NOT NULL CHECK (type IN ('banner', 'announcement', 'page')),
    title TEXT,
    subtitle TEXT,
    message TEXT,
    body TEXT,
    image_url TEXT,
    cta_text TEXT,
    cta_link TEXT,
    slug TEXT,
    icon TEXT,
    display_location TEXT DEFAULT 'banner_bar',
    position INTEGER DEFAULT 1,
    status TEXT DEFAULT 'live' CHECK (status IN ('live', 'draft', 'scheduled')),
    valid_from TIMESTAMPTZ,
    valid_until TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_content_blocks_type ON public.content_blocks(type);

-- ==============================================================================
-- 8. STAFF & RBAC PERMISSIONS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.staff (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL DEFAULT 'Admin' CHECK (role IN ('Owner', 'Admin', 'Inventory', 'Order Manager', 'Content', 'Support', 'Analyst')),
    permissions JSONB DEFAULT '[]'::JSONB,
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    last_active_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.staff_invites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'Admin',
    permissions JSONB DEFAULT '[]'::JSONB,
    invited_by TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 9. IMMUTABLE AUDIT TRAIL
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actor_name TEXT NOT NULL DEFAULT 'System',
    actor_type TEXT NOT NULL DEFAULT 'admin' CHECK (actor_type IN ('admin', 'ai', 'system', 'automation')),
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT,
    entity_name TEXT,
    old_value JSONB,
    new_value JSONB,
    severity TEXT DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'critical')),
    approved_by TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON public.audit_logs(actor_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON public.audit_logs(entity_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);

-- ==============================================================================
-- 10. STORE CONFIGURATION & SETTINGS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.store_settings (
    id TEXT PRIMARY KEY DEFAULT 'global',
    store_name TEXT DEFAULT 'REAVO Store',
    store_description TEXT DEFAULT 'Official Flagship Store for Creators & Innovators',
    contact_email TEXT DEFAULT 'contact@reavo.ng',
    contact_phone TEXT DEFAULT '+234 800 000 7328',
    currency TEXT DEFAULT 'NGN',
    default_tax_rate NUMERIC(5, 2) DEFAULT 7.5,
    default_low_stock_threshold INTEGER DEFAULT 5,
    notifications JSONB DEFAULT '{
        "lowStock": true,
        "newOrders": true,
        "failedPayments": true,
        "tradeIns": true,
        "dailySummary": true,
        "weeklyReport": true,
        "aiAlerts": true,
        "recipients": "admin@reavo.ng"
    }'::JSONB,
    integrations JSONB DEFAULT '{
        "koraPay": { "connected": true, "environment": "live" },
        "supabase": { "connected": true },
        "gemini": { "connected": true, "model": "gemini-2.5-flash" }
    }'::JSONB,
    security JSONB DEFAULT '{
        "twoFactorEnabled": false,
        "sessionTimeoutMinutes": 60,
        "ipAllowlist": ""
    }'::JSONB,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 11. STORED PROCEDURES & RPC HELPERS
-- ==============================================================================

-- Stored Procedure: Increment Stock Atomically
CREATE OR REPLACE FUNCTION public.increment_stock(p_id TEXT, p_qty INTEGER)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF NOT public.is_admin_user() THEN
        RAISE EXCEPTION 'Access denied: Only admins can mutate inventory.';
    END IF;

    UPDATE public.products
    SET stock_quantity = stock_quantity + p_qty,
        last_restocked_at = NOW(),
        updated_at = NOW()
    WHERE id = p_id;
END;
$$;

-- Stored Procedure: Decrement Stock on Purchase (Atomic Concurrency-Safe)
CREATE OR REPLACE FUNCTION public.decrement_stock(p_id TEXT, p_qty INTEGER)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_updated INTEGER;
BEGIN
    -- Atomic conditional update: guards against negative stock and race conditions
    UPDATE public.products
    SET stock_quantity = stock_quantity - p_qty,
        updated_at = NOW()
    WHERE id = p_id AND stock_quantity >= p_qty;

    GET DIAGNOSTICS v_updated = ROW_COUNT;
    IF v_updated = 0 THEN
        RAISE EXCEPTION 'Insufficient stock for product ID: % (requested %)', p_id, p_qty;
    END IF;
END;
$$;

-- Enable Realtime for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.products;
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.customers;
ALTER PUBLICATION supabase_realtime ADD TABLE public.trade_ins;
ALTER PUBLICATION supabase_realtime ADD TABLE public.payments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.discounts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.content_blocks;
ALTER PUBLICATION supabase_realtime ADD TABLE public.staff;
ALTER PUBLICATION supabase_realtime ADD TABLE public.audit_logs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.store_settings;

-- ==============================================================================
-- 12. ROW LEVEL SECURITY (RLS) ZERO-TRUST HARDENING
-- ==============================================================================

-- Enable RLS on all operational tables
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trade_ins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;

-- Helper Function: Check if Authenticated User is Any Active REAVO Staff Member
CREATE OR REPLACE FUNCTION public.is_staff_user()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.staff 
        WHERE user_id = auth.uid() AND is_active = TRUE
    ) OR (
        auth.jwt() -> 'app_metadata' ->> 'role' IN ('Owner', 'Admin', 'superadmin')
    );
$$;

-- Helper Function: Check if Authenticated User is Primary Administrative Authority (Owner, Admin)
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.staff 
        WHERE user_id = auth.uid() AND is_active = TRUE AND role IN ('Owner', 'Admin')
    ) OR (
        auth.jwt() -> 'app_metadata' ->> 'role' IN ('Owner', 'Admin', 'superadmin')
    );
$$;

-- Public Read Policies for Storefront
CREATE POLICY "Public Read Active Products" ON public.products FOR SELECT USING (status = 'published' OR public.is_staff_user());
CREATE POLICY "Public Read Active Discounts" ON public.discounts FOR SELECT USING (is_active = TRUE OR public.is_staff_user());
CREATE POLICY "Public Read Content" ON public.content_blocks FOR SELECT USING (is_active = TRUE OR public.is_staff_user());

-- Staff Access Policies (Day-to-day operations)
CREATE POLICY "Staff Full Products Access" ON public.products FOR ALL USING (public.is_staff_user());
CREATE POLICY "Staff Full Orders Access" ON public.orders FOR ALL USING (public.is_staff_user());
CREATE POLICY "Staff Full Order Items Access" ON public.order_items FOR ALL USING (public.is_staff_user());
CREATE POLICY "Staff Full Customers Access" ON public.customers FOR ALL USING (public.is_staff_user());
CREATE POLICY "Staff Full TradeIns Access" ON public.trade_ins FOR ALL USING (public.is_staff_user());
CREATE POLICY "Staff Full Payments Access" ON public.payments FOR ALL USING (public.is_staff_user());
CREATE POLICY "Staff Full Discounts Access" ON public.discounts FOR ALL USING (public.is_staff_user());
CREATE POLICY "Staff Full Content Access" ON public.content_blocks FOR ALL USING (public.is_staff_user());

-- Restricted High-Privilege Policies (Owner & Admin ONLY)
CREATE POLICY "Staff Read Staff Directory" ON public.staff FOR SELECT USING (public.is_staff_user());
CREATE POLICY "Admin Full Staff Access" ON public.staff FOR ALL USING (public.is_admin_user());
CREATE POLICY "Admin Full Settings Access" ON public.store_settings FOR ALL USING (public.is_admin_user());

-- IMMUTABLE AUDIT LOG POLICY: Inserts and Reads allowed, NO UPDATES OR DELETIONS
CREATE POLICY "Admin Read Audit Logs" ON public.audit_logs FOR SELECT USING (public.is_admin_user());
CREATE POLICY "System Insert Audit Logs" ON public.audit_logs FOR INSERT WITH CHECK (TRUE);
-- (No UPDATE or DELETE policy is defined, rendering audit logs immutable)

-- ==========================================
-- ADDED DURING KORA INTEGRATION & PARTNERSHIPS
-- ==========================================

CREATE TABLE IF NOT EXISTS public.payouts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    recipient_name TEXT NOT NULL,
    account_number TEXT NOT NULL,
    bank_code TEXT NOT NULL,
    amount NUMERIC(12, 2) NOT NULL,
    status TEXT DEFAULT 'pending',
    reference TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.partnership_inquiries (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    organisation TEXT NOT NULL,
    email TEXT NOT NULL,
    type TEXT NOT NULL,
    message TEXT,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

ALTER TABLE public.payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partnership_inquiries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin Full Payouts Access" ON public.payouts FOR ALL USING (public.is_admin_user() OR auth.role() = 'service_role');

CREATE POLICY "Admin Full Partnership Inquiries Access" ON public.partnership_inquiries FOR ALL USING (public.is_admin_user());
CREATE POLICY "System Insert Partnership Inquiries" ON public.partnership_inquiries FOR INSERT WITH CHECK (TRUE);

-- ==============================================================================
-- 13. SECURE STAFF ONBOARDING RPCS & PERMISSIONS (ZERO-TRUST PRIVILEGE ENFORCEMENT)
-- ==============================================================================

-- Admin-only access policy for managing staff invites directly
CREATE POLICY "Admin Full Staff Invites Access" ON public.staff_invites FOR ALL USING (public.is_admin_user());

-- Public RPC: Retrieve non-sensitive invite metadata for pending token without leaking full table
CREATE OR REPLACE FUNCTION public.get_staff_invite(p_token UUID)
RETURNS TABLE (
    id UUID,
    name TEXT,
    email TEXT,
    role TEXT,
    status TEXT
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
    SELECT id, name, email, role, status
    FROM public.staff_invites
    WHERE id = p_token AND status = 'pending';
$$;

-- Secure RPC: Validate token and register staff member with server-enforced role and email verification
CREATE OR REPLACE FUNCTION public.accept_staff_invite(
    p_token UUID,
    p_user_id UUID,
    p_email TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_invite RECORD;
    v_staff_id UUID;
BEGIN
    -- 1. Fetch and validate pending invite
    SELECT * INTO v_invite
    FROM public.staff_invites
    WHERE id = p_token AND status = 'pending';

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Invalid or expired invitation token.';
    END IF;

    -- 2. Verify email match to prevent token hijacking across accounts
    IF LOWER(TRIM(v_invite.email)) <> LOWER(TRIM(p_email)) THEN
        RAISE EXCEPTION 'Authenticated email does not match invitation recipient.';
    END IF;

    -- 3. Upsert into public.staff using the server-side role & permissions strictly from the invite
    INSERT INTO public.staff (user_id, name, email, role, permissions, is_active)
    VALUES (p_user_id, v_invite.name, v_invite.email, v_invite.role, v_invite.permissions, TRUE)
    ON CONFLICT (email) DO UPDATE
    SET user_id = p_user_id,
        role = v_invite.role,
        permissions = v_invite.permissions,
        is_active = TRUE,
        updated_at = NOW()
    RETURNING id INTO v_staff_id;

    -- 4. Mark invite as accepted atomically
    UPDATE public.staff_invites
    SET status = 'accepted'
    WHERE id = p_token;

    -- 5. Record immutable audit log
    INSERT INTO public.audit_logs (actor_name, actor_type, action, entity_type, entity_id, entity_name, new_value, severity)
    VALUES (v_invite.name, 'admin', 'ACCEPT_STAFF_INVITE', 'staff', v_staff_id::TEXT, v_invite.name, jsonb_build_object('role', v_invite.role, 'email', v_invite.email), 'info');

    RETURN jsonb_build_object('success', TRUE, 'staff_id', v_staff_id, 'role', v_invite.role);
END;
$$;



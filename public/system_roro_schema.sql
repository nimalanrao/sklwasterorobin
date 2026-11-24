-- ==============================================================================
-- SKL WASTE SDN BHD: SYSTEM RORO SCHEMA (RUN IN SUPABASE SQL EDITOR)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.system_roro_records (
    id TEXT PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    date_start DATE NOT NULL,
    date_end DATE NOT NULL,
    bin_owner TEXT NOT NULL DEFAULT 'SKL Waste' CHECK (bin_owner IN ('SKL Waste', 'Thirumal Vel Enterprise')),
    customer_name TEXT,
    customer_phone TEXT NOT NULL DEFAULT '',
    location TEXT NOT NULL,
    price NUMERIC(10, 2) NOT NULL DEFAULT 0,
    size TEXT NOT NULL CHECK (size IN ('2 Feet', '4 Feet')),
    status TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Overdue', 'Completed')),
    completed_at TIMESTAMPTZ,
    notes TEXT
);

-- Safe migrations if the table already exists:
ALTER TABLE public.system_roro_records ADD COLUMN IF NOT EXISTS customer_phone TEXT NOT NULL DEFAULT '';
ALTER TABLE public.system_roro_records ADD COLUMN IF NOT EXISTS bin_owner TEXT NOT NULL DEFAULT 'SKL Waste';

-- Enable Row Level Security (RLS)
ALTER TABLE public.system_roro_records ENABLE ROW LEVEL SECURITY;

-- Policies for internal System RORO admin access
DROP POLICY IF EXISTS "Allow anon read all system_roro_records" ON public.system_roro_records;
DROP POLICY IF EXISTS "Allow anon insert system_roro_records" ON public.system_roro_records;
DROP POLICY IF EXISTS "Allow anon update system_roro_records" ON public.system_roro_records;
DROP POLICY IF EXISTS "Allow anon delete system_roro_records" ON public.system_roro_records;

CREATE POLICY "Allow anon read all system_roro_records"
ON public.system_roro_records FOR SELECT USING (true);

CREATE POLICY "Allow anon insert system_roro_records"
ON public.system_roro_records FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow anon update system_roro_records"
ON public.system_roro_records FOR UPDATE USING (true);

CREATE POLICY "Allow anon delete system_roro_records"
ON public.system_roro_records FOR DELETE USING (true);

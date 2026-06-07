-- ============================================================================
-- MASTER DATABASE SCHEMA - SENTINELAI
-- Idempotent, Production-Ready, and Supabase-Compatible
-- ============================================================================

-- Enable UUID extension if not already present
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ----------------------------------------------------------------------------
-- 1. ENUMS SETUP (Idempotent creation via anonymous DO blocks)
-- ----------------------------------------------------------------------------

DO $$ BEGIN
    CREATE TYPE public.severity_enum AS ENUM ('critical', 'high', 'medium', 'low');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.incident_status_enum AS ENUM ('pending', 'dispatched', 'resolved');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.resource_status_enum AS ENUM ('available', 'busy', 'offline');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ----------------------------------------------------------------------------
-- 2. CREATE TABLES (Idempotent base structure)
-- ----------------------------------------------------------------------------

-- A. Users Table
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL DEFAULT 'operator'
);

-- B. Resources Table
CREATE TABLE IF NOT EXISTS public.resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resource_type TEXT NOT NULL,
    name TEXT NOT NULL,
    status public.resource_status_enum NOT NULL DEFAULT 'available',
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    availability BOOLEAN NOT NULL DEFAULT true,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- C. Incidents Table
CREATE TABLE IF NOT EXISTS public.incidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    incident_type TEXT NOT NULL,
    severity public.severity_enum NOT NULL DEFAULT 'medium',
    status public.incident_status_enum NOT NULL DEFAULT 'pending',
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    reported_by TEXT,
    assigned_resource UUID REFERENCES public.resources(id) ON DELETE SET NULL,
    priority_score DOUBLE PRECISION,
    ai_summary TEXT,
    recommended_resource_type TEXT,
    ai_confidence DOUBLE PRECISION,
    assigned_at TIMESTAMP WITH TIME ZONE,
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- D. Alerts Table
CREATE TABLE IF NOT EXISTS public.alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    message TEXT,
    severity public.severity_enum NOT NULL DEFAULT 'medium',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- E. Incident Events Table
CREATE TABLE IF NOT EXISTS public.incident_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    incident_id UUID NOT NULL REFERENCES public.incidents(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- F. Messages Table (Retained for Chat/AI Copilot UI compatibility)
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender TEXT NOT NULL,
    content TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ----------------------------------------------------------------------------
-- 3. ENSURE COLUMNS (ALTER TABLE ADD COLUMN IF NOT EXISTS)
-- ----------------------------------------------------------------------------

-- Users columns check
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS role TEXT;

-- Resources columns check
ALTER TABLE public.resources ADD COLUMN IF NOT EXISTS resource_type TEXT;
ALTER TABLE public.resources ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE public.resources ADD COLUMN IF NOT EXISTS status public.resource_status_enum;
ALTER TABLE public.resources ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION;
ALTER TABLE public.resources ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;
ALTER TABLE public.resources ADD COLUMN IF NOT EXISTS availability BOOLEAN;
ALTER TABLE public.resources ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE;

-- Incidents columns check
ALTER TABLE public.incidents ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE public.incidents ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.incidents ADD COLUMN IF NOT EXISTS incident_type TEXT;
ALTER TABLE public.incidents ADD COLUMN IF NOT EXISTS severity public.severity_enum;
ALTER TABLE public.incidents ADD COLUMN IF NOT EXISTS status public.incident_status_enum;
ALTER TABLE public.incidents ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION;
ALTER TABLE public.incidents ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;
ALTER TABLE public.incidents ADD COLUMN IF NOT EXISTS reported_by TEXT;
ALTER TABLE public.incidents ADD COLUMN IF NOT EXISTS assigned_resource UUID;
ALTER TABLE public.incidents ADD COLUMN IF NOT EXISTS priority_score DOUBLE PRECISION;
ALTER TABLE public.incidents ADD COLUMN IF NOT EXISTS ai_summary TEXT;
ALTER TABLE public.incidents ADD COLUMN IF NOT EXISTS recommended_resource_type TEXT;
ALTER TABLE public.incidents ADD COLUMN IF NOT EXISTS ai_confidence DOUBLE PRECISION;
ALTER TABLE public.incidents ADD COLUMN IF NOT EXISTS assigned_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.incidents ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.incidents ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE;

-- Alerts columns check
ALTER TABLE public.alerts ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE public.alerts ADD COLUMN IF NOT EXISTS message TEXT;
ALTER TABLE public.alerts ADD COLUMN IF NOT EXISTS severity public.severity_enum;
ALTER TABLE public.alerts ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE;

-- Incident Events columns check
ALTER TABLE public.incident_events ADD COLUMN IF NOT EXISTS incident_id UUID;
ALTER TABLE public.incident_events ADD COLUMN IF NOT EXISTS event_type TEXT;
ALTER TABLE public.incident_events ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.incident_events ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE;

-- Messages columns check
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS sender TEXT;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS content TEXT;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS timestamp TIMESTAMP WITH TIME ZONE;

-- ----------------------------------------------------------------------------
-- 4. INDEXES SETUP (Improves search performance)
-- ----------------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_incidents_status ON public.incidents(status);
CREATE INDEX IF NOT EXISTS idx_incidents_severity ON public.incidents(severity);
CREATE INDEX IF NOT EXISTS idx_resources_status ON public.resources(status);
CREATE INDEX IF NOT EXISTS idx_incident_events_incident_id ON public.incident_events(incident_id);

-- ----------------------------------------------------------------------------
-- 5. TRIGGER FOR TIMESTAMP SYNCHRONIZATION
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_resources_updated ON public.resources;
CREATE TRIGGER on_resources_updated
    BEFORE UPDATE ON public.resources
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- ----------------------------------------------------------------------------
-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- ----------------------------------------------------------------------------

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incident_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Select policies (Allow authenticated users to read)
DROP POLICY IF EXISTS "Allow authenticated select for users" ON public.users;
CREATE POLICY "Allow authenticated select for users" ON public.users FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow authenticated select for resources" ON public.resources;
CREATE POLICY "Allow authenticated select for resources" ON public.resources FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow authenticated select for incidents" ON public.incidents;
CREATE POLICY "Allow authenticated select for incidents" ON public.incidents FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow authenticated select for alerts" ON public.alerts;
CREATE POLICY "Allow authenticated select for alerts" ON public.alerts FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow authenticated select for incident_events" ON public.incident_events;
CREATE POLICY "Allow authenticated select for incident_events" ON public.incident_events FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow authenticated select for messages" ON public.messages;
CREATE POLICY "Allow authenticated select for messages" ON public.messages FOR SELECT TO authenticated USING (true);

-- Insert policies (Allow authenticated users to create)
DROP POLICY IF EXISTS "Allow authenticated insert for users" ON public.users;
CREATE POLICY "Allow authenticated insert for users" ON public.users FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated insert for resources" ON public.resources;
CREATE POLICY "Allow authenticated insert for resources" ON public.resources FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated insert for incidents" ON public.incidents;
CREATE POLICY "Allow authenticated insert for incidents" ON public.incidents FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated insert for alerts" ON public.alerts;
CREATE POLICY "Allow authenticated insert for alerts" ON public.alerts FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated insert for incident_events" ON public.incident_events;
CREATE POLICY "Allow authenticated insert for incident_events" ON public.incident_events FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated insert for messages" ON public.messages;
CREATE POLICY "Allow authenticated insert for messages" ON public.messages FOR INSERT TO authenticated WITH CHECK (true);

-- Update policies (Allow authenticated users to modify)
DROP POLICY IF EXISTS "Allow authenticated update for users" ON public.users;
CREATE POLICY "Allow authenticated update for users" ON public.users FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated update for resources" ON public.resources;
CREATE POLICY "Allow authenticated update for resources" ON public.resources FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated update for incidents" ON public.incidents;
CREATE POLICY "Allow authenticated update for incidents" ON public.incidents FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated update for alerts" ON public.alerts;
CREATE POLICY "Allow authenticated update for alerts" ON public.alerts FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated update for incident_events" ON public.incident_events;
CREATE POLICY "Allow authenticated update for incident_events" ON public.incident_events FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated update for messages" ON public.messages;
CREATE POLICY "Allow authenticated update for messages" ON public.messages FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- ----------------------------------------------------------------------------
-- 7. SUPABASE REALTIME CONFIGURATION
-- ----------------------------------------------------------------------------

DO $$
BEGIN
    -- Enable realtime for public.incidents
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'incidents'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.incidents;
    END IF;

    -- Enable realtime for public.resources
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'resources'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.resources;
    END IF;

    -- Enable realtime for public.alerts
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'alerts'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.alerts;
    END IF;

    -- Enable realtime for public.incident_events
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'incident_events'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.incident_events;
    END IF;
EXCEPTION
    WHEN undefined_object THEN
        -- Fallback: Create publication if it doesn't exist
        CREATE PUBLICATION supabase_realtime FOR TABLE 
            public.incidents, 
            public.resources, 
            public.alerts, 
            public.incident_events;
END $$;

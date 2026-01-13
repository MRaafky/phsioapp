-- PhsioApp Database Schema for Supabase
-- Run this script in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ====================================
-- USERS TABLE
-- ====================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    age TEXT,
    weight TEXT,
    height TEXT,
    is_premium BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster email lookups
CREATE INDEX idx_users_email ON users(email);

-- ====================================
-- EXERCISE PLANS TABLE
-- ====================================
CREATE TABLE exercise_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    plan_title TEXT NOT NULL,
    duration_weeks INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster user plan lookups
CREATE INDEX idx_exercise_plans_user_id ON exercise_plans(user_id);
CREATE INDEX idx_exercise_plans_active ON exercise_plans(user_id, is_active);

-- ====================================
-- WEEKLY PLANS TABLE
-- ====================================
CREATE TABLE weekly_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    plan_id UUID REFERENCES exercise_plans(id) ON DELETE CASCADE,
    week_number INTEGER NOT NULL,
    focus TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster plan lookups
CREATE INDEX idx_weekly_plans_plan_id ON weekly_plans(plan_id);

-- ====================================
-- EXERCISES TABLE
-- ====================================
CREATE TABLE exercises (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    weekly_plan_id UUID REFERENCES weekly_plans(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    sets TEXT,
    reps TEXT,
    notes TEXT,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster weekly plan lookups
CREATE INDEX idx_exercises_weekly_plan_id ON exercises(weekly_plan_id);

-- ====================================
-- USER PROGRESS TABLE
-- ====================================
CREATE TABLE user_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    plan_id UUID REFERENCES exercise_plans(id) ON DELETE CASCADE,
    progress_percent NUMERIC(5,2) DEFAULT 0,
    current_week INTEGER DEFAULT 1,
    completed_sessions INTEGER DEFAULT 0,
    weekly_completions JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, plan_id)
);

-- Index for faster progress lookups
CREATE INDEX idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX idx_user_progress_plan_id ON user_progress(plan_id);

-- ====================================
-- ADMIN MESSAGES TABLE
-- ====================================
CREATE TABLE admin_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster user message lookups
CREATE INDEX idx_admin_messages_user_id ON admin_messages(user_id);
CREATE INDEX idx_admin_messages_unread ON admin_messages(user_id, read);

-- ====================================
-- ANNOUNCEMENTS TABLE
-- ====================================
CREATE TABLE announcements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster date-based sorting
CREATE INDEX idx_announcements_created_at ON announcements(created_at DESC);

-- ====================================
-- JOURNALS TABLE
-- ====================================
CREATE TABLE journals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    publisher TEXT NOT NULL,
    year INTEGER NOT NULL,
    link TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster title-based sorting
CREATE INDEX idx_journals_title ON journals(title);

-- ====================================
-- PLAN HISTORY TABLE
-- ====================================
CREATE TABLE plan_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    plan_title TEXT NOT NULL,
    duration_weeks INTEGER NOT NULL,
    completed_date TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT CHECK (status IN ('Completed', 'Replaced')) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster user history lookups
CREATE INDEX idx_plan_history_user_id ON plan_history(user_id);
CREATE INDEX idx_plan_history_completed_date ON plan_history(user_id, completed_date DESC);

-- ====================================
-- AUTO-UPDATE TIMESTAMPS
-- ====================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_exercise_plans_updated_at BEFORE UPDATE ON exercise_plans
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_progress_updated_at BEFORE UPDATE ON user_progress
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ====================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE journals ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_history ENABLE ROW LEVEL SECURITY;

-- Users table policies
CREATE POLICY "Users can view their own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Exercise plans policies
CREATE POLICY "Users can view their own plans" ON exercise_plans
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own plans" ON exercise_plans
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own plans" ON exercise_plans
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own plans" ON exercise_plans
    FOR DELETE USING (auth.uid() = user_id);

-- Weekly plans policies (inherit from exercise_plans)
CREATE POLICY "Users can view weekly plans of their plans" ON weekly_plans
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM exercise_plans 
            WHERE exercise_plans.id = weekly_plans.plan_id 
            AND exercise_plans.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create weekly plans for their plans" ON weekly_plans
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM exercise_plans 
            WHERE exercise_plans.id = weekly_plans.plan_id 
            AND exercise_plans.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update weekly plans of their plans" ON weekly_plans
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM exercise_plans 
            WHERE exercise_plans.id = weekly_plans.plan_id 
            AND exercise_plans.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete weekly plans of their plans" ON weekly_plans
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM exercise_plans 
            WHERE exercise_plans.id = weekly_plans.plan_id 
            AND exercise_plans.user_id = auth.uid()
        )
    );

-- Exercises policies (inherit from weekly_plans)
CREATE POLICY "Users can view exercises of their weekly plans" ON exercises
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM weekly_plans 
            JOIN exercise_plans ON exercise_plans.id = weekly_plans.plan_id
            WHERE weekly_plans.id = exercises.weekly_plan_id 
            AND exercise_plans.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create exercises for their weekly plans" ON exercises
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM weekly_plans 
            JOIN exercise_plans ON exercise_plans.id = weekly_plans.plan_id
            WHERE weekly_plans.id = exercises.weekly_plan_id 
            AND exercise_plans.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update exercises of their weekly plans" ON exercises
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM weekly_plans 
            JOIN exercise_plans ON exercise_plans.id = weekly_plans.plan_id
            WHERE weekly_plans.id = exercises.weekly_plan_id 
            AND exercise_plans.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete exercises of their weekly plans" ON exercises
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM weekly_plans 
            JOIN exercise_plans ON exercise_plans.id = weekly_plans.plan_id
            WHERE weekly_plans.id = exercises.weekly_plan_id 
            AND exercise_plans.user_id = auth.uid()
        )
    );

-- User progress policies
CREATE POLICY "Users can view their own progress" ON user_progress
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own progress" ON user_progress
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress" ON user_progress
    FOR UPDATE USING (auth.uid() = user_id);

-- Admin messages policies
CREATE POLICY "Users can view their own messages" ON admin_messages
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own messages" ON admin_messages
    FOR UPDATE USING (auth.uid() = user_id);

-- Announcements policies (public read)
CREATE POLICY "Anyone can view announcements" ON announcements
    FOR SELECT TO authenticated USING (true);

-- Journals policies (public read)
CREATE POLICY "Anyone can view journals" ON journals
    FOR SELECT TO authenticated USING (true);

-- Plan history policies
CREATE POLICY "Users can view their own plan history" ON plan_history
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own plan history" ON plan_history
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ====================================
-- SEED DATA
-- ====================================

-- Insert initial journals
INSERT INTO journals (title, publisher, year, link) VALUES
    ('Journal of Orthopaedic & Sports Physical Therapy (JOSPT)', 'JOSPT', 1979, 'https://www.jospt.org/'),
    ('Physical Therapy Journal (PTJ)', 'Oxford University Press', 1921, 'https://academic.oup.com/ptj'),
    ('PubMed', 'National Library of Medicine (NLM)', 1996, 'https://pubmed.ncbi.nlm.nih.gov/'),
    ('The Lancet', 'Elsevier', 1823, 'https://www.thelancet.com/'),
    ('ResearchGate', 'ResearchGate GmbH', 2008, 'https://www.researchgate.net/'),
    ('British Journal of Sports Medicine (BJSM)', 'BMJ', 1964, 'https://bjsm.bmj.com/'),
    ('Archives of Physical Medicine and Rehabilitation', 'Elsevier', 1920, 'https://www.archives-pmr.org/')
ON CONFLICT DO NOTHING;

-- ====================================
-- HELPER FUNCTIONS
-- ====================================

-- Function to get user's active plan with all details
CREATE OR REPLACE FUNCTION get_user_active_plan(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'planTitle', ep.plan_title,
        'durationWeeks', ep.duration_weeks,
        'weeklyPlans', (
            SELECT json_agg(
                json_build_object(
                    'week', wp.week_number,
                    'focus', wp.focus,
                    'exercises', (
                        SELECT json_agg(
                            json_build_object(
                                'name', e.name,
                                'sets', e.sets,
                                'reps', e.reps,
                                'notes', e.notes
                            ) ORDER BY e.order_index
                        )
                        FROM exercises e
                        WHERE e.weekly_plan_id = wp.id
                    )
                ) ORDER BY wp.week_number
            )
            FROM weekly_plans wp
            WHERE wp.plan_id = ep.id
        )
    )
    INTO result
    FROM exercise_plans ep
    WHERE ep.user_id = p_user_id AND ep.is_active = true
    LIMIT 1;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

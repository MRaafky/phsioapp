import { getSupabase, isSupabaseConfigured, handleSupabaseError } from '../lib/supabase';
import type { User, ExercisePlan, ProgramProgress, AdminMessage } from '../types';

const DB_KEY = 'physcio_app_data';

// ====================================
// HELPER FUNCTIONS FOR LOCALSTORAGE
// ====================================

// Default state for a new user
const createDefaultUser = (id: string, name: string, email: string): User => ({
    id,
    name,
    email,
    age: '30',
    weight: '70',
    height: '175',
    isPremium: false,
    activePlan: null,
    progressData: null,
    messagesFromAdmin: [],
    planHistory: [],
});

const getDb = (): { users: User[] } => {
    try {
        const data = localStorage.getItem(DB_KEY);
        const parsed = data ? JSON.parse(data) : { users: [] };
        if (!Array.isArray(parsed.users)) {
            return { users: [] };
        }
        return parsed;
    } catch (error) {
        console.error("Failed to parse user data from localStorage", error);
        return { users: [] };
    }
};

const saveDb = (db: { users: User[] }) => {
    const fullDb = JSON.parse(localStorage.getItem(DB_KEY) || '{}');
    fullDb.users = db.users;
    localStorage.setItem(DB_KEY, JSON.stringify(fullDb));
};

// ====================================
// LOCALSTORAGE IMPLEMENTATION
// ====================================

const getUsers_localStorage = async (): Promise<User[]> => {
    return getDb().users;
};

const getUser_localStorage = async (userId: string): Promise<User | undefined> => {
    const db = getDb();
    const user = db.users.find(u => u.id === userId);
    if (user) {
        return {
            ...createDefaultUser(user.id, user.name, user.email),
            ...user
        };
    }
    return undefined;
};

const updateUser_localStorage = async (updatedUser: User): Promise<void> => {
    const db = getDb();
    const userIndex = db.users.findIndex(u => u.id === updatedUser.id);
    if (userIndex > -1) {
        db.users[userIndex] = updatedUser;
        saveDb(db);
    } else {
        console.error("User not found for update:", updatedUser.id);
    }
};

const registerUser_localStorage = async (name: string, email: string, password: string): Promise<{ success: boolean; message: string; user?: User }> => {
    const db = getDb();
    const normalizedEmail = email.toLowerCase();

    if (db.users.some(u => u.email.toLowerCase() === normalizedEmail)) {
        return { success: false, message: 'An account with this email already exists.' };
    }

    const newUserId = `user_${Date.now()}`;
    const newUser = createDefaultUser(newUserId, name, email);

    db.users.push(newUser);
    saveDb(db);

    return { success: true, message: 'Registration successful!', user: newUser };
};

const authenticateUser_localStorage = async (email: string, password: string): Promise<User | null> => {
    const db = getDb();
    const normalizedEmail = email.toLowerCase();

    const user = db.users.find(u => u.email.toLowerCase() === normalizedEmail);

    if (user) {
        return await getUser_localStorage(user.id) || null;
    }

    return null;
};

// ====================================
// SUPABASE IMPLEMENTATION
// ====================================

const getUsers_supabase = async (): Promise<User[]> => {
    const supabase = getSupabase();
    const { data, error } = await supabase
        .from('users')
        .select('*') as any;

    if (error) {
        handleSupabaseError(error, 'getUsers');
    }

    // Transform Supabase data to User type
    return (data || []).map(dbUser => ({
        id: dbUser.id,
        name: dbUser.name,
        email: dbUser.email,
        age: dbUser.age || '30',
        weight: dbUser.weight || '70',
        height: dbUser.height || '175',
        isPremium: dbUser.is_premium,
        activePlan: null, // Will be loaded separately if needed
        progressData: null,
        messagesFromAdmin: [],
        planHistory: [],
    }));
};

const getUser_supabase = async (userId: string): Promise<User | undefined> => {
    const supabase = getSupabase();

    // Get user basic info
    const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single() as any;

    if (userError || !userData) {
        if (userError) handleSupabaseError(userError, 'getUser');
        return undefined;
    }

    // Get user's active plan with all details
    const { data: planData } = await supabase
        .rpc('get_user_active_plan', { p_user_id: userId }) as any;

    // Get user's progress
    const { data: progressData } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single() as any;

    // Get user's messages
    const { data: messagesData } = await supabase
        .from('admin_messages')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false }) as any;

    // Get plan history
    const { data: historyData } = await supabase
        .from('plan_history')
        .select('*')
        .eq('user_id', userId)
        .order('completed_date', { ascending: false }) as any;

    const user: User = {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        age: userData.age || '30',
        weight: userData.weight || '70',
        height: userData.height || '175',
        isPremium: userData.is_premium,
        activePlan: planData || null,
        progressData: progressData ? {
            progressPercent: Number(progressData.progress_percent),
            currentWeek: progressData.current_week,
            completedSessions: progressData.completed_sessions,
            totalWeeks: planData?.durationWeeks || 0,
            sessionsPerWeek: 3, // Default value
            weeklyCompletions: progressData.weekly_completions || [],
        } : null,
        messagesFromAdmin: (messagesData || []).map(msg => ({
            id: msg.id,
            text: msg.text,
            timestamp: msg.created_at,
            read: msg.read,
        })),
        planHistory: (historyData || []).map(history => ({
            planTitle: history.plan_title,
            durationWeeks: history.duration_weeks,
            completedDate: history.completed_date,
            status: history.status as 'Completed' | 'Replaced',
        })),
    };

    return user;
};

const updateUser_supabase = async (updatedUser: User): Promise<void> => {
    const supabase = getSupabase();

    // Update user basic info
    const { error } = await supabase
        .from('users')
        .update({
            name: updatedUser.name,
            email: updatedUser.email,
            age: updatedUser.age,
            weight: updatedUser.weight,
            height: updatedUser.height,
            is_premium: updatedUser.isPremium,
        } as any)
        .eq('id', updatedUser.id);

    if (error) {
        handleSupabaseError(error, 'updateUser');
    }

    // Note: Exercise plans, progress, and messages are updated through separate functions
};

const registerUser_supabase = async (name: string, email: string, password: string): Promise<{ success: boolean; message: string; user?: User }> => {
    const supabase = getSupabase();

    // Check if user already exists
    const { data: existing } = await supabase
        .from('users')
        .select('id')
        .eq('email', email.toLowerCase())
        .single();

    if (existing) {
        return { success: false, message: 'An account with this email already exists.' };
    }

    // Register user with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email.toLowerCase(),
        password: password,
        options: {
            data: {
                name: name
            },
            emailRedirectTo: `${window.location.origin}/` // Use current domain instead of localhost
        }
    });

    if (authError || !authData.user) {
        return { success: false, message: authError?.message || 'Registration failed.' };
    }

    // Check if email confirmation is required
    // If session exists, user is auto-confirmed (local dev)
    // If no session, email confirmation is required (production)
    const hasSession = !!authData.session;

    if (hasSession) {
        // Email confirmation disabled (local dev) - create profile immediately
        await new Promise(resolve => setTimeout(resolve, 500));

        const { data: userData, error: fetchError } = await supabase
            .from('users')
            .select('*')
            .eq('id', authData.user.id)
            .single();

        if (fetchError || !userData) {
            // Try to create profile manually if it doesn't exist
            const { data: newUserData, error: insertError } = await supabase
                .from('users')
                .insert({
                    id: authData.user.id,
                    email: email.toLowerCase(),
                    name: name,
                    age: '30',
                    weight: '70',
                    height: '175',
                    is_premium: false,
                } as any)
                .select()
                .single();

            if (insertError || !newUserData) {
                console.error('Failed to create user profile:', insertError);
                return { success: false, message: 'Registration failed. Please try again.' };
            }

            const newUser: User = {
                id: newUserData.id,
                name: newUserData.name,
                email: newUserData.email,
                age: newUserData.age || '30',
                weight: newUserData.weight || '70',
                height: newUserData.height || '175',
                isPremium: newUserData.is_premium,
                activePlan: null,
                progressData: null,
                messagesFromAdmin: [],
                planHistory: [],
            };

            return { success: true, message: 'Registration successful!', user: newUser };
        }

        const newUser: User = {
            id: userData.id,
            name: userData.name,
            email: userData.email,
            age: userData.age || '30',
            weight: userData.weight || '70',
            height: userData.height || '175',
            isPremium: userData.is_premium,
            activePlan: null,
            progressData: null,
            messagesFromAdmin: [],
            planHistory: [],
        };

        return { success: true, message: 'Registration successful!', user: newUser };
    } else {
        // Email confirmation required (production)
        // Return success but no user object - UI will show "Check your email" message
        return {
            success: true,
            message: 'Registration successful! Please check your email to confirm your account before signing in.',
            user: undefined
        };
    }
};

const authenticateUser_supabase = async (email: string, password: string): Promise<User | null> => {
    const supabase = getSupabase();

    // Sign in with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase(),
        password: password,
    });

    if (authError || !authData.user) {
        console.error('Authentication failed:', authError?.message);
        return null;
    }

    // Get user data
    const user = await getUser_supabase(authData.user.id);
    return user || null;
};

// ====================================
// PUBLIC API - Auto-detects mode
// ====================================

export const initializeUsers = () => {
    // Always initialize guest user in localStorage regardless of Supabase config
    const db = getDb();
    const guestUserExists = db.users.some(u => u.id === 'guest_user');

    if (!guestUserExists) {
        const guestUser = createDefaultUser('guest_user', 'Guest User', 'guest@physcio.com');
        db.users.push(guestUser);
        saveDb(db);
    }

    // Initialize other default users only if NOT using Supabase (to avoid confusion/bloat)
    if (!isSupabaseConfigured()) {
        // Logic for other users if needed, or just leave it as is since guest login is the main issue
    }
};

export const getUsers = async (): Promise<User[]> => {
    if (isSupabaseConfigured()) {
        return await getUsers_supabase();
    }
    return await getUsers_localStorage();
};

export const getUser = async (userId: string): Promise<User | undefined> => {
    // Special case: guest user always from localStorage
    if (userId === 'guest_user') {
        return await getUser_localStorage(userId);
    }

    if (isSupabaseConfigured()) {
        return await getUser_supabase(userId);
    }
    return await getUser_localStorage(userId);
};

export const updateUser = async (updatedUser: User): Promise<void> => {
    if (isSupabaseConfigured()) {
        return await updateUser_supabase(updatedUser);
    }
    return await updateUser_localStorage(updatedUser);
};

export const registerUser = async (name: string, email: string, password: string): Promise<{ success: boolean; message: string; user?: User }> => {
    if (isSupabaseConfigured()) {
        return await registerUser_supabase(name, email, password);
    }
    return await registerUser_localStorage(name, email, password);
};

export const authenticateUser = async (email: string, password: string): Promise<User | null> => {
    if (isSupabaseConfigured()) {
        return await authenticateUser_supabase(email, password);
    }
    return await authenticateUser_localStorage(email, password);
};
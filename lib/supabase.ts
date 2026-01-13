import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Database type definitions
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string;
          age: string | null;
          weight: string | null;
          height: string | null;
          is_premium: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          name: string;
          age?: string;
          weight?: string;
          height?: string;
          is_premium?: boolean;
        };
        Update: {
          email?: string;
          name?: string;
          age?: string;
          weight?: string;
          height?: string;
          is_premium?: boolean;
        };
      };
      exercise_plans: {
        Row: {
          id: string;
          user_id: string;
          plan_title: string;
          duration_weeks: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
      };
      announcements: {
        Row: {
          id: string;
          title: string;
          content: string;
          created_at: string;
        };
        Insert: {
          title: string;
          content: string;
        };
      };
      journals: {
        Row: {
          id: string;
          title: string;
          publisher: string;
          year: number;
          link: string;
          created_at: string;
        };
        Insert: {
          title: string;
          publisher: string;
          year: number;
          link: string;
        };
      };
    };
  };
}

// Get Supabase URL and Key from environment variables
const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

// Debug log for production
console.log('Supabase Config Status:', {
  hasUrl: !!supabaseUrl,
  hasKey: !!supabaseAnonKey,
  urlPrefix: supabaseUrl ? supabaseUrl.substring(0, 8) : 'none'
});

// Create Supabase client
let supabase: SupabaseClient<Database> | null = null;

export const getSupabase = (): SupabaseClient<Database> => {
  if (!supabase) {
    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn('Supabase credentials not found. Running in demo mode with localStorage.');
      throw new Error('Supabase not configured');
    }
    supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
  }
  return supabase;
};

// Check if Supabase is configured
export const isSupabaseConfigured = (): boolean => {
  return !!(supabaseUrl && supabaseAnonKey);
};

// Helper function to handle Supabase errors
export const handleSupabaseError = (error: any, context: string) => {
  console.error(`Supabase error in ${context}:`, error);
  throw new Error(error.message || 'An error occurred with the database');
};

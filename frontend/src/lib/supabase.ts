import { createClient } from '@supabase/supabase-js';

// Access environment variables using import.meta.env (Standard for Vite/Astro)
const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('⚠️ Supabase keys are missing! Check your .env file.');
}

// Create the single instance
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper to check if configured
export const isSupabaseConfigured = () => {
    return supabaseUrl && supabaseAnonKey;
}
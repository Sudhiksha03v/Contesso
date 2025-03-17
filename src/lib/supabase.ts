import { createClient } from '@supabase/supabase-js';
import type { Database } from './types'; // Generated types

// Retrieve environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL and Anon Key must be provided in environment variables');
}

// Initialize Supabase client with type support
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true, // Persist auth session in localStorage
    autoRefreshToken: true, // Auto-refresh expired tokens
    detectSessionInUrl: true, // Detect session from URL (e.g., OAuth)
  },
});
// lib/supabase.ts

// CRITICAL FIX: Add browser globals polyfills for React Native
// This prevents "window is not defined" errors in Supabase auth
if (typeof global !== 'undefined' && typeof window === 'undefined') {
  // @ts-ignore - Polyfill window for React Native
  global.window = global;
  // @ts-ignore - Polyfill document for React Native  
  global.document = {};
  // @ts-ignore - Polyfill localStorage fallback (AsyncStorage used separately)
  global.localStorage = {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
    clear: () => {},
    length: 0,
    key: () => null
  };
}

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';
import { Database } from '../types/database.types';

// FIX: Changed from NEXT_PUBLIC_ to EXPO_PUBLIC_ to match Expo's convention.
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

// This check is crucial. It ensures the app fails fast if the .env file is misconfigured.
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase URL or Anon Key is missing. Check your .env file for EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY.");
}

// This is the correct, complete client setup for React Native.
// The auth object ensures that user sessions are securely stored on the device.
// Now properly typed with the Database interface from generated types.
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    // CRITICAL: Disable flow type detection to prevent browser-specific behavior
    flowType: 'pkce',
    // CRITICAL: Disable debug mode to prevent window access attempts
    debug: false,
  },
  // CRITICAL: Ensure React Native compatibility
  global: {
    fetch: fetch,
    Headers: Headers,
  },
});

// Export useful types for the rest of the application
export type { Database } from '../types/database.types';
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T];
export type Functions<T extends keyof Database['public']['Functions']> = Database['public']['Functions'][T];

// Helper type for RPC function return types
export type RPCResponse<T extends keyof Database['public']['Functions']> = Database['public']['Functions'][T]['Returns'];
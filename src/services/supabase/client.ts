/*
 * Central Supabase client configuration.
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Shared Supabase client configured from Vite environment variables.
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

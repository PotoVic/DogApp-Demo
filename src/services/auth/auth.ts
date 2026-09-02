/*
 * Thin wrapper around Supabase authentication operations.
 */

// Authentication service for DogCalendar.
// Provides a central interface for signing in, signing out,
// checking the current session, and listening for auth state changes.
import { supabase } from "../supabase/client"

// Small authentication API used by hooks and route/layout components.
export const authService = {
    signIn: (email: string, password: string) => supabase.auth.signInWithPassword({ email, password}),
    signOut: () => supabase.auth.signOut(),

    getSession: () => supabase.auth.getSession(),

    onAuthStateChange: (callback: Parameters<typeof supabase.auth.onAuthStateChange>[0]) => supabase.auth.onAuthStateChange(callback),
}

/*
 * Thin wrapper around Supabase authentication operations.
 */

import { supabase } from "../supabase/client";

// Central authentication API used by hooks, routes, and the application shell.
export const authService = {
  signIn: (email: string, password: string) =>
    supabase.auth.signInWithPassword({ email, password }),

  signInAsGuest: () => supabase.auth.signInAnonymously(),

  signOut: () => supabase.auth.signOut(),

  getSession: () => supabase.auth.getSession(),

  onAuthStateChange: (
    callback: Parameters<typeof supabase.auth.onAuthStateChange>[0],
  ) => supabase.auth.onAuthStateChange(callback),
};

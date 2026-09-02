/*
 * React hook that exposes the current Supabase authentication state.
 */

import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { authService } from "../services/auth/auth";

type AuthState = {
  user: User | null;
  loading: boolean;
};

// Subscribes to the Supabase session and exposes the current user plus loading state.
export function useAuth(): AuthState {
  // Stores the currently authenticated Supabase user.
  const [user, setUser] = useState<User | null>(null);
  // Indicates whether the initial authentication state is still being resolved.
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // Loads the initial authentication session when the hook mounts.
    const loadSession = async () => {
      const { data, error } = await authService.getSession();

      if (!mounted) {
        return;
      }

      if (error) {
        setUser(null);
      } else {
        setUser(data.session?.user ?? null);
      }

      setLoading(false);
    };

    loadSession();

    const {
      data: { subscription },
    } = authService.onAuthStateChange(async (_event, session) => {
      if (!mounted) {
        return;
      }

      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return {
    user,
    loading,
  };
}

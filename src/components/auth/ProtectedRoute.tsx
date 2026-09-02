/*
 * Authentication guard for protected routes.
 */

import { Navigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

type ProtectedRouteProps = {
  children: React.ReactNode;
};

// Route guard that waits for authentication state and redirects unauthenticated users to login.
export default function ProtectedRoute({
  children,
}: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

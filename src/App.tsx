/*
 * Top-level routing and authenticated application composition.
 */

import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import AppHome from "./pages/AppHome";
import AppointmentsPage from "./pages/AppointmentsPage";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import AppShell from "./components/layout/Appshell";
import { useAuth } from "./hooks/useAuth";
import { PWAUpdatePrompt } from "./components/pwa/PWAUpdatePrompt";
import Reports from "./pages/Reports";
function RootRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return <p>Ładowanie...</p>;
  }

  return <Navigate to={user ? "/app" : "/login"} replace />;
}

// Root application component: defines the authenticated app shell and route structure.
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RootRoute />} />

        <Route path="/login" element={<Login />} />

        <Route
          path="/app"
          element={
            <ProtectedRoute>
              <AppShell />
            </ProtectedRoute>
          }
        >
          <Route index element={<AppHome />} />
          <Route path="appointments" element={<AppointmentsPage />} />
          <Route path="reports" element={<Reports />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <PWAUpdatePrompt />
    </BrowserRouter>
  );
}

export default App;

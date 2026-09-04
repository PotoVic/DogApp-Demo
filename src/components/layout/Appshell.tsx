/*
 * Authenticated application shell and navigation.
 */

import { useCallback, useEffect, useRef } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { authService } from "../../services/auth/auth";
import { cleanupCurrentGuestData } from "../../services/auth/guest";
import { useAuth } from "../../hooks/useAuth";
import logo from "../../assets/DogCalendar-Logo.png";
import homeIcon from "../../assets/home-icon.svg";
import appointmentsIcon from "../../assets/appointments-icon.svg";
import reporticon from "../../assets/report-icon.svg";
import "./layout.css";

// Defines the primary navigation items shown in the application shell.
const navigationLinks = [
  {
    label: "Dashboard",
    to: "/app",
    icon: homeIcon,
    end: true,
  },
  {
    label: "Appointments",
    to: "/app/appointments",
    icon: appointmentsIcon,
    end: false,
  },
  {
    label: "Reports",
    to: "/app/reports",
    icon: reporticon,
    end: false,
  }
];

// Shared authenticated layout containing navigation, page content, and logout control.
export default function AppShell() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const guestExpiryTimer = useRef<number | null>(null);

  // Removes temporary guest data before ending the anonymous session.
  const handleLogout = useCallback(async () => {
    const currentUser = user;

    if (currentUser?.is_anonymous) {
      try {
        await cleanupCurrentGuestData(currentUser.id);
      } catch {
        // Still sign out if cleanup fails; scheduled cleanup is the fallback.
      }
    }

    const { error } = await authService.signOut();

    if (!error) {
      navigate("/login", { replace: true });
    }
  }, [navigate, user]);

  // Limits each guest session to one hour even if Supabase refreshes the access token.
  useEffect(() => {
    if (guestExpiryTimer.current !== null) {
      window.clearTimeout(guestExpiryTimer.current);
      guestExpiryTimer.current = null;
    }

    if (!user?.is_anonymous) {
      return;
    }

    const createdAt = Date.parse(user.created_at);
    const guestLifetimeMs = 60 * 60 * 1000;
    const remainingMs = Math.max(0, createdAt + guestLifetimeMs - Date.now());

    guestExpiryTimer.current = window.setTimeout(() => {
      void handleLogout();
    }, remainingMs);

    return () => {
      if (guestExpiryTimer.current !== null) {
        window.clearTimeout(guestExpiryTimer.current);
        guestExpiryTimer.current = null;
      }
    };
  }, [handleLogout, user]);

  return (
    <div className="app-shell">
      <header className="app-header">
        <Link
          className="app-header__brand"
          to="/app"
          aria-label="DogCalendar — Dashboard"
        >
          <img src={logo} alt="" width="48" height="48" />
        </Link>

        <button
          className="button-secondary app-header__logout"
          type="button"
          onClick={handleLogout}
        >
          Log out
        </button>
      </header>

      <aside className="app-sidebar" aria-label="Main navigation">
        <nav>
          <ul className="app-navigation">
            {navigationLinks.map((link) => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  end={link.end}
                  className="app-navigation__link"
                >
                  {({ isActive }) => (
                    <>
                      <img
                        className={`app-navigation__icon${isActive ? " app-navigation__icon--active" : ""}`}
                        src={link.icon}
                        alt=""
                        aria-hidden="true"
                      />
                      <span>{link.label}</span>
                      {isActive && (
                        <span className="visually-hidden">, active</span>
                      )}
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      <main className="app-shell__main">
        <Outlet />
      </main>

      <nav className="app-mobile-navigation" aria-label="Main navigation">
        <ul className="app-navigation">
          {navigationLinks.map((link) => (
            <li key={link.to}>
              <NavLink
                to={link.to}
                end={link.end}
                className="app-navigation__link"
                aria-label={link.label}
                title={link.label}
              >
                {({ isActive }) => (
                  <>
                    <img
                      className={`app-navigation__icon${
                        isActive ? " app-navigation__icon--active" : ""
                      }`}
                      src={link.icon}
                      alt=""
                      aria-hidden="true"
                    />
                    <span className="app-mobile-navigation__label">
                      {link.label}
                    </span>
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}

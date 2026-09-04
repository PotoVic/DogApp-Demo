/*
 * Authentication page and login form.
 */

import { type FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/auth/auth";
import { cleanupCurrentGuestData, seedGuestDemoData } from "../services/auth/guest";
import { useAuth } from "../hooks/useAuth";

import logo from "../assets/DogCalendar-Logo.png";
import "./login.css";

// Login page: collects credentials or starts a temporary guest demo session.
export default function Login() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [guestLoading, setGuestLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading && user) {
      navigate("/app", { replace: true });
    }
  }, [authLoading, user, navigate]);

  const handleGuestLogin = async () => {
    setError("");
    setGuestLoading(true);

    const { data, error } = await authService.signInAsGuest();

    if (error || !data.user) {
      setError("Guest access is currently unavailable. Please try again.");
      setGuestLoading(false);
      return;
    }

    try {
      await seedGuestDemoData(data.user.id);
    } catch {
      await cleanupCurrentGuestData(data.user.id).catch(() => undefined);
      await authService.signOut();
      setError("The demo could not be started. Please try again.");
    }

    setGuestLoading(false);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Enter your email address and password.");
      return;
    }

    setLoading(true);

    const { error } = await authService.signIn(email.trim(), password);

    if (error) {
      setError("Login failed. Check your credentials.");
    }

    setLoading(false);
  };

  const isBusy = loading || guestLoading;

  return (
    <main className="login-page">
      <section className="login-card" aria-labelledby="login-title">
        <div className="login-card__brand">
          <img
            className="login-card__logo"
            src={logo}
            alt=""
            width="56"
            height="56"
          />
          <h1 className="login-card__title" id="login-title">
            DogCalendar
          </h1>
          <p className="login-card__description">
            Log in to continue.
          </p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="login-form__field">
            <label className="login-form__label" htmlFor="email">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              disabled={isBusy}
              required
            />
          </div>

          <div className="login-form__field">
            <label className="login-form__label" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              disabled={isBusy}
              required
            />
          </div>

          {error && (
            <p className="login-form__error" role="alert">
              {error}
            </p>
          )}

          <button
            className="button-primary login-form__submit"
            type="submit"
            disabled={isBusy}
          >
            {loading ? "Logging in..." : "Log in"}
          </button>

          <div className="login-form__divider" aria-hidden="true">
            <span>or</span>
          </div>

          <button
            className="button-secondary login-form__guest"
            type="button"
            onClick={handleGuestLogin}
            disabled={isBusy}
          >
            {guestLoading ? "Starting demo..." : "Continue as Guest"}
          </button>
        </form>
      </section>
    </main>
  );
}

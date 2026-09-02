/*
 * Authentication page and login form.
 */

import { type FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/auth/auth";
import { useAuth } from "../hooks/useAuth";

import logo from "../assets/DogCalendar-Logo.png";
import "./login.css";
// Login page: collects credentials and starts the Supabase authentication flow.
export default function Login() {
    const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  // Local form state for the email field.
  const [email, setEmail] = useState("");
  // Local form state for the password field.
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  // Stores a user-safe login error message.
  const [error, setError] = useState("");
  useEffect(() => {
  if (!authLoading && user) {
    navigate("/app", { replace: true });
  }
}, [authLoading, user, navigate]);

  // Validates the login form and asks the auth service to sign the user in.
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
      setError("Unable to log in. Check your credentials.");
    }
     
   
    setLoading(false);
  };

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
              disabled={loading}
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
              disabled={loading}
              required
            />
          </div>

          {error && <p className="login-form__error" role="alert">{error}</p>}

          <button className="button-primary login-form__submit" type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Log in"}
          </button>
        </form>
      </section>
    </main>
  );
}

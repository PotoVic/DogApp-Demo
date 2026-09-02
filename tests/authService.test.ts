import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  signInWithPassword,
  signOut,
  getSession,
  onAuthStateChange,
} = vi.hoisted(() => ({
  signInWithPassword: vi.fn(),
  signOut: vi.fn(),
  getSession: vi.fn(),
  onAuthStateChange: vi.fn(),
}));

vi.mock("../src/services/supabase/client", () => ({
  supabase: {
    auth: {
      signInWithPassword,
      signOut,
      getSession,
      onAuthStateChange,
    },
  },
}));

import { authService } from "../src/services/auth/auth";

beforeEach(() => vi.clearAllMocks());

describe("authService", () => {
  it("delegates signIn", async () => {
    signInWithPassword.mockResolvedValue({ data: {}, error: null });
    await authService.signIn("user@example.com", "secret");

    expect(signInWithPassword).toHaveBeenCalledWith({
      email: "user@example.com",
      password: "secret",
    });
  });

  it("returns the underlying signIn result", async () => {
    const result = { data: { user: { id: "u" } }, error: null };
    signInWithPassword.mockResolvedValue(result);

    await expect(authService.signIn("a@b.com", "pw")).resolves.toEqual(result);
  });

  it("delegates signOut", async () => {
    signOut.mockResolvedValue({ error: null });
    await authService.signOut();
    expect(signOut).toHaveBeenCalledTimes(1);
  });

  it("delegates getSession", async () => {
    getSession.mockResolvedValue({ data: { session: null }, error: null });
    await authService.getSession();
    expect(getSession).toHaveBeenCalledTimes(1);
  });

  it("delegates auth-state subscription", () => {
    const callback = vi.fn();
    const subscription = { unsubscribe: vi.fn() };
    onAuthStateChange.mockReturnValue({ data: { subscription } });

    const result = authService.onAuthStateChange(callback);

    expect(onAuthStateChange).toHaveBeenCalledWith(callback);
    expect(result).toEqual({ data: { subscription } });
  });
});

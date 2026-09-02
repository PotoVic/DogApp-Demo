import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { getSession, onAuthStateChange } = vi.hoisted(() => ({
  getSession: vi.fn(),
  onAuthStateChange: vi.fn(),
}));

vi.mock("../src/services/auth/auth", () => ({
  authService: { getSession, onAuthStateChange },
}));

import { useAuth } from "../src/hooks/useAuth";

beforeEach(() => vi.clearAllMocks());

describe("useAuth", () => {
  it("loads a logged-in user from the current session", async () => {
    const user = { id: "user-1" };
    getSession.mockResolvedValue({ data: { session: { user } }, error: null });
    onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    });

    const { result } = renderHook(() => useAuth());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.user).toEqual(user);
  });

  it("returns null when there is no session", async () => {
    getSession.mockResolvedValue({ data: { session: null }, error: null });
    onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    });

    const { result } = renderHook(() => useAuth());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.user).toBeNull();
  });

  it("returns null when session loading fails", async () => {
    getSession.mockResolvedValue({ data: { session: null }, error: new Error("failed") });
    onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    });

    const { result } = renderHook(() => useAuth());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.user).toBeNull();
  });

  it("reacts to auth state changes", async () => {
    getSession.mockResolvedValue({ data: { session: null }, error: null });

    let callback: any;
    const unsubscribe = vi.fn();
    onAuthStateChange.mockImplementation((cb) => {
      callback = cb;
      return { data: { subscription: { unsubscribe } } };
    });

    const { result } = renderHook(() => useAuth());
    await waitFor(() => expect(result.current.loading).toBe(false));

    const user = { id: "user-2" };
    callback("SIGNED_IN", { user });

    await waitFor(() => expect(result.current.user).toEqual(user));

    callback("SIGNED_OUT", null);
    await waitFor(() => expect(result.current.user).toBeNull());
  });

  it("unsubscribes on unmount", async () => {
    getSession.mockResolvedValue({ data: { session: null }, error: null });
    const unsubscribe = vi.fn();
    onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe } },
    });

    const { unmount } = renderHook(() => useAuth());
    await waitFor(() => expect(onAuthStateChange).toHaveBeenCalled());

    unmount();
    expect(unsubscribe).toHaveBeenCalledTimes(1);
  });
});

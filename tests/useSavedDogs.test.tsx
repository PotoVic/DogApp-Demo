import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getSavedDogs: vi.fn(),
  createSavedDog: vi.fn(),
  updateSavedDog: vi.fn(),
  deleteSavedDog: vi.fn(),
}));

vi.mock("../src/services/savedDogs/savedDogService", () => mocks);

import { useSavedDogs } from "../src/hooks/useSavedDogs";

const dog = (id: string, name: string) => ({
  id,
  user_id: "user-1",
  name,
  breed: "Labrador",
  phone_number: null,
  created_at: "",
  updated_at: "",
});

beforeEach(() => vi.clearAllMocks());

describe("useSavedDogs", () => {
  it("loads dogs on mount", async () => {
    mocks.getSavedDogs.mockResolvedValue([dog("1", "Burek")]);

    const { result } = renderHook(() => useSavedDogs());

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.savedDogs).toEqual([dog("1", "Burek")]);
    expect(result.current.error).toBeNull();
  });

  it("stores load errors", async () => {
    mocks.getSavedDogs.mockRejectedValue(new Error("failed"));

    const { result } = renderHook(() => useSavedDogs());

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.error?.message).toBe("failed");
  });

  it("adds and alphabetically sorts a dog", async () => {
    mocks.getSavedDogs.mockResolvedValue([dog("1", "Zosia")]);
    mocks.createSavedDog.mockResolvedValue(dog("2", "Burek"));

    const { result } = renderHook(() => useSavedDogs());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.addSavedDog({ name: "Burek" });
    });

    expect(result.current.savedDogs.map((d) => d.name)).toEqual(["Burek", "Zosia"]);
  });

  it("updates and re-sorts a dog", async () => {
    mocks.getSavedDogs.mockResolvedValue([dog("1", "Burek"), dog("2", "Zosia")]);
    mocks.updateSavedDog.mockResolvedValue(dog("1", "Ala"));

    const { result } = renderHook(() => useSavedDogs());
    await waitFor(() => expect(result.current.savedDogs).toHaveLength(2));

    await act(async () => {
      await result.current.editSavedDog("1", { name: "Ala" });
    });

    expect(result.current.savedDogs.map((d) => d.name)).toEqual(["Ala", "Zosia"]);
  });

  it("removes a dog after successful deletion", async () => {
    mocks.getSavedDogs.mockResolvedValue([dog("1", "Burek"), dog("2", "Zosia")]);
    mocks.deleteSavedDog.mockResolvedValue(undefined);

    const { result } = renderHook(() => useSavedDogs());
    await waitFor(() => expect(result.current.savedDogs).toHaveLength(2));

    await act(async () => {
      await result.current.removeSavedDog("1");
    });

    expect(mocks.deleteSavedDog).toHaveBeenCalledWith("1");
    expect(result.current.savedDogs.map((d) => d.id)).toEqual(["2"]);
  });
});

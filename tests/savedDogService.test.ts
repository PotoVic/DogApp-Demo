import { beforeEach, describe, expect, it, vi } from "vitest";

const { fromMock, getUserMock } = vi.hoisted(() => ({
  fromMock: vi.fn(),
  getUserMock: vi.fn(),
}));

vi.mock("../src/services/supabase/client", () => ({
  supabase: {
    from: fromMock,
    auth: { getUser: getUserMock },
  },
}));

import {
  getSavedDogs,
  createSavedDog,
  updateSavedDog,
  deleteSavedDog,
  findOrCreateSavedDog,
} from "../src/services/savedDogs/savedDogService";

const chain = (result: unknown) => {
  const value: any = {
    select: vi.fn(() => value),
    order: vi.fn(async () => result),
    insert: vi.fn(() => value),
    update: vi.fn(() => value),
    delete: vi.fn(() => value),
    eq: vi.fn(() => value),
    single: vi.fn(async () => result),
  };
  return value;
};

const dog = (overrides: any = {}) => ({
  id: "dog-1",
  user_id: "user-1",
  name: "Burek",
  breed: "Labrador",
  phone_number: "123 456 789",
  created_at: "",
  updated_at: "",
  ...overrides,
});

beforeEach(() => {
  vi.clearAllMocks();
  getUserMock.mockResolvedValue({ data: { user: { id: "user-1" } }, error: null });
});

describe("savedDogService", () => {
  it("loads dogs for the authenticated user", async () => {
    const data = [dog()];
    const query = chain({ data, error: null });
    fromMock.mockReturnValue(query);

    await expect(getSavedDogs()).resolves.toEqual(data);

    expect(fromMock).toHaveBeenCalledWith("saved_dogs");
    expect(query.eq).toHaveBeenCalledWith("user_id", "user-1");
    expect(query.order).toHaveBeenCalledWith("name", { ascending: true });
  });

  it("rejects when there is no authenticated user", async () => {
    getUserMock.mockResolvedValue({ data: { user: null }, error: null });
    await expect(getSavedDogs()).rejects.toThrow("Użytkownik nie jest zalogowany.");
  });

  it("propagates saved-dog query errors", async () => {
    fromMock.mockReturnValue(chain({ data: null, error: new Error("query failed") }));
    await expect(getSavedDogs()).rejects.toThrow("query failed");
  });

  it("creates a dog with the current user and trimmed values", async () => {
    const query = chain({ data: dog(), error: null });
    fromMock.mockReturnValue(query);

    await createSavedDog({
      name: "  Burek  ",
      breed: "  Labrador  ",
      phone_number: " 123 456 789 ",
    });

    expect(query.insert).toHaveBeenCalledWith({
      user_id: "user-1",
      name: "Burek",
      breed: "Labrador",
      phone_number: "123 456 789",
    });
  });

  it("converts blank optional values to null", async () => {
    const query = chain({ data: dog(), error: null });
    fromMock.mockReturnValue(query);

    await createSavedDog({ name: "Burek", breed: "   ", phone_number: "   " });

    expect(query.insert).toHaveBeenCalledWith({
      user_id: "user-1",
      name: "Burek",
      breed: null,
      phone_number: null,
    });
  });

  it("updates by saved-dog id", async () => {
    const query = chain({ data: dog({ id: "dog-2" }), error: null });
    fromMock.mockReturnValue(query);

    await updateSavedDog("dog-2", {
      name: "Rex",
      breed: "Pudel",
      phone_number: "111 222 333",
    });

    expect(query.update).toHaveBeenCalledWith({
      name: "Rex",
      breed: "Pudel",
      phone_number: "111 222 333",
    });
    expect(query.eq).toHaveBeenCalledWith("id", "dog-2");
  });

  it("deletes by saved-dog id", async () => {
    const query = chain({ error: null });
    fromMock.mockReturnValue(query);

    await expect(deleteSavedDog("dog-2")).resolves.toBeUndefined();
    expect(query.delete).toHaveBeenCalled();
    expect(query.eq).toHaveBeenCalledWith("id", "dog-2");
  });

  it("reuses an exact normalized name+breed+phone match", async () => {
    const existing = dog();
    const getQuery = chain({ data: [existing], error: null });
    fromMock.mockReturnValue(getQuery);

    const result = await findOrCreateSavedDog({
      name: "  BUREK ",
      breed: " LABRADOR ",
      phone_number: "123-456-789",
    });

    expect(result).toEqual(existing);
    expect(getQuery.insert).not.toHaveBeenCalled();
  });

  it("creates a dog when name+breed do not match", async () => {
    const existing = dog({ name: "Rex" });
    const getQuery = chain({ data: [existing], error: null });
    const createQuery = chain({ data: dog({ id: "new" }), error: null });
    fromMock.mockReturnValueOnce(getQuery).mockReturnValueOnce(createQuery);

    await findOrCreateSavedDog({ name: "Burek", breed: "Labrador" });

    expect(createQuery.insert).toHaveBeenCalled();
  });

  it("creates another dog when the phone differs", async () => {
    const existing = dog({ phone_number: "111 111 111" });
    const getQuery = chain({ data: [existing], error: null });
    const createQuery = chain({ data: dog({ id: "new" }), error: null });
    fromMock.mockReturnValueOnce(getQuery).mockReturnValueOnce(createQuery);

    await findOrCreateSavedDog({
      name: "Burek",
      breed: "Labrador",
      phone_number: "222 222 222",
    });

    expect(createQuery.insert).toHaveBeenCalled();
  });

  it("reuses a single name+breed match when no phone is supplied", async () => {
    const existing = dog();
    fromMock.mockReturnValue(chain({ data: [existing], error: null }));

    await expect(
      findOrCreateSavedDog({ name: "Burek", breed: "Labrador" }),
    ).resolves.toEqual(existing);
  });

  it("returns null for ambiguous name+breed matches without a phone", async () => {
    const getQuery = chain({
      data: [
        dog({ id: "1", phone_number: "111 111 111" }),
        dog({ id: "2", phone_number: "222 222 222" }),
      ],
      error: null,
    });
    fromMock.mockReturnValue(getQuery);

    await expect(
      findOrCreateSavedDog({ name: "Burek", breed: "Labrador" }),
    ).resolves.toBeNull();
  });
});

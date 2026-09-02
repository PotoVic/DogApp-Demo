/*
 * Supabase CRUD and matching logic for saved dog profiles.
 */

import { supabase } from "../supabase/client";
import type { SavedDog } from "../../types/savedDog";

// Input shape used when creating or updating a saved dog.
export type SavedDogInput = {
  name: string;
  breed?: string;
  phone_number?: string;
};

// Normalizes optional saved-dog text before matching or storing it.
const normalizeSavedDogValue = (value: string | null | undefined) =>
  value?.trim().replace(/\s+/g, " ").toLocaleLowerCase("en-US") ?? "";

// Normalizes a phone number to digits for reliable matching/storage.
const normalizePhoneNumber = (value: string | null | undefined) =>
  value?.replace(/\D/g, "") ?? "";

// Returns the authenticated Supabase user's ID or throws when no user is signed in.
const getCurrentUserId = async (): Promise<string> => {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    throw error;
  }

  if (!user) {
    throw new Error("User is not logged in.");
  }

  return user.id;
};

// Fetches saved dogs belonging to the current authenticated user.
export const getSavedDogs = async (): Promise<SavedDog[]> => {
  const userId = await getCurrentUserId();

  const { data, error } = await supabase
    .from("saved_dogs")
    .select("*")
    .eq("user_id", userId)
    .order("name", { ascending: true });

  if (error) {
    throw error;
  }

  return data;
};

// Creates a saved dog for the current authenticated user.
export const createSavedDog = async (
  input: SavedDogInput,
): Promise<SavedDog> => {
  const userId = await getCurrentUserId();

  const { data, error } = await supabase
    .from("saved_dogs")
    .insert({
      user_id: userId,
      name: input.name.trim(),
      breed: input.breed?.trim() || null,
      phone_number: input.phone_number?.trim() || null,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
};

// Updates a saved dog owned by the current user.
export const updateSavedDog = async (
  id: string,
  input: SavedDogInput,
): Promise<SavedDog> => {
  const { data, error } = await supabase
    .from("saved_dogs")
    .update({
      name: input.name.trim(),
      breed: input.breed?.trim() || null,
      phone_number: input.phone_number?.trim() || null,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
};

// Deletes a saved dog by ID; database RLS remains the authorization boundary.
export const deleteSavedDog = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from("saved_dogs")
    .delete()
    .eq("id", id);

  if (error) {
    throw error;
  }
};

// Reuses a matching saved dog when possible, otherwise creates one.
export const findOrCreateSavedDog = async (
  input: SavedDogInput,
): Promise<SavedDog | null> => {
  const dogs = await getSavedDogs();

  const normalizedName = normalizeSavedDogValue(input.name);
  const normalizedBreed = normalizeSavedDogValue(input.breed);
  const normalizedPhone = normalizePhoneNumber(input.phone_number);

  const nameAndBreedMatches = dogs.filter(
    (dog) =>
      normalizeSavedDogValue(dog.name) === normalizedName &&
      normalizeSavedDogValue(dog.breed) === normalizedBreed,
  );

  // No existing dog with the same name + breed.
  if (nameAndBreedMatches.length === 0) {
    return createSavedDog(input);
  }

  // If a phone number is available, use it as a stronger match.
  if (normalizedPhone) {
    const phoneMatch = nameAndBreedMatches.find(
      (dog) =>
        normalizePhoneNumber(dog.phone_number) === normalizedPhone,
    );

    if (phoneMatch) {
      return phoneMatch;
    }

    // Same name + breed but different phone:
    // this can legitimately be another dog.
    return createSavedDog(input);
  }

  // Without a phone number, reuse only if there is exactly
  // one possible match.
  if (nameAndBreedMatches.length === 1) {
    return nameAndBreedMatches[0];
  }

  // Multiple identical name + breed records and no phone:
  // ambiguous, so don't guess.
  return null;
};

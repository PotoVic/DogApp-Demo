/*
 * React hook that owns saved-dog data and CRUD state.
 */

import { useCallback, useEffect, useState } from "react";
import {
  createSavedDog,
  deleteSavedDog,
  getSavedDogs,
  updateSavedDog,
  type SavedDogInput,
} from "../services/savedDogs/savedDogService";
import type { SavedDog } from "../types/savedDog";

// Encapsulates saved-dog loading and CRUD state for components that use dog profiles.
export const useSavedDogs = () => {
  // Stores the current user's saved-dog profiles.
  const [savedDogs, setSavedDogs] = useState<SavedDog[]>([]);
  // Tracks the saved-dog loading state.
  const [isLoading, setIsLoading] = useState(true);
  // Stores the last saved-dog loading error.
  const [error, setError] = useState<Error | null>(null);

  // Loads saved dogs from the service and updates loading/error state.
  const loadSavedDogs = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const dogs = await getSavedDogs();
      setSavedDogs(dogs);
    } catch (err) {
      setError(
        err instanceof Error
          ? err
          : new Error("Failed to load saved dogs."),
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSavedDogs();
  }, [loadSavedDogs]);

  // Creates a saved dog and inserts it into the locally sorted list.
  const addSavedDog = async (input: SavedDogInput) => {
    const dog = await createSavedDog(input);

    setSavedDogs((currentDogs) =>
      [...currentDogs, dog].sort((a, b) =>
        a.name.localeCompare(b.name, "en"),
      ),
    );

    return dog;
  };

  // Updates a saved dog and replaces the matching item in local state.
  const editSavedDog = async (
    id: string,
    input: SavedDogInput,
  ) => {
    const updatedDog = await updateSavedDog(id, input);

    setSavedDogs((currentDogs) =>
      currentDogs
        .map((dog) => (dog.id === id ? updatedDog : dog))
        .sort((a, b) => a.name.localeCompare(b.name, "en")),
    );

    return updatedDog;
  };

  // Deletes a saved dog and removes it from local state.
  const removeSavedDog = async (id: string) => {
    await deleteSavedDog(id);

    setSavedDogs((currentDogs) =>
      currentDogs.filter((dog) => dog.id !== id),
    );
  };

  return {
    savedDogs,
    isLoading,
    error,
    loadSavedDogs,
    addSavedDog,
    editSavedDog,
    removeSavedDog,
  };
};

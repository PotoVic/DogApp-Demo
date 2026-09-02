/*
 * Saved-dog CRUD interface.
 */

import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
  type MouseEvent,
} from "react";
import { useSavedDogs } from "../../../hooks/useSavedDogs";
import type { SavedDog } from "../../../types/savedDog";
import "./savedDogs.css";
import closeIcon from "../../../assets/close-icon.svg";

// Formats a phone number while the user types it.
// Supports international numbers and preserves country codes.
function formatPhoneNumber(value?: string | null): string {
  if (!value) {
    return "";
  }

  return value
    .replace(/[^\d+\s().-]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

interface SavedDogFormState {
  name: string;
  breed: string;
  phone_number: string;
}

const emptyForm: SavedDogFormState = {
  name: "",
  breed: "",
  phone_number: "",
};

// Saved-dog management UI for creating, editing, and deleting reusable dog profiles.
export function SavedDogsPanel() {
  const {
    savedDogs,
    isLoading,
    error,
    addSavedDog,
    editSavedDog,
    removeSavedDog,
  } = useSavedDogs();

  // Controls visibility of the saved-dog create/edit modal.
  const [showForm, setShowForm] = useState(false);
  // Identifies the saved dog currently being edited.
  const [editingDogId, setEditingDogId] = useState<string | null>(null);
  // Stores the current saved-dog form values.
  const [formData, setFormData] = useState<SavedDogFormState>(emptyForm);
  // Stores validation or persistence errors for the saved-dog form.
  const [formError, setFormError] = useState<string | null>(null);
  // Disables form controls while a saved-dog mutation is running.
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Identifies the saved dog currently being deleted.
  const [deletingDogId, setDeletingDogId] = useState<string | null>(null);
  // Remembers the trigger element so focus can return after the modal closes.
  const previouslyFocusedElement = useRef<HTMLElement | null>(null);

  // Resets the form and opens it for creating a new saved dog.
  const openCreateForm = () => {
    setEditingDogId(null);
    setFormData(emptyForm);
    setFormError(null);
    setShowForm(true);
  };

  // Loads an existing saved dog into the form for editing.
  const openEditForm = (dog: SavedDog) => {
    setEditingDogId(dog.id);
    setFormData({
      name: dog.name,
      breed: dog.breed ?? "",
      phone_number: formatPhoneNumber(dog.phone_number),
    });
    setFormError(null);
    setShowForm(true);
  };

  // Closes the saved-dog form and restores the previously focused element.
  const closeForm = () => {
    if (isSubmitting) return;

    setShowForm(false);
    setEditingDogId(null);
    setFormData(emptyForm);
    setFormError(null);
  };

  useEffect(() => {
    if (!showForm) return;

    previouslyFocusedElement.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const timeoutId = window.setTimeout(() => {
      document.getElementById("saved-dog-name")?.focus();
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
      document.body.style.overflow = originalOverflow;
      previouslyFocusedElement.current?.focus();
      previouslyFocusedElement.current = null;
    };
  }, [showForm]);

  const handleModalKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();

      if (!isSubmitting) {
        closeForm();
      }

      return;
    }

    if (event.key !== "Tab") return;

    const focusableElements = Array.from(
      event.currentTarget.querySelectorAll<HTMLElement>(
        'button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ),
    );

    if (focusableElements.length === 0) return;

    const first = focusableElements[0];
    const last = focusableElements[focusableElements.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  const handleBackdropMouseDown = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget && !isSubmitting) {
      closeForm();
    }
  };

  // Validates and persists the saved-dog form.
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const name = formData.name.trim();

    if (!name) {
      setFormError("Podaj nazwę psa.");
      return;
    }

    setFormError(null);
    setIsSubmitting(true);

    const input = {
      name,
      breed: formData.breed.trim(),
      phone_number: formData.phone_number.trim(),
    };

    try {
      if (editingDogId) {
        await editSavedDog(editingDogId, input);
      } else {
        await addSavedDog(input);
      }

      setShowForm(false);
      setEditingDogId(null);
      setFormData(emptyForm);
      setFormError(null);
    } catch {
      setFormError(
        editingDogId
          ? "Nie udało się zaktualizować psa. Spróbuj ponownie."
          : "Nie udało się zapisać psa. Spróbuj ponownie.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Confirms and deletes a saved dog.
  const handleDelete = async (dog: SavedDog) => {
    const confirmed = window.confirm(
      `Czy na pewno chcesz usunąć psa "${dog.name}"?`,
    );

    if (!confirmed) return;

    setDeletingDogId(dog.id);

    try {
      await removeSavedDog(dog.id);
    } catch {
      setFormError("Nie udało się usunąć psa. Spróbuj ponownie.");
    } finally {
      setDeletingDogId(null);
    }
  };

  if (isLoading) {
    return (
      <section className="saved-dogs-panel" aria-labelledby="saved-dogs-title">
        <div className="saved-dogs-panel__header">
          <div>
            <h2 id="saved-dogs-title">Zapisane psy</h2>
            <p>
              Zapisz dane psa raz, aby szybciej uzupełniać kolejne wizyty.
            </p>
          </div>
        </div>

        <p className="appointments-state" role="status" aria-live="polite">
          Ładowanie zapisanych psów...
        </p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="saved-dogs-panel" aria-labelledby="saved-dogs-title">
        <div className="saved-dogs-panel__header">
          <div>
            <h2 id="saved-dogs-title">Zapisane psy</h2>
            <p>
              Zapisz dane psa raz, aby szybciej uzupełniać kolejne wizyty.
            </p>
          </div>

          <button
            className="button-primary"
            type="button"
            onClick={openCreateForm}
          >
            Dodaj psa
          </button>
        </div>

        <div className="saved-dogs-panel__state" role="alert">
          <p>Nie udało się wczytać zapisanych psów.</p>
          <p className="saved-dogs-panel__error">
            Spróbuj ponownie później.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="saved-dogs-panel" aria-labelledby="saved-dogs-title">
      <div className="saved-dogs-panel__header">
        <div>
          <h2 id="saved-dogs-title">Zapisane psy</h2>
          <p>
            Zapisz dane psa raz, aby szybciej uzupełniać kolejne wizyty.
          </p>
        </div>

        <button
          className="button-primary"
          type="button"
          onClick={openCreateForm}
        >
          Dodaj psa
        </button>
      </div>

      {showForm && (
        <div
          className="saved-dog-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="saved-dog-modal-title"
          aria-describedby={
            formError ? "saved-dog-modal-error" : undefined
          }
          onKeyDown={handleModalKeyDown}
          onMouseDown={handleBackdropMouseDown}
        >
          <div className="saved-dog-modal__content">
            <header className="saved-dog-modal__header">
              <div>
                <p className="saved-dog-modal__eyebrow">
                  {editingDogId ? "Zarządzanie psem" : "Nowy pies"}
                </p>

                <h2
                  className="saved-dog-modal__title"
                  id="saved-dog-modal-title"
                >
                  {editingDogId ? "Edytuj psa" : "Dodaj psa"}
                </h2>
              </div>

              <button
                className="saved-dog-modal__close"
                type="button"
                onClick={closeForm}
                disabled={isSubmitting}
                aria-label="Zamknij formularz"
                title="Zamknij formularz"
              >
                <img src={closeIcon} alt="" aria-hidden="true" />
              </button>
            </header>

            <form className="saved-dog-form" onSubmit={handleSubmit}>
              <div className="saved-dog-form__fields">
                <div className="saved-dog-form__field">
                  <label htmlFor="saved-dog-name">Nazwa psa *</label>

                  <input
                    id="saved-dog-name"
                    type="text"
                    value={formData.name}
                    onChange={(event) =>
                      setFormData({
                        ...formData,
                        name: event.target.value,
                      })
                    }
                    disabled={isSubmitting}
                    autoComplete="off"
                    required
                  />
                </div>

                <div className="saved-dog-form__field">
                  <label htmlFor="saved-dog-breed">Rasa</label>

                  <input
                    id="saved-dog-breed"
                    type="text"
                    value={formData.breed}
                    onChange={(event) =>
                      setFormData({
                        ...formData,
                        breed: event.target.value,
                      })
                    }
                    disabled={isSubmitting}
                    autoComplete="off"
                  />
                </div>

                <div className="saved-dog-form__field">
                  <label htmlFor="saved-dog-phone">Telefon</label>

                  <input
                    id="saved-dog-phone"
                    type="tel"
                    value={formData.phone_number}
                    onChange={(event) =>
                      setFormData({
                        ...formData,
                        phone_number: formatPhoneNumber(
                          event.target.value,
                        ),
                      })
                    }
                    disabled={isSubmitting}
                    autoComplete="tel"
                    inputMode="tel"
                    maxLength={30}
                    placeholder="+48 532 483 896"
                  />
                </div>
              </div>

              {formError && (
                <p
                  className="saved-dog-form__error"
                  id="saved-dog-modal-error"
                  role="alert"
                >
                  {formError}
                </p>
              )}

              <div className="saved-dog-form__actions">
                <button
                  className="button-secondary"
                  type="button"
                  onClick={closeForm}
                  disabled={isSubmitting}
                >
                  Anuluj
                </button>

                <button
                  className="button-primary"
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting
                    ? "Zapisywanie..."
                    : editingDogId
                      ? "Zapisz zmiany"
                      : "Zapisz psa"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {!showForm && savedDogs.length === 0 && (
        <div className="saved-dogs-panel__empty">
          <h3>Nie masz jeszcze zapisanych psów</h3>

          <p>
            Dodaj pierwszego psa. Przy kolejnych wizytach jego dane będą
            dostępne jako szybka podpowiedź.
          </p>

          <button
            className="button-secondary"
            type="button"
            onClick={openCreateForm}
          >
            Dodaj pierwszego psa
          </button>
        </div>
      )}

      {!showForm && savedDogs.length > 0 && (
        <ul className="saved-dogs-list">
          {savedDogs.map((dog) => (
            <li className="saved-dog-card" key={dog.id}>
              <div className="saved-dog-card__main">
                <div className="saved-dog-card__identity">
                  <h3>{dog.name}</h3>

                  {dog.breed && <p>{dog.breed}</p>}
                </div>

                {dog.phone_number && (
                  <p className="saved-dog-card__phone">
                    {formatPhoneNumber(dog.phone_number)}
                  </p>
                )}
              </div>

              <div className="saved-dog-card__actions">
                <button
                  className="button-secondary"
                  type="button"
                  onClick={() => openEditForm(dog)}
                  disabled={deletingDogId !== null}
                >
                  Edytuj
                </button>

                <button
                  className="saved-dog-card__delete"
                  type="button"
                  onClick={() => void handleDelete(dog)}
                  disabled={deletingDogId !== null}
                >
                  {deletingDogId === dog.id ? "Usuwanie..." : "Usuń"}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {formError && !showForm && (
        <p className="saved-dogs-panel__error" role="alert">
          {formError}
        </p>
      )}
    </section>
  );
}
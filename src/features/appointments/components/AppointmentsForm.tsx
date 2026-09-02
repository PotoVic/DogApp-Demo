/*
 * Create/edit appointment form and validation.
 */

import { useMemo, useState, type FormEvent } from "react";
import type {
  Appointment,
  AppointmentInput,
  AppointmentStatus,
} from "../../../types/appointment";
import { useSavedDogs } from "../../../hooks/useSavedDogs";
import type { SavedDog } from "../../../types/savedDog";
import calendarIcon from "../../../assets/calender-icon.svg";
import "./appointments.css";

// Maps appointment input fields to optional validation messages.
type AppointmentFormErrors = Partial<Record<keyof AppointmentInput, string>>;

// Data emitted by the appointment form after validation, including the optional Saved Dog profile ID.
export interface AppointmentFormSubmitData {
  appointment: AppointmentInput;
  selectedSavedDogId: string | null;
}

// Normalizes a database time value to the HH:MM format used by the form.
function normalizeAppointmentTime(time?: string): string {
  if (!time) {
    return "";
  }

  return time.slice(0, 5);
}

// Formats a Polish phone number for display and editing.
function formatPolishPhoneNumber(value?: string | null): string {
  const digits = value?.replace(/\D/g, "").slice(0, 9) ?? "";

  return digits.replace(/(\d{3})(?=\d)/g, "$1 ").trim();
}

interface AppointmentFormProps {
  onSubmit: (data: AppointmentFormSubmitData) => void;
  onCancel: () => void;
  appointment?: Appointment;
  initialDate?: string;
  isSubmitting?: boolean;
}

// Reusable create/edit appointment form with validation and saved-dog autocomplete.
export function AppointmentForm({
  onSubmit,
  onCancel,
  appointment,
  initialDate,
  isSubmitting = false,
}: AppointmentFormProps) {
  // Stores the appointment fields being edited.
  const [formData, setFormData] = useState<AppointmentInput>({
    dog_name: appointment?.dog_name ?? "",
    breed: appointment?.breed ?? "",
    phone_number: appointment?.phone_number ?? "",
    appointment_date: appointment?.appointment_date ?? initialDate ?? "",
    appointment_time: normalizeAppointmentTime(appointment?.appointment_time),
    price: appointment?.price ?? 0,
    note: appointment?.note ?? "",
    status: appointment?.status ?? "scheduled",
  });

  // Stores field-level validation messages.
  const [errors, setErrors] = useState<AppointmentFormErrors>({});
  // Keeps the price as a string so the input can temporarily be empty or partially edited.
  const [priceInput, setPriceInput] = useState(String(appointment?.price ?? 0));

  const {
    savedDogs,
    isLoading: isLoadingSavedDogs,
    error: savedDogsError,
  } = useSavedDogs();

  // Tracks which saved-dog profile is associated with the current form selection.
  const [selectedSavedDogId, setSelectedSavedDogId] = useState<string | null>(
    null,
  );
  // Controls whether saved-dog autocomplete suggestions are visible.
  const [isSavedDogSearchOpen, setIsSavedDogSearchOpen] = useState(false);

  const timeOptions = Array.from({ length: 11 * 12 + 1 }, (_, index) => {
    const totalMinutes = 7 * 60 + index * 5;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
      2,
      "0",
    )}`;
  });

  // Filters saved dogs by the current dog-name search text.
  const matchingSavedDogs = useMemo(() => {
    const searchTerm = formData.dog_name.trim().toLocaleLowerCase("pl");

    if (!searchTerm) {
      return [];
    }

    return savedDogs
      .filter((dog) => {
        const name = dog.name.toLocaleLowerCase("pl");
        const breed = dog.breed?.toLocaleLowerCase("pl") ?? "";

        return name.includes(searchTerm) || breed.includes(searchTerm);
      })
      .slice(0, 5);
  }, [formData.dog_name, savedDogs]);

  // Copies a saved dog's details into the appointment form and remembers its profile ID.
  const handleSelectSavedDog = (dog: SavedDog) => {
    setSelectedSavedDogId(dog.id);
    setIsSavedDogSearchOpen(false);

    setFormData((current) => ({
      ...current,
      dog_name: dog.name,
      breed: dog.breed ?? "",
      phone_number: formatPolishPhoneNumber(dog.phone_number),
    }));
  };

  // Validates required fields and appointment business rules before submission.
  const validateForm = (): AppointmentFormErrors => {
    const newErrors: AppointmentFormErrors = {};

    if (!formData.dog_name.trim()) {
      newErrors.dog_name = "Podaj nazwę psa.";
    }

    if (!formData.appointment_date) {
      newErrors.appointment_date = "Wybierz datę wizyty.";
    }

    if (!formData.appointment_time) {
      newErrors.appointment_time = "Wybierz godzinę wizyty.";
    } else if (!timeOptions.includes(formData.appointment_time)) {
      newErrors.appointment_time =
        "Godzina wizyty musi być wybrana co 5 minut.";
    }

    const parsedPrice = Number(priceInput);

    if (priceInput.trim() === "") {
      newErrors.price = "Podaj cenę wizyty.";
    } else if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
      newErrors.price = "Cena nie może być ujemna.";
    }

    if (formData.appointment_time) {
      const [hours, minutes] = formData.appointment_time.split(":").map(Number);

      const totalMinutes = hours * 60 + minutes;
      const isValidTime =
        Number.isFinite(totalMinutes) &&
        totalMinutes >= 7 * 60 &&
        totalMinutes <= 18 * 60 &&
        minutes % 5 === 0;

      if (!isValidTime) {
        newErrors.appointment_time =
          "Wybierz godzinę od 07:00 do 18:00 w odstępach co 5 minut.";
      }
    }

    const validStatuses: AppointmentStatus[] = [
      "scheduled",
      "completed",
      "cancelled",
    ];

    if (!validStatuses.includes(formData.status)) {
      newErrors.status = "Wybierz prawidłowy status wizyty.";
    }

    return newErrors;
  };

  // Runs validation and emits the normalized form data to the parent.
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    const validationErrors = validateForm();

    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    onSubmit({
      appointment: {
        ...formData,
        price: Number(priceInput),
      },
      selectedSavedDogId,
    });
  };

  // Closes the form without saving changes.
  const handleCancel = () => {
    if (isSubmitting) {
      return;
    }

    onCancel();
  };

  return (
    <form className="appointment-form" onSubmit={handleSubmit}>
      <div className="appointment-form__field">
        <label className="appointment-form__label" htmlFor="dog_name">
          Nazwa psa *
        </label>

        <input
          className="appointment-form__input"
          id="dog_name"
          name="dog_name"
          type="text"
          value={formData.dog_name}
          onChange={(event) => {
            setSelectedSavedDogId(null);
            setIsSavedDogSearchOpen(true);

            setFormData((current) => ({
              ...current,
              dog_name: event.target.value,
            }));
          }}
          required
          disabled={isSubmitting}
          autoComplete="off"
        />

        {isLoadingSavedDogs && (
          <p className="appointment-form__hint" role="status">
            Ładowanie zapisanych psów...
          </p>
        )}

        {isSavedDogSearchOpen &&
          !isLoadingSavedDogs &&
          !savedDogsError &&
          matchingSavedDogs.length > 0 && (
            <div
              className="appointment-form__saved-dogs"
              role="listbox"
              aria-label="Zapisane psy"
            >
              {matchingSavedDogs.map((dog) => (
                <button
                  key={dog.id}
                  className="appointment-form__saved-dog"
                  type="button"
                  role="option"
                  aria-selected={selectedSavedDogId === dog.id}
                  onClick={() => handleSelectSavedDog(dog)}
                  disabled={isSubmitting}
                >
                  <span className="appointment-form__saved-dog-name">
                    {dog.name}
                    {dog.breed ? ` — ${dog.breed}` : ""}
                  </span>

                  {dog.phone_number && (
                    <span className="appointment-form__saved-dog-phone">
                      {formatPolishPhoneNumber(dog.phone_number)}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}

        {savedDogsError && (
          <p className="appointment-form__hint">
            Nie udało się wczytać zapisanych psów.
          </p>
        )}

        {errors.dog_name && (
          <p className="appointment-form__error" role="alert">
            {errors.dog_name}
          </p>
        )}
      </div>

      <div className="appointment-form__field">
        <label className="appointment-form__label" htmlFor="breed">
          Rasa
        </label>

        <input
          className="appointment-form__input"
          id="breed"
          name="breed"
          type="text"
          value={formData.breed}
          onChange={(event) =>
            setFormData({
              ...formData,
              breed: event.target.value,
            })
          }
          disabled={isSubmitting}
        />
      </div>
      <div className="appointment-form__row">
        <div className="appointment-form__field">
            <label className="appointment-form__label" htmlFor="saved_dog_phone">
            Telefon
          </label>

          <input
            className="appointment-form__input"
            id="saved_dog_phone"
            name="saved_dog_phone"
            type="tel"
            value={formData.phone_number ?? ""}
            onChange={(event) => {
              setFormData({
                ...formData,
                phone_number: formatPolishPhoneNumber(event.target.value),
              });
            }}
            disabled={isSubmitting}
            autoComplete="tel"
            inputMode="numeric"
            maxLength={11}
            placeholder="np. 323 232 232"
          />
        </div>

        <div className="appointment-form__field">
          <label className="appointment-form__label" htmlFor="price">
            Cena *
          </label>

          <input
            className="appointment-form__input"
            id="price"
            name="price"
            type="number"
            min="0"
            step="0.01"
            inputMode="decimal"
            value={priceInput}
            onFocus={() => {
              if (priceInput === "0") {
                setPriceInput("");
              }
            }}
            onChange={(event) => {
              const value = event.target.value;

              setPriceInput(value);

              setFormData({
                ...formData,
                price: value === "" ? 0 : Number(value),
              });
            }}
            required
            disabled={isSubmitting}
          />

          {errors.price && (
            <p className="appointment-form__error" role="alert">
              {errors.price}
            </p>
          )}
        </div>
      </div>

      <div className="appointment-form__row">
        <div className="appointment-form__field">
                    <label className="appointment-form__label" htmlFor="appointment_time">
            Godzina *
          </label>

          <select
            className="appointment-form__select"
            id="appointment_time"
            name="appointment_time"
            value={formData.appointment_time}
            onChange={(event) =>
              setFormData({
                ...formData,
                appointment_time: event.target.value,
              })
            }
            required
            disabled={isSubmitting}
          >
            <option value="">Wybierz godzinę</option>
            {timeOptions.map((time) => (
              <option key={time} value={time}>
                {time}
              </option>
            ))}
          </select>

          {errors.appointment_time && (
            <p className="appointment-form__error" role="alert">
              {errors.appointment_time}
            </p>
          )}
        </div>

        <div className="appointment-form__field">
          <label className="appointment-form__label" htmlFor="appointment_date">
            Data *
          </label>

          <div className="appointment-form__date-control">
            <input
              className="appointment-form__input"
              id="appointment_date"
              name="appointment_date"
              type="date"
              value={formData.appointment_date}
              onChange={(event) =>
                setFormData({
                  ...formData,
                  appointment_date: event.target.value,
                })
              }
              required
              disabled={isSubmitting}
            />
            <img
              className="appointment-form__date-icon"
              src={calendarIcon}
              alt=""
              aria-hidden="true"
            />
          </div>

          {errors.appointment_date && (
            <p className="appointment-form__error" role="alert">
              {errors.appointment_date}
            </p>
          )}
        </div>
      </div>

      <div className="appointment-form__field">
        <label className="appointment-form__label" htmlFor="status">
          Status
        </label>

        <select
          className="appointment-form__select"
          id="status"
          name="status"
          value={formData.status}
          onChange={(event) =>
            setFormData({
              ...formData,
              status: event.target.value as AppointmentStatus,
            })
          }
          disabled={isSubmitting}
        >
          <option value="scheduled">Zaplanowana</option>
          <option value="completed">Zakończona</option>
          <option value="cancelled">Anulowana</option>
        </select>

        {errors.status && (
          <p className="appointment-form__error" role="alert">
            {errors.status}
          </p>
        )}
      </div>

      <div className="appointment-form__field appointment-form__field--full">
        <label className="appointment-form__label" htmlFor="note">
          Notatka
        </label>

        <textarea
          className="appointment-form__textarea"
          id="note"
          name="note"
          value={formData.note}
          onChange={(event) =>
            setFormData({
              ...formData,
              note: event.target.value,
            })
          }
          disabled={isSubmitting}
        />
      </div>

      <div className="appointment-form__actions">
        <button
          className="appointment-form__button appointment-form__button--secondary"
          type="button"
          onClick={handleCancel}
          disabled={isSubmitting}
        >
          Anuluj
        </button>

        <button
          className="appointment-form__button appointment-form__button--primary"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting
            ? "Zapisywanie..."
            : appointment
              ? "Zapisz zmiany"
              : "Zapisz"}
        </button>
      </div>
    </form>
  );
}

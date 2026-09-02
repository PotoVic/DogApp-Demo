/*
 * Prompt for applying an available PWA update.
 */

import { useRegisterSW } from "virtual:pwa-register/react";
import "./pwa-update-prompt.css";

// Shows a small prompt when a new installed PWA version is available.
export function PWAUpdatePrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW();

  if (!needRefresh) {
    return null;
  }

  // Hides the update prompt without applying the new service-worker version.
  const handleDismiss = () => {
    setNeedRefresh(false);
  };

  // Requests the waiting service worker to activate and reloads the application.
  const handleUpdate = () => {
    void updateServiceWorker(true);
  };

  return (
    <aside
      className="pwa-update-prompt"
      aria-label="Aktualizacja aplikacji"
    >
      <div className="pwa-update-prompt__content">
        <p className="pwa-update-prompt__title">
          Dostępna jest nowa wersja SpaKalendar.
        </p>

        <p className="pwa-update-prompt__message">
          Zaktualizuj aplikację, aby korzystać z najnowszej wersji.
        </p>
      </div>

      <div className="pwa-update-prompt__actions">
        <button
          className="pwa-update-prompt__button pwa-update-prompt__button--secondary"
          type="button"
          onClick={handleDismiss}
        >
          Później
        </button>

        <button
          className="pwa-update-prompt__button pwa-update-prompt__button--primary"
          type="button"
          onClick={handleUpdate}
        >
          Aktualizuj
        </button>
      </div>
    </aside>
  );
}

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("../src/features/appointments/components/AppointmentsForm", () => ({
  AppointmentForm: () => <div data-testid="appointment-form" />,
}));

import { AppointmentModal } from "../src/components/appointments/AppointmentModal";

describe("AppointmentModal", () => {
  it("renders dialog and child form", () => {
    render(
      <AppointmentModal onSubmit={vi.fn()} onClose={vi.fn()} />,
    );
    expect(screen.getByRole("dialog")).toBeTruthy();
    expect(screen.getByTestId("appointment-form")).toBeTruthy();
  });

  it("closes on Escape when not submitting", () => {
    const onClose = vi.fn();
    render(<AppointmentModal onSubmit={vi.fn()} onClose={onClose} />);
    fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("does not close on Escape while submitting", () => {
    const onClose = vi.fn();
    render(
      <AppointmentModal onSubmit={vi.fn()} onClose={onClose} isSubmitting />,
    );
    fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });
    expect(onClose).not.toHaveBeenCalled();
  });

  it("renders an error alert when provided", () => {
    render(
      <AppointmentModal
        error="An error occurred"
        onSubmit={vi.fn()}
        onClose={vi.fn()}
      />,
    );
    expect(screen.getByRole("alert")).toHaveTextContent("An error occurred");
  });
});

import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Toast } from "../src/components/feedback/Toast";

describe("Toast", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("renders success as a status", () => {
    render(<Toast message="Saved" onClose={vi.fn()} />);
    expect(screen.getByRole("status")).toHaveTextContent("Saved");
  });

  it("renders errors as alerts", () => {
    render(<Toast message="Error" variant="error" onClose={vi.fn()} />);
    expect(screen.getByRole("alert")).toHaveTextContent("Error");
  });

  it("starts exiting after four seconds", async () => {
    const { container } = render(<Toast message="Test" onClose={vi.fn()} />);

    await act(async () => {
      vi.advanceTimersByTime(4000);
    });

    expect(container.firstElementChild?.className).toContain("toast--exiting");
  });

  it("closes after the exit animation finishes", async () => {
    const onClose = vi.fn();
    render(<Toast message="Test" onClose={onClose} />);

    await act(async () => {
      vi.advanceTimersByTime(4000);
    });

    expect(onClose).not.toHaveBeenCalled();

    await act(async () => {
      vi.advanceTimersByTime(280);
    });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("starts exit animation from the close button", async () => {
    const { container } = render(<Toast message="Test" onClose={vi.fn()} />);

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Close notification" }));
    });

    expect(container.firstElementChild?.className).toContain("toast--exiting");
  });
});

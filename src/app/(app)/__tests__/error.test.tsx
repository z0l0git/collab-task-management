import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import AppError from "../error";

describe("app error boundary", () => {
  it("logs the error and offers a retry and a way out", () => {
    const logged = vi.spyOn(console, "error").mockImplementation(() => {});
    const retry = vi.fn();
    const error = new Error("listener exploded");

    render(<AppError error={error} retry={retry} />);

    expect(
      screen.getByRole("heading", { name: "Something went wrong" }),
    ).toBeInTheDocument();
    expect(screen.queryByText("listener exploded")).not.toBeInTheDocument();
    expect(logged).toHaveBeenCalledWith(error);
    expect(
      screen.getByRole("link", { name: "All workspaces" }),
    ).toHaveAttribute("href", "/workspaces");

    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(retry).toHaveBeenCalledOnce();

    logged.mockRestore();
  });
});

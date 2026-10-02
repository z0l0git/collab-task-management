import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Button } from "../Button";

describe("Button", () => {
  it("defaults to type=button so it cannot submit a form by accident", () => {
    render(<Button>Save</Button>);
    expect(screen.getByRole("button", { name: "Save" })).toHaveAttribute(
      "type",
      "button",
    );
  });

  it("keeps the label colour alongside the size class", () => {
    render(<Button>Primary</Button>);
    const button = screen.getByRole("button", { name: "Primary" });
    expect(button).toHaveClass("text-on-accent");
    expect(button).toHaveClass("text-button");
  });

  it("is busy but not dimmed while loading", () => {
    render(<Button isLoading>Saving</Button>);
    const button = screen.getByRole("button", { name: /Saving/ });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-busy", "true");
    expect(button).not.toHaveClass("opacity-50");
  });

  it("dims only when genuinely disabled", () => {
    render(<Button disabled>Disabled</Button>);
    const button = screen.getByRole("button", { name: "Disabled" });
    expect(button).toBeDisabled();
    expect(button).toHaveClass("opacity-50");
    expect(button).not.toHaveAttribute("aria-busy");
  });

  it("lets a caller override the variant background", () => {
    render(<Button className="bg-danger-solid">Delete</Button>);
    const button = screen.getByRole("button", { name: "Delete" });
    expect(button).toHaveClass("bg-danger-solid");
    expect(button).not.toHaveClass("bg-accent");
  });
});

import { fireEvent, render, screen } from "@testing-library/react";
import { beforeAll, describe, expect, it, vi } from "vitest";

import { Modal } from "../Modal";

beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function showModal(
    this: HTMLDialogElement,
  ) {
    this.setAttribute("open", "");
  };
  HTMLDialogElement.prototype.close = function close(this: HTMLDialogElement) {
    this.removeAttribute("open");
    this.dispatchEvent(new Event("close"));
  };
});

const dialog = () => screen.getByRole("dialog", { hidden: true });

describe("Modal", () => {
  it("opens as a labelled dialog and focuses the data-autofocus field", () => {
    render(
      <Modal
        open
        onClose={() => undefined}
        title="Rename"
        description="Pick a name"
      >
        <input aria-label="Name" data-autofocus />
      </Modal>,
    );

    expect(dialog()).toHaveAttribute("open");
    expect(dialog()).toHaveAccessibleName("Rename");
    expect(dialog()).toHaveAccessibleDescription("Pick a name");
    expect(screen.getByRole("textbox", { name: "Name" })).toHaveFocus();
  });

  it("calls onClose from the close button, a backdrop click and Esc", () => {
    const onClose = vi.fn();
    render(<Modal open onClose={onClose} title="Rename" />);

    fireEvent.click(screen.getByRole("button", { name: "Close dialog" }));
    fireEvent.click(dialog());
    fireEvent(dialog(), new Event("close"));

    expect(onClose).toHaveBeenCalledTimes(3);
  });

  it("closes the native dialog when open turns false, without calling onClose", () => {
    const onClose = vi.fn();
    const { rerender } = render(
      <Modal open onClose={onClose} title="Rename" />,
    );

    rerender(<Modal open={false} onClose={onClose} title="Rename" />);

    expect(dialog()).not.toHaveAttribute("open");
    expect(onClose).not.toHaveBeenCalled();
  });
});

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Menu, MenuItem } from "../Menu";

const renderMenu = (onRename = vi.fn()) => {
  render(
    <Menu label="Task actions" trigger="Actions">
      <MenuItem onSelect={onRename}>Rename</MenuItem>
      <MenuItem onSelect={() => undefined}>Duplicate</MenuItem>
      <MenuItem onSelect={() => undefined}>Delete</MenuItem>
    </Menu>,
  );
  return {
    trigger: screen.getByRole("button", { name: "Task actions" }),
    item: (name: string) => screen.getByRole("menuitem", { name }),
  };
};

describe("Menu", () => {
  it("opens with ArrowDown and focuses the first item", () => {
    const { trigger, item } = renderMenu();

    fireEvent.keyDown(trigger, { key: "ArrowDown" });

    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(item("Rename")).toHaveFocus();
  });

  it("moves focus with the arrow keys and wraps around", () => {
    const { trigger, item } = renderMenu();
    fireEvent.click(trigger);
    const menu = screen.getByRole("menu", { name: "Task actions" });

    fireEvent.keyDown(menu, { key: "ArrowDown" });
    expect(item("Duplicate")).toHaveFocus();

    fireEvent.keyDown(menu, { key: "End" });
    expect(item("Delete")).toHaveFocus();

    fireEvent.keyDown(menu, { key: "ArrowDown" });
    expect(item("Rename")).toHaveFocus();

    fireEvent.keyDown(menu, { key: "ArrowUp" });
    expect(item("Delete")).toHaveFocus();
  });

  it("returns focus to the trigger after Esc", () => {
    const { trigger } = renderMenu();
    fireEvent.click(trigger);

    fireEvent.keyDown(screen.getByRole("menu"), { key: "Escape" });

    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it("runs the item, closes and returns focus to the trigger", () => {
    const onRename = vi.fn();
    const { trigger, item } = renderMenu(onRename);
    fireEvent.click(trigger);

    fireEvent.click(item("Rename"));

    expect(onRename).toHaveBeenCalledOnce();
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });
});

import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { CLEARED_FILTERS, type TaskFilters } from "@/lib/utils/taskFilters";
import type { Workspace } from "@/types/workspace";

import { TaskToolbar } from "../TaskToolbar";

const workspace: Workspace = {
  id: "ws1",
  name: "Work",
  description: "",
  ownerId: "u1",
  memberIds: ["u1"],
  members: {
    u1: {
      role: "owner",
      displayName: "Ada",
      email: "ada@example.com",
      photoURL: null,
    },
  },
  labels: ["bug"],
  statuses: [
    { id: "todo", name: "Todo", color: "gray", done: false },
    { id: "done", name: "Done", color: "green", done: true },
  ],
  createdAt: null,
  updatedAt: null,
};

const NO_FILTERS: TaskFilters = {
  q: "",
  status: null,
  priority: null,
  assignee: null,
  due: null,
  label: null,
};

const renderToolbar = (filters: Partial<TaskFilters> = {}, showSort = true) => {
  const onChange = vi.fn();
  render(
    <TaskToolbar
      workspace={workspace}
      filters={{ ...NO_FILTERS, ...filters }}
      sort="manual"
      showSort={showSort}
      onChange={onChange}
    />,
  );
  return onChange;
};

afterEach(() => {
  vi.useRealTimers();
});

describe("TaskToolbar", () => {
  it("sends a picked filter, and null when set back to any", () => {
    const onChange = renderToolbar({ priority: "high" });

    fireEvent.change(
      screen.getByRole("combobox", { name: "Filter by status" }),
      {
        target: { value: "done" },
      },
    );
    fireEvent.change(
      screen.getByRole("combobox", { name: "Filter by priority" }),
      { target: { value: "" } },
    );

    expect(onChange).toHaveBeenNthCalledWith(1, { status: "done" });
    expect(onChange).toHaveBeenNthCalledWith(2, { priority: null });
  });

  it("waits for typing to pause before searching", () => {
    vi.useFakeTimers();
    const onChange = renderToolbar();
    const search = screen.getByRole("searchbox", { name: "Search tasks" });

    fireEvent.change(search, { target: { value: "log" } });
    fireEvent.change(search, { target: { value: "login " } });
    expect(onChange).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(250);
    });
    expect(onChange).toHaveBeenCalledExactlyOnceWith({ q: "login" });
  });

  it("clears every filter at once", () => {
    const onChange = renderToolbar({ status: "todo", label: "bug" });

    fireEvent.click(screen.getByRole("button", { name: "Clear" }));

    expect(onChange).toHaveBeenCalledExactlyOnceWith(CLEARED_FILTERS);
  });

  it("hides Clear without filters and sort when the view has no sort", () => {
    renderToolbar({}, false);

    expect(
      screen.queryByRole("button", { name: "Clear" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("combobox", { name: "Sort tasks" }),
    ).not.toBeInTheDocument();
  });

  it("drops the sort param for the default board order", () => {
    const onChange = renderToolbar();

    fireEvent.change(screen.getByRole("combobox", { name: "Sort tasks" }), {
      target: { value: "due" },
    });
    fireEvent.change(screen.getByRole("combobox", { name: "Sort tasks" }), {
      target: { value: "manual" },
    });

    expect(onChange).toHaveBeenNthCalledWith(1, { sort: "due" });
    expect(onChange).toHaveBeenNthCalledWith(2, { sort: null });
  });
});

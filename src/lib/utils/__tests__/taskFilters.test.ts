import { Timestamp } from "firebase/firestore";
import { describe, expect, it } from "vitest";

import {
  activeFilterCount,
  filterTasks,
  parseFilters,
  parseSort,
  sortTasks,
  type TaskFilters,
} from "@/lib/utils/taskFilters";
import type { Task } from "@/types/task";

const NOW = new Date(2026, 9, 6, 15, 0);

const day = (offset: number, hour = 9) =>
  Timestamp.fromDate(
    new Date(NOW.getFullYear(), NOW.getMonth(), NOW.getDate() + offset, hour),
  );

const task = (id: string, overrides: Partial<Task> = {}): Task => ({
  id,
  title: id,
  description: "",
  status: "todo",
  priority: "medium",
  assigneeId: null,
  dueDate: null,
  labels: [],
  order: 0,
  createdBy: "u1",
  createdAt: null,
  updatedAt: null,
  ...overrides,
});

const NO_FILTERS: TaskFilters = {
  q: "",
  status: null,
  priority: null,
  assignee: null,
  due: null,
  label: null,
};

const ids = (tasks: Task[]) => tasks.map((item) => item.id);

const run = (tasks: Task[], filters: Partial<TaskFilters>) =>
  ids(
    filterTasks(
      tasks,
      { ...NO_FILTERS, ...filters },
      {
        doneIds: new Set(["done"]),
        now: NOW,
      },
    ),
  );

describe("parseFilters", () => {
  it("reads known values and drops invalid ones", () => {
    const params = new URLSearchParams(
      "q=%20Login%20&status=review&priority=extreme&due=week&assignee=none",
    );
    const filters = parseFilters(params);

    expect(filters).toEqual({
      ...NO_FILTERS,
      q: "Login",
      status: "review",
      due: "week",
      assignee: "none",
    });
    expect(activeFilterCount(filters)).toBe(4);
    expect(parseSort(new URLSearchParams("sort=sideways"))).toBe("manual");
  });
});

describe("filterTasks", () => {
  it("searches title and description, ignoring case", () => {
    const tasks = [
      task("a", { title: "Fix LOGIN page" }),
      task("b", { description: "the login flow breaks" }),
      task("c", { title: "Dark mode" }),
    ];
    expect(run(tasks, { q: "login" })).toEqual(["a", "b"]);
  });

  it("combines status, priority, assignee and label", () => {
    const tasks = [
      task("a", { priority: "high", assigneeId: "me", labels: ["bug"] }),
      task("b", { priority: "high", assigneeId: "me" }),
      task("c", { priority: "high", status: "done", labels: ["bug"] }),
      task("d", { priority: "low" }),
    ];
    expect(run(tasks, { priority: "high", label: "bug" })).toEqual(["a", "c"]);
    expect(run(tasks, { assignee: "me", status: "todo" })).toEqual(["a", "b"]);
    expect(run(tasks, { assignee: "none" })).toEqual(["c", "d"]);
  });

  it("buckets due dates, and done tasks are never overdue", () => {
    const tasks = [
      task("late", { dueDate: day(-1) }),
      task("late-done", { status: "done", dueDate: day(-1) }),
      task("today", { dueDate: day(0, 8) }),
      task("sunday", { dueDate: day(6) }),
      task("later", { dueDate: day(7) }),
      task("undated"),
    ];
    expect(run(tasks, { due: "overdue" })).toEqual(["late"]);
    expect(run(tasks, { due: "today" })).toEqual(["today"]);
    expect(run(tasks, { due: "week" })).toEqual(["today", "sunday"]);
    expect(run(tasks, { due: "none" })).toEqual(["undated"]);
  });
});

describe("sortTasks", () => {
  const tasks = [
    task("a", { createdAt: day(-3), priority: "low", dueDate: day(2) }),
    task("b", { createdAt: day(-1), priority: "urgent" }),
    task("c", { createdAt: day(-2), priority: "high", dueDate: day(1) }),
  ];

  it("sorts by created date, due date and priority", () => {
    expect(ids(sortTasks(tasks, "newest"))).toEqual(["b", "c", "a"]);
    expect(ids(sortTasks(tasks, "oldest"))).toEqual(["a", "c", "b"]);
    expect(ids(sortTasks(tasks, "due"))).toEqual(["c", "a", "b"]);
    expect(ids(sortTasks(tasks, "priority"))).toEqual(["b", "c", "a"]);
  });

  it("does not mutate the input", () => {
    sortTasks(tasks, "newest");
    expect(ids(tasks)).toEqual(["a", "b", "c"]);
  });
});

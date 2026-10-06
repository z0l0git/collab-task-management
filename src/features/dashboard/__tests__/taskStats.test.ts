import { Timestamp } from "firebase/firestore";
import { describe, expect, it } from "vitest";

import type { Task } from "@/features/tasks/types";

import { taskStats } from "../taskStats";

const daysFromNow = (days: number) =>
  Timestamp.fromDate(new Date(Date.now() + days * 24 * 60 * 60 * 1000));

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

describe("taskStats", () => {
  it("counts open, done, overdue and my open tasks from the done statuses", () => {
    const tasks = [
      task("a", { assigneeId: "me", dueDate: daysFromNow(-2) }),
      task("b", { status: "review", assigneeId: "me" }),
      task("c", { status: "shipped", dueDate: daysFromNow(-5) }),
      task("d", { status: "shipped", assigneeId: "me" }),
      task("e", { assigneeId: "someone-else" }),
    ];

    expect(taskStats(tasks, "me", new Set(["shipped"]))).toEqual({
      total: 5,
      open: 3,
      done: 2,
      overdue: 1,
      mine: 2,
    });
  });

  it("treats nothing as done when no status is marked done", () => {
    const tasks = [task("a", { status: "done", dueDate: daysFromNow(-1) })];

    expect(taskStats(tasks, undefined, new Set())).toEqual({
      total: 1,
      open: 1,
      done: 0,
      overdue: 1,
      mine: 0,
    });
  });
});

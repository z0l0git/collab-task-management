import { Timestamp } from "firebase/firestore";
import { describe, expect, it } from "vitest";

import type { Task } from "@/features/tasks/types";

import { myOpenTasks, taskStats } from "../taskStats";

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
  it("counts each status, overdue and the current user's tasks", () => {
    const tasks = [
      task("a", { assigneeId: "me", dueDate: daysFromNow(-2) }),
      task("b", { status: "in_progress", assigneeId: "me" }),
      task("c", { status: "done", dueDate: daysFromNow(-5) }),
      task("d", { assigneeId: "someone-else" }),
    ];

    expect(taskStats(tasks, "me")).toEqual({
      total: 4,
      todo: 2,
      inProgress: 1,
      done: 1,
      overdue: 1,
      assignedToMe: 2,
    });
  });

  it("returns zeros for an empty workspace and no user", () => {
    expect(taskStats([], undefined)).toEqual({
      total: 0,
      todo: 0,
      inProgress: 0,
      done: 0,
      overdue: 0,
      assignedToMe: 0,
    });
  });
});

describe("myOpenTasks", () => {
  it("keeps open tasks assigned to me, overdue first, then by due date", () => {
    const tasks = [
      task("no-date", { assigneeId: "me" }),
      task("next-week", { assigneeId: "me", dueDate: daysFromNow(7) }),
      task("overdue", { assigneeId: "me", dueDate: daysFromNow(-1) }),
      task("tomorrow", { assigneeId: "me", dueDate: daysFromNow(1) }),
      task("finished", { assigneeId: "me", status: "done" }),
      task("not-mine", { assigneeId: "other" }),
    ];

    expect(myOpenTasks(tasks, "me").map((item) => item.id)).toEqual([
      "overdue",
      "tomorrow",
      "next-week",
      "no-date",
    ]);
  });
});

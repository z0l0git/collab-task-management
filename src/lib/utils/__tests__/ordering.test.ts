import { describe, expect, it } from "vitest";

import { columnTasks, orderBetween, planMove } from "@/lib/utils/ordering";
import type { Task } from "@/types/task";

const task = (id: string, status: Task["status"], order: number): Task => ({
  id,
  title: id,
  description: "",
  status,
  priority: "medium",
  assigneeId: null,
  dueDate: null,
  labels: [],
  order,
  createdBy: "u1",
  createdAt: null,
  updatedAt: null,
});

const tasks = [
  task("a", "todo", 1000),
  task("b", "todo", 2000),
  task("c", "todo", 3000),
  task("d", "done", 500),
];

const orderAfter = (id: string, move: ReturnType<typeof planMove>) => {
  const moved = tasks.map((item) =>
    item.id === id && move ? { ...item, ...move } : item,
  );
  return columnTasks(moved, move?.status ?? "todo").map((item) => item.id);
};

describe("orderBetween", () => {
  it("takes the midpoint between two neighbours", () => {
    expect(orderBetween(1000, 2000)).toBe(1500);
  });

  it("steps past the end when there is only one neighbour", () => {
    expect(orderBetween(undefined, 1000)).toBe(1000 - 1024);
    expect(orderBetween(1000, undefined)).toBe(1000 + 1024);
  });
});

describe("planMove", () => {
  it("dragging down a column lands after the card dropped on", () => {
    const move = planMove(tasks, "a", {
      status: "todo",
      overId: "b",
      below: false,
    });
    expect(orderAfter("a", move)).toEqual(["b", "a", "c"]);
  });

  it("dragging up a column lands before the card dropped on", () => {
    const move = planMove(tasks, "c", {
      status: "todo",
      overId: "a",
      below: false,
    });
    expect(orderAfter("c", move)).toEqual(["c", "a", "b"]);
  });

  it("dropping on the top half of another column's card goes before it", () => {
    const move = planMove(tasks, "b", {
      status: "done",
      overId: "d",
      below: false,
    });
    expect(orderAfter("b", move)).toEqual(["b", "d"]);
  });

  it("dropping on the bottom half of another column's card goes after it", () => {
    const move = planMove(tasks, "b", {
      status: "done",
      overId: "d",
      below: true,
    });
    expect(orderAfter("b", move)).toEqual(["d", "b"]);
  });

  it("dropping into an empty column works", () => {
    const move = planMove(tasks, "a", {
      status: "in_progress",
      overId: null,
      below: false,
    });
    expect(move).toEqual({ status: "in_progress", order: 0 });
  });

  it("returns null when the card lands where it started", () => {
    expect(
      planMove(tasks, "b", { status: "todo", overId: "b", below: false }),
    ).toBeNull();
  });
});

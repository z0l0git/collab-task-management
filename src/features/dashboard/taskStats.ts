import { isOverdue } from "@/features/tasks/dueDate";
import type { Task } from "@/features/tasks/types";

export type TaskStats = {
  total: number;
  todo: number;
  inProgress: number;
  done: number;
  overdue: number;
  assignedToMe: number;
};

export const taskStats = (tasks: Task[], uid: string | undefined) =>
  tasks.reduce<TaskStats>(
    (stats, task) => ({
      total: stats.total + 1,
      todo: stats.todo + (task.status === "todo" ? 1 : 0),
      inProgress: stats.inProgress + (task.status === "in_progress" ? 1 : 0),
      done: stats.done + (task.status === "done" ? 1 : 0),
      overdue: stats.overdue + (isOverdue(task) ? 1 : 0),
      assignedToMe:
        stats.assignedToMe + (uid && task.assigneeId === uid ? 1 : 0),
    }),
    { total: 0, todo: 0, inProgress: 0, done: 0, overdue: 0, assignedToMe: 0 },
  );

const dueTime = (task: Task) =>
  task.dueDate ? task.dueDate.toMillis() : Number.POSITIVE_INFINITY;

export const myOpenTasks = <T extends Task>(
  tasks: T[],
  uid: string | undefined,
) =>
  tasks
    .filter((task) => uid && task.assigneeId === uid && task.status !== "done")
    .sort(
      (a, b) =>
        Number(isOverdue(b)) - Number(isOverdue(a)) ||
        dueTime(a) - dueTime(b) ||
        a.title.localeCompare(b.title),
    );

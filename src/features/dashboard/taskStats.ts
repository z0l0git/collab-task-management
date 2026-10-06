import { isOverdue } from "@/features/tasks/dueDate";
import type { Task } from "@/features/tasks/types";

export type TaskStats = {
  total: number;
  open: number;
  done: number;
  overdue: number;
  mine: number;
};

export const taskStats = (
  tasks: Task[],
  uid: string | undefined,
  doneIds: Set<string>,
) =>
  tasks.reduce<TaskStats>(
    (stats, task) => {
      const done = doneIds.has(task.status);
      return {
        total: stats.total + 1,
        open: stats.open + (done ? 0 : 1),
        done: stats.done + (done ? 1 : 0),
        overdue: stats.overdue + (isOverdue(task, done) ? 1 : 0),
        mine: stats.mine + (!done && uid && task.assigneeId === uid ? 1 : 0),
      };
    },
    { total: 0, open: 0, done: 0, overdue: 0, mine: 0 },
  );

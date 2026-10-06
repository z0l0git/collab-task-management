import type { Task } from "@/types/task";

const GAP = 1024;

export const columnTasks = (tasks: Task[], status: string) =>
  tasks
    .filter((task) => task.status === status)
    .sort((a, b) => a.order - b.order || a.id.localeCompare(b.id));

export const orderBetween = (before?: number, after?: number) => {
  if (before === undefined && after === undefined) return 0;
  if (before === undefined) return (after as number) - GAP;
  if (after === undefined) return before + GAP;
  return (before + after) / 2;
};

export type DropTarget = {
  status: string;
  overId: string | null;
  below: boolean;
};

export const planMove = (
  tasks: Task[],
  activeId: string,
  { status, overId, below }: DropTarget,
): { status: string; order: number } | null => {
  const column = columnTasks(tasks, status);
  const ids = column.map((task) => task.id);
  const others = column.filter((task) => task.id !== activeId);
  const from = ids.indexOf(activeId);

  let to: number;
  if (overId === null) {
    to = others.length;
  } else if (from !== -1) {
    to = ids.indexOf(overId);
  } else {
    to = others.findIndex((task) => task.id === overId) + (below ? 1 : 0);
  }

  if (from === to) return null;

  return {
    status,
    order: orderBetween(others[to - 1]?.order, others[to]?.order),
  };
};

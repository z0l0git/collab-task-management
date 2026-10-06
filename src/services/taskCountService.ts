import {
  getCountFromServer,
  query,
  Timestamp,
  where,
  type Query,
  type QueryConstraint,
} from "firebase/firestore";

import { startOfToday } from "@/lib/utils/dueDate";
import { tasksRef } from "@/services/taskService";

export type TaskCounts = {
  total: number;
  open: number;
  done: number;
  overdue: number;
  mine: number;
  byStatus: Record<string, number>;
};

const countOf = async (target: Query) =>
  (await getCountFromServer(target)).data().count;

export const fetchTaskCounts = async (
  workspaceId: string,
  options: { uid: string; doneIds: string[]; statusIds: string[] },
): Promise<TaskCounts> => {
  const tasks = tasksRef(workspaceId);
  const { uid, doneIds, statusIds } = options;
  const dueBeforeToday = where(
    "dueDate",
    "<",
    Timestamp.fromDate(startOfToday()),
  );
  const assignedToMe = where("assigneeId", "==", uid);

  const count = (...constraints: QueryConstraint[]) =>
    countOf(query(tasks, ...constraints));
  const countDone = (...constraints: QueryConstraint[]) =>
    doneIds.length > 0
      ? count(...constraints, where("status", "in", doneIds))
      : Promise.resolve(0);

  const [total, done, dueBefore, dueBeforeDone, mine, mineDone, ...perStatus] =
    await Promise.all([
      count(),
      countDone(),
      count(dueBeforeToday),
      countDone(dueBeforeToday),
      count(assignedToMe),
      countDone(assignedToMe),
      ...statusIds.map((id) => count(where("status", "==", id))),
    ]);

  return {
    total,
    open: total - done,
    done,
    overdue: dueBefore - dueBeforeDone,
    mine: mine - mineDone,
    byStatus: Object.fromEntries(
      statusIds.map((id, index) => [id, perStatus[index] ?? 0]),
    ),
  };
};

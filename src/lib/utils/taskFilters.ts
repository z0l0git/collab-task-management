import { isTaskPriority, TASK_PRIORITIES, type Task } from "@/types/task";

export const DUE_FILTERS = ["overdue", "today", "week", "none"] as const;
export type DueFilter = (typeof DUE_FILTERS)[number];

export const DUE_FILTER_LABELS: Record<DueFilter, string> = {
  overdue: "Overdue",
  today: "Due today",
  week: "Next 7 days",
  none: "No due date",
};

export const TASK_SORTS = [
  "manual",
  "newest",
  "oldest",
  "due",
  "priority",
] as const;
export type TaskSort = (typeof TASK_SORTS)[number];

export const SORT_LABELS: Record<TaskSort, string> = {
  manual: "Board order",
  newest: "Newest first",
  oldest: "Oldest first",
  due: "Due date",
  priority: "Priority",
};

export const UNASSIGNED = "none";

export type TaskFilters = {
  q: string;
  status: string | null;
  priority: Task["priority"] | null;
  assignee: string | null;
  due: DueFilter | null;
  label: string | null;
};

export const FILTER_PARAMS = [
  "q",
  "status",
  "priority",
  "assignee",
  "due",
  "label",
] as const;

export const CLEARED_FILTERS = Object.fromEntries(
  FILTER_PARAMS.map((key) => [key, null]),
) as Record<(typeof FILTER_PARAMS)[number], null>;

const isDueFilter = (value: unknown): value is DueFilter =>
  DUE_FILTERS.includes(value as DueFilter);

const isTaskSort = (value: unknown): value is TaskSort =>
  TASK_SORTS.includes(value as TaskSort);

export const parseFilters = (params: URLSearchParams): TaskFilters => {
  const priority = params.get("priority");
  const due = params.get("due");
  return {
    q: params.get("q")?.trim() ?? "",
    status: params.get("status"),
    priority: isTaskPriority(priority) ? priority : null,
    assignee: params.get("assignee"),
    due: isDueFilter(due) ? due : null,
    label: params.get("label"),
  };
};

export const parseSort = (params: URLSearchParams): TaskSort => {
  const sort = params.get("sort");
  return isTaskSort(sort) ? sort : "manual";
};

export const activeFilterCount = (filters: TaskFilters) =>
  FILTER_PARAMS.filter((key) => Boolean(filters[key])).length;

const startOfDay = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

const addDays = (date: Date, days: number) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);

const matchesDue = (
  task: Task,
  due: DueFilter,
  done: boolean,
  now: Date,
): boolean => {
  if (due === "none") return task.dueDate === null;
  if (!task.dueDate) return false;
  const date = task.dueDate.toDate();
  const today = startOfDay(now);
  if (due === "overdue") return !done && date < today;
  if (due === "today") return date >= today && date < addDays(today, 1);
  return date >= today && date < addDays(today, 7);
};

export const filterTasks = (
  tasks: Task[],
  filters: TaskFilters,
  context: { doneIds: Set<string>; now?: Date },
) => {
  const query = filters.q.toLowerCase();
  const now = context.now ?? new Date();
  return tasks.filter(
    (task) =>
      (!query ||
        task.title.toLowerCase().includes(query) ||
        task.description.toLowerCase().includes(query)) &&
      (!filters.status || task.status === filters.status) &&
      (!filters.priority || task.priority === filters.priority) &&
      (!filters.assignee ||
        (filters.assignee === UNASSIGNED
          ? task.assigneeId === null
          : task.assigneeId === filters.assignee)) &&
      (!filters.label || task.labels.includes(filters.label)) &&
      (!filters.due ||
        matchesDue(task, filters.due, context.doneIds.has(task.status), now)),
  );
};

const millis = (value: { toMillis: () => number } | null) =>
  value ? value.toMillis() : null;

const PRIORITY_RANK = Object.fromEntries(
  TASK_PRIORITIES.map((priority, index) => [priority, index]),
) as Record<Task["priority"], number>;

const byCreated = (a: Task, b: Task) =>
  (millis(a.createdAt) ?? Number.MAX_SAFE_INTEGER) -
  (millis(b.createdAt) ?? Number.MAX_SAFE_INTEGER);

const COMPARATORS: Record<TaskSort, (a: Task, b: Task) => number> = {
  manual: (a, b) => a.order - b.order || a.id.localeCompare(b.id),
  newest: (a, b) => byCreated(b, a),
  oldest: byCreated,
  due: (a, b) => {
    const left = millis(a.dueDate);
    const right = millis(b.dueDate);
    if (left === right) return byCreated(b, a);
    if (left === null) return 1;
    if (right === null) return -1;
    return left - right;
  },
  priority: (a, b) =>
    PRIORITY_RANK[b.priority] - PRIORITY_RANK[a.priority] || byCreated(b, a),
};

export const sortTasks = (tasks: Task[], sort: TaskSort) =>
  [...tasks].sort(COMPARATORS[sort]);

export const STATUS_COLORS = [
  "gray",
  "blue",
  "green",
  "yellow",
  "orange",
  "red",
  "purple",
  "pink",
] as const;

export type StatusColor = (typeof STATUS_COLORS)[number];

export type TaskStatus = {
  id: string;
  name: string;
  color: StatusColor;
  done: boolean;
};

export const STATUS_LIMITS = { count: 20, name: 30 } as const;

export const DEFAULT_STATUSES: TaskStatus[] = [
  { id: "todo", name: "Todo", color: "gray", done: false },
  { id: "in_progress", name: "In progress", color: "yellow", done: false },
  { id: "done", name: "Done", color: "green", done: true },
];

export const STATUS_TEXT: Record<StatusColor, string> = {
  gray: "text-status-gray",
  blue: "text-status-blue",
  green: "text-status-green",
  yellow: "text-status-yellow",
  orange: "text-status-orange",
  red: "text-status-red",
  purple: "text-status-purple",
  pink: "text-status-pink",
};

export const STATUS_BG: Record<StatusColor, string> = {
  gray: "bg-status-gray",
  blue: "bg-status-blue",
  green: "bg-status-green",
  yellow: "bg-status-yellow",
  orange: "bg-status-orange",
  red: "bg-status-red",
  purple: "bg-status-purple",
  pink: "bg-status-pink",
};

export const isStatusColor = (value: unknown): value is StatusColor =>
  STATUS_COLORS.includes(value as StatusColor);

export const statusById = (statuses: TaskStatus[], id: string) =>
  statuses.find((status) => status.id === id);

export const doneStatusIds = (statuses: TaskStatus[]) =>
  new Set(statuses.filter((status) => status.done).map((status) => status.id));

export const newStatusId = () =>
  `s_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

export const statusOptions = (statuses: TaskStatus[], current?: string) => [
  ...statuses.map((status) => ({ value: status.id, label: status.name })),
  ...(current && !statusById(statuses, current)
    ? [{ value: current, label: "No status" }]
    : []),
];

import { Suspense } from "react";

import { TasksPanel } from "@/features/tasks/TasksPanel";

const WorkspacePage = () => (
  <Suspense>
    <TasksPanel />
  </Suspense>
);

export default WorkspacePage;

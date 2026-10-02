import type { Metadata } from "next";

import { WorkspaceList } from "@/features/workspaces/WorkspaceList";

export const metadata: Metadata = { title: "Workspaces" };

const WorkspacesPage = () => <WorkspaceList />;

export default WorkspacesPage;

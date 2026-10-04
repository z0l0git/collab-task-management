import type { Metadata } from "next";

import { WorkspaceSettingsView } from "@/features/workspaces/WorkspaceSettingsView";

export const metadata: Metadata = { title: "Settings" };

const WorkspaceSettingsPage = () => <WorkspaceSettingsView />;

export default WorkspaceSettingsPage;

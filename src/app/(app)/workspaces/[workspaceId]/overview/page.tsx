import type { Metadata } from "next";

import { OverviewView } from "@/features/dashboard/OverviewView";

export const metadata: Metadata = { title: "Overview" };

const WorkspaceOverviewPage = () => <OverviewView />;

export default WorkspaceOverviewPage;

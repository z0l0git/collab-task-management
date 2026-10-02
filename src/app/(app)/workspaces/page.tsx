import { LayoutGrid } from "lucide-react";
import type { Metadata } from "next";

import { EmptyState } from "@/components/ui";

export const metadata: Metadata = { title: "Workspaces" };

const WorkspacesPage = () => (
  <>
    <h1 className="text-headline text-ink">Workspaces</h1>
    <p className="text-body-sm text-ink-subtle mt-1.5">
      Shared spaces for your team&apos;s tasks.
    </p>
    <EmptyState
      className="mt-8"
      icon={LayoutGrid}
      title="No workspaces yet"
      description="Creating and managing workspaces lands in the next sprint."
    />
  </>
);

export default WorkspacesPage;

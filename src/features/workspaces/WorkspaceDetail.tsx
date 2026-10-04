"use client";

import { ArrowLeft, Lock, SearchX } from "lucide-react";
import Link from "next/link";

import { Button, EmptyState, Spinner } from "@/components/ui";
import { useAuth } from "@/features/auth/AuthProvider";
import { TasksPanel } from "@/features/tasks/TasksPanel";

import { LabelsPanel } from "./LabelsPanel";
import { MembersPanel } from "./MembersPanel";
import { WorkspaceSettings } from "./WorkspaceSettings";
import { isOwner } from "./types";
import { useWorkspace } from "./useWorkspaces";

const BackLink = () => (
  <Link
    href="/workspaces"
    className="text-body-sm text-ink-subtle hover:text-ink inline-flex items-center gap-1.5"
  >
    <ArrowLeft className="size-4" aria-hidden="true" />
    All workspaces
  </Link>
);

export const WorkspaceDetail = ({ workspaceId }: { workspaceId: string }) => {
  const { user } = useAuth();
  const { workspace, loading, error, notFound } = useWorkspace(workspaceId);

  if (loading) {
    return (
      <div className="text-ink-subtle flex justify-center py-16">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || notFound) {
    return (
      <>
        <BackLink />
        <EmptyState
          className="mt-8"
          icon={notFound ? SearchX : Lock}
          title={notFound ? "Workspace not found" : "You don't have access"}
          description={
            notFound
              ? "It may have been deleted, or the link is wrong."
              : "Ask the owner to add you, then try again."
          }
          action={
            <Link href="/workspaces">
              <Button variant="secondary">Back to workspaces</Button>
            </Link>
          }
        />
      </>
    );
  }

  if (!workspace) return null;

  return (
    <>
      <BackLink />

      <header className="mt-4">
        <h1 className="text-headline text-ink">{workspace.name}</h1>
        {workspace.description ? (
          <p className="text-body-sm text-ink-subtle mt-1.5 max-w-2xl">
            {workspace.description}
          </p>
        ) : null}
      </header>

      <div className="mt-8">
        <TasksPanel workspace={workspace} />
      </div>

      <div className="mt-10 space-y-4">
        <MembersPanel workspace={workspace} />
        {isOwner(workspace, user?.uid) ? (
          <>
            <LabelsPanel workspace={workspace} />
            <WorkspaceSettings workspace={workspace} />
          </>
        ) : null}
      </div>
    </>
  );
};

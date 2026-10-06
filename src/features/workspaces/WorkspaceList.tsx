"use client";

import { LayoutGrid, Plus, Users } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { PanelBody, PanelHeader } from "@/components/layout/Panel";
import { Badge, Button, EmptyState, Spinner } from "@/components/ui";
import { useAuth } from "@/features/auth/AuthProvider";

import { useAllWorkspaceTasks } from "@/features/dashboard/useAllWorkspaceTasks";
import { WorkspaceInsights } from "@/features/dashboard/WorkspaceInsights";
import { doneStatusIds } from "@/features/tasks/statuses";

import { CreateWorkspaceDialog } from "./CreateWorkspaceDialog";
import { useWorkspaces } from "./useWorkspaces";
import { WorkspaceTile } from "./WorkspaceTile";

export const WorkspaceList = () => {
  const { user } = useAuth();
  const { workspaces, loading, error } = useWorkspaces();
  const [creating, setCreating] = useState(false);
  const workspaceIds = useMemo(
    () => workspaces.map((workspace) => workspace.id),
    [workspaces],
  );
  const tasksOf = useAllWorkspaceTasks(workspaceIds);

  return (
    <>
      <PanelHeader
        title="Workspaces"
        actions={
          <Button
            size="sm"
            leadingIcon={<Plus className="size-3.5" aria-hidden="true" />}
            onClick={() => setCreating(true)}
          >
            New workspace
          </Button>
        }
      />
      {loading ? (
        <PanelBody className="text-ink-subtle flex justify-center py-16">
          <Spinner size="lg" />
        </PanelBody>
      ) : error ? (
        <PanelBody>
          <p
            role="alert"
            className="bg-danger/10 text-danger text-body-sm rounded-md px-3 py-2"
          >
            {error}
          </p>
        </PanelBody>
      ) : workspaces.length === 0 ? (
        <PanelBody>
          <EmptyState
            icon={LayoutGrid}
            title="No workspaces yet"
            description="Create one for your team, or ask a workspace owner to add you by your email."
            action={
              <Button onClick={() => setCreating(true)}>New workspace</Button>
            }
          />
        </PanelBody>
      ) : (
        <PanelBody>
          <ul className="border-hairline divide-hairline mx-auto w-full max-w-5xl divide-y overflow-hidden rounded-lg border">
            {workspaces.map((workspace) => (
              <li key={workspace.id}>
                <Link
                  href={`/workspaces/${workspace.id}`}
                  className="hover:bg-surface-3 flex min-h-14 items-center gap-3 px-4 py-2.5 transition-colors"
                >
                  <WorkspaceTile name={workspace.name} size={32} />
                  <span className="min-w-0 flex-1">
                    <span className="text-body-sm text-ink block truncate font-medium">
                      {workspace.name}
                    </span>
                    <span className="text-caption block truncate">
                      <span className="md:hidden">
                        <WorkspaceInsights
                          compact
                          state={tasksOf(workspace.id)}
                          uid={user?.uid}
                          doneIds={doneStatusIds(workspace.statuses)}
                        />
                      </span>
                      <span className="text-ink-subtle hidden md:inline">
                        {workspace.description}
                      </span>
                    </span>
                  </span>
                  <span className="text-caption hidden shrink-0 md:flex">
                    <WorkspaceInsights
                      state={tasksOf(workspace.id)}
                      uid={user?.uid}
                      doneIds={doneStatusIds(workspace.statuses)}
                    />
                  </span>
                  <span className="text-caption text-ink-subtle inline-flex shrink-0 items-center gap-1.5 tabular-nums">
                    <Users className="size-3.5" aria-hidden="true" />
                    {workspace.memberIds.length}
                    <span className="sr-only">
                      {workspace.memberIds.length === 1
                        ? " member"
                        : " members"}
                    </span>
                  </span>
                  <span className="w-16 shrink-0 text-right">
                    {workspace.ownerId === user?.uid ? (
                      <Badge variant="accent">Owner</Badge>
                    ) : (
                      <span className="text-caption text-ink-subtle">
                        Member
                      </span>
                    )}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </PanelBody>
      )}

      <CreateWorkspaceDialog
        open={creating}
        onClose={() => setCreating(false)}
      />
    </>
  );
};

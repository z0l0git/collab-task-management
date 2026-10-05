"use client";

import { LayoutGrid, Plus, Users } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { PanelBody, PanelHeader } from "@/components/layout/Panel";
import { Badge, Button, EmptyState, Spinner } from "@/components/ui";
import { useAuth } from "@/features/auth/AuthProvider";

import { CreateWorkspaceDialog } from "./CreateWorkspaceDialog";
import { useWorkspaces } from "./useWorkspaces";
import { WorkspaceTile } from "./WorkspaceTile";

export const WorkspaceList = () => {
  const { user } = useAuth();
  const { workspaces, loading, error } = useWorkspaces();
  const [creating, setCreating] = useState(false);

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
        <ul className="divide-hairline border-hairline divide-y border-b">
          {workspaces.map((workspace) => (
            <li key={workspace.id}>
              <Link
                href={`/workspaces/${workspace.id}`}
                className="hover:bg-surface-2 flex h-11 items-center gap-3 px-4 transition-colors lg:px-6"
              >
                <WorkspaceTile name={workspace.name} />
                <span className="text-body-sm text-ink shrink-0 font-medium">
                  {workspace.name}
                </span>
                <span className="text-body-sm text-ink-subtle hidden min-w-0 flex-1 truncate sm:block">
                  {workspace.description}
                </span>
                <span className="text-caption text-ink-subtle ml-auto inline-flex shrink-0 items-center gap-1.5 tabular-nums">
                  <Users className="size-3.5" aria-hidden="true" />
                  {workspace.memberIds.length}
                  <span className="sr-only">
                    {workspace.memberIds.length === 1 ? " member" : " members"}
                  </span>
                </span>
                <span className="w-16 shrink-0 text-right">
                  {workspace.ownerId === user?.uid ? (
                    <Badge variant="accent">Owner</Badge>
                  ) : (
                    <span className="text-caption text-ink-subtle">Member</span>
                  )}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <CreateWorkspaceDialog
        open={creating}
        onClose={() => setCreating(false)}
      />
    </>
  );
};

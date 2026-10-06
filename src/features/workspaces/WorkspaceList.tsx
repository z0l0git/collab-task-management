"use client";

import { LayoutGrid, Plus } from "lucide-react";
import { useState } from "react";

import { PanelBody, PanelHeader } from "@/components/layout/Panel";
import { Button, EmptyState, Spinner } from "@/components/ui";
import { useAuth } from "@/features/auth/AuthProvider";

import { CreateWorkspaceDialog } from "./CreateWorkspaceDialog";
import { useWorkspaces } from "./useWorkspaces";
import { WorkspaceRow } from "./WorkspaceRow";

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
        <PanelBody>
          <ul className="border-hairline divide-hairline mx-auto w-full max-w-5xl divide-y overflow-hidden rounded-lg border">
            {workspaces.map((workspace) => (
              <WorkspaceRow
                key={workspace.id}
                workspace={workspace}
                isOwner={workspace.ownerId === user?.uid}
              />
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

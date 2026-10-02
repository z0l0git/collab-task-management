"use client";

import { LayoutGrid, Plus, Users } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Badge, Button, EmptyState, Spinner } from "@/components/ui";
import { useAuth } from "@/features/auth/AuthProvider";

import { CreateWorkspaceDialog } from "./CreateWorkspaceDialog";
import { useWorkspaces } from "./useWorkspaces";

export const WorkspaceList = () => {
  const { user } = useAuth();
  const { workspaces, loading, error } = useWorkspaces();
  const [creating, setCreating] = useState(false);

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-headline text-ink">Workspaces</h1>
          <p className="text-body-sm text-ink-subtle mt-1.5">
            Shared spaces for your team&apos;s tasks.
          </p>
        </div>
        <Button
          leadingIcon={<Plus className="size-4" aria-hidden="true" />}
          onClick={() => setCreating(true)}
        >
          New workspace
        </Button>
      </div>

      {loading ? (
        <div className="text-ink-subtle flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : error ? (
        <p
          role="alert"
          className="bg-danger/10 text-danger text-body-sm mt-8 rounded-md px-3 py-2"
        >
          {error}
        </p>
      ) : workspaces.length === 0 ? (
        <EmptyState
          className="mt-8"
          icon={LayoutGrid}
          title="No workspaces yet"
          description="Create one to start organising work with your team."
          action={
            <Button onClick={() => setCreating(true)}>New workspace</Button>
          }
        />
      ) : (
        <ul className="mt-8 grid gap-3 sm:grid-cols-2">
          {workspaces.map((workspace) => (
            <li key={workspace.id}>
              <Link
                href={`/workspaces/${workspace.id}`}
                className="border-hairline bg-surface-1 hover:bg-surface-2 hover:border-hairline-strong block rounded-lg border p-4 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-ink font-medium">{workspace.name}</h2>
                  {workspace.ownerId === user?.uid ? (
                    <Badge variant="accent">Owner</Badge>
                  ) : null}
                </div>
                {workspace.description ? (
                  <p className="text-body-sm text-ink-subtle mt-1 line-clamp-2">
                    {workspace.description}
                  </p>
                ) : null}
                <p className="text-caption text-ink-subtle mt-3 flex items-center gap-1.5">
                  <Users className="size-3.5" aria-hidden="true" />
                  {workspace.memberIds.length}
                  {workspace.memberIds.length === 1 ? " member" : " members"}
                </p>
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

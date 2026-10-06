"use client";

import { Lock, SearchX } from "lucide-react";
import Link from "next/link";
import { createContext, useContext, type ReactNode } from "react";

import { PanelBody, PanelHeader } from "@/components/layout/Panel";
import { Button, EmptyState, Spinner } from "@/components/ui";
import type { Workspace } from "@/types/workspace";

import { useWorkspace } from "./hooks/useWorkspaces";

const WorkspaceContext = createContext<Workspace | null>(null);

export const useCurrentWorkspace = () => {
  const workspace = useContext(WorkspaceContext);
  if (!workspace) {
    throw new Error(
      "useCurrentWorkspace must be used inside WorkspaceProvider",
    );
  }
  return workspace;
};

const WORKSPACES_CRUMB = [{ label: "Workspaces", href: "/workspaces" }];

export const WorkspaceProvider = ({
  workspaceId,
  children,
}: {
  workspaceId: string;
  children: ReactNode;
}) => {
  const { workspace, loading, error, notFound } = useWorkspace(workspaceId);

  if (loading) {
    return (
      <>
        <PanelHeader parents={WORKSPACES_CRUMB} title="Loading…" />
        <PanelBody className="text-ink-subtle flex justify-center py-16">
          <Spinner size="lg" />
        </PanelBody>
      </>
    );
  }

  if (error || notFound || !workspace) {
    return (
      <>
        <PanelHeader
          parents={WORKSPACES_CRUMB}
          title={notFound ? "Not found" : "No access"}
        />
        <PanelBody>
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
        </PanelBody>
      </>
    );
  }

  return (
    <WorkspaceContext.Provider value={workspace}>
      {children}
    </WorkspaceContext.Provider>
  );
};

"use client";

import { Info } from "lucide-react";

import { PanelBody, PanelHeader } from "@/components/layout/Panel";
import { useAuth } from "@/features/auth/AuthProvider";

import { DeleteWorkspaceCard } from "./DeleteWorkspaceCard";
import { LabelsPanel } from "./LabelsPanel";
import { MembersPanel } from "./MembersPanel";
import { StatusesPanel } from "./StatusesPanel";
import { isOwner } from "./types";
import { useCurrentWorkspace } from "./WorkspaceProvider";
import { WorkspaceSettings } from "./WorkspaceSettings";

export const WorkspaceSettingsView = () => {
  const { user } = useAuth();
  const workspace = useCurrentWorkspace();
  const owner = isOwner(workspace, user?.uid);

  return (
    <>
      <PanelHeader
        parents={[
          { label: workspace.name, href: `/workspaces/${workspace.id}` },
        ]}
        title="Settings"
      />
      <PanelBody>
        <div className="mx-auto w-full max-w-2xl space-y-4">
          {owner ? (
            <WorkspaceSettings key={workspace.id} workspace={workspace} />
          ) : (
            <p className="border-hairline text-body-sm text-ink-subtle flex items-center gap-2 rounded-md border px-3 py-2">
              <Info className="size-4 shrink-0" aria-hidden="true" />
              Only the owner can change workspace settings.
            </p>
          )}
          <MembersPanel workspace={workspace} />
          {owner ? (
            <>
              <StatusesPanel workspace={workspace} />
              <LabelsPanel workspace={workspace} />
              <DeleteWorkspaceCard workspace={workspace} />
            </>
          ) : null}
        </div>
      </PanelBody>
    </>
  );
};

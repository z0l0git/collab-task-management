"use client";

import { ChevronDown, LayoutGrid, Plus, SquareKanban } from "lucide-react";
import { useState } from "react";

import { Menu, MenuDivider, MenuItem, MenuLabel } from "@/components/ui";
import { CreateWorkspaceDialog } from "@/features/workspaces/CreateWorkspaceDialog";
import type { Workspace } from "@/features/workspaces/types";
import { WorkspaceTile } from "@/features/workspaces/WorkspaceTile";

export const WorkspaceSwitcher = ({
  workspaces,
  current,
}: {
  workspaces: Workspace[];
  current: Workspace | undefined;
}) => {
  const [creating, setCreating] = useState(false);

  return (
    <>
      <Menu
        label={
          current ? `Switch workspace, current: ${current.name}` : "Workspaces"
        }
        triggerClassName="hover:bg-surface-2 flex h-9 w-full items-center gap-2 rounded-md px-2 text-left transition-colors"
        trigger={
          <>
            {current ? (
              <WorkspaceTile name={current.name} />
            ) : (
              <span className="bg-accent text-on-accent rounded-xs p-0.5">
                <SquareKanban className="size-4" aria-hidden="true" />
              </span>
            )}
            <span className="text-eyebrow text-ink min-w-0 flex-1 truncate font-semibold">
              {current?.name ?? "Taskboard"}
            </span>
            <ChevronDown
              className="text-ink-subtle size-3.5 shrink-0"
              aria-hidden="true"
            />
          </>
        }
      >
        {workspaces.length > 0 ? (
          <>
            <MenuLabel>Workspaces</MenuLabel>
            {workspaces.map((workspace) => (
              <MenuItem
                key={workspace.id}
                href={`/workspaces/${workspace.id}`}
                leading={<WorkspaceTile name={workspace.name} />}
                checked={workspace.id === current?.id}
              >
                {workspace.name}
              </MenuItem>
            ))}
            <MenuDivider />
          </>
        ) : null}
        <MenuItem href="/workspaces" icon={LayoutGrid}>
          All workspaces
        </MenuItem>
        <MenuItem icon={Plus} onSelect={() => setCreating(true)}>
          Create workspace
        </MenuItem>
      </Menu>

      <CreateWorkspaceDialog
        open={creating}
        onClose={() => setCreating(false)}
      />
    </>
  );
};

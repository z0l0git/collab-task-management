"use client";

import { Users } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui";
import { useTaskCounts } from "@/features/dashboard/useTaskCounts";
import { WorkspaceInsights } from "@/features/dashboard/WorkspaceInsights";

import type { Workspace } from "./types";
import { WorkspaceTile } from "./WorkspaceTile";

export const WorkspaceRow = ({
  workspace,
  isOwner,
}: {
  workspace: Workspace;
  isOwner: boolean;
}) => {
  const counts = useTaskCounts(workspace);

  return (
    <li>
      <Link
        href={`/workspaces/${workspace.id}`}
        className="hover:bg-hover flex min-h-14 items-center gap-3 px-4 py-2.5 transition-colors"
      >
        <WorkspaceTile name={workspace.name} size={32} />
        <span className="min-w-0 flex-1">
          <span className="text-body-sm text-ink block truncate font-medium">
            {workspace.name}
          </span>
          <span className="text-caption block truncate">
            <span className="md:hidden">
              <WorkspaceInsights compact state={counts} />
            </span>
            <span className="text-ink-subtle hidden md:inline">
              {workspace.description}
            </span>
          </span>
        </span>
        <span className="text-caption hidden shrink-0 md:flex">
          <WorkspaceInsights state={counts} />
        </span>
        <span className="text-caption text-ink-subtle inline-flex shrink-0 items-center gap-1.5 tabular-nums">
          <Users className="size-3.5" aria-hidden="true" />
          {workspace.memberIds.length}
          <span className="sr-only">
            {workspace.memberIds.length === 1 ? " member" : " members"}
          </span>
        </span>
        <span className="w-16 shrink-0 text-right">
          {isOwner ? (
            <Badge variant="accent">Owner</Badge>
          ) : (
            <span className="text-caption text-ink-subtle">Member</span>
          )}
        </span>
      </Link>
    </li>
  );
};

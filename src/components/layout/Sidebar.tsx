"use client";

import { ArrowLeft, Gauge, Settings, SquareKanban } from "lucide-react";
import { useParams } from "next/navigation";
import type { ReactNode } from "react";

import type { Workspace } from "@/features/workspaces/types";
import { WorkspaceTile } from "@/features/workspaces/WorkspaceTile";

import { NavItem } from "./NavItem";
import { UserMenu } from "./UserMenu";
import { WorkspaceSwitcher } from "./WorkspaceSwitcher";

const SIDEBAR_WORKSPACE_LIMIT = 8;

const Section = ({
  label,
  children,
}: {
  label?: string;
  children: ReactNode;
}) => (
  <div className="flex flex-col gap-px">
    {label ? (
      <p className="text-caption text-ink-subtle px-2 pb-1 font-medium">
        {label}
      </p>
    ) : null}
    {children}
  </div>
);

export const Sidebar = ({ workspaces }: { workspaces: Workspace[] }) => {
  const { workspaceId } = useParams<{ workspaceId?: string }>();
  const current = workspaces.find((workspace) => workspace.id === workspaceId);

  return (
    <div className="flex h-full flex-col gap-5 p-3">
      <WorkspaceSwitcher workspaces={workspaces} current={current} />

      <nav
        aria-label={current ? "Workspace" : "Workspaces"}
        className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto"
      >
        {current ? (
          <>
            <Section>
              <NavItem href={`/workspaces/${current.id}/overview`} icon={Gauge}>
                Overview
              </NavItem>
              <NavItem href={`/workspaces/${current.id}`} icon={SquareKanban}>
                Tasks
              </NavItem>
              <NavItem
                href={`/workspaces/${current.id}/settings`}
                icon={Settings}
              >
                Settings
              </NavItem>
            </Section>
            <Section>
              <NavItem href="/workspaces" icon={ArrowLeft}>
                All workspaces
              </NavItem>
            </Section>
          </>
        ) : workspaces.length > 0 ? (
          <Section label="Workspaces">
            {workspaces.slice(0, SIDEBAR_WORKSPACE_LIMIT).map((workspace) => (
              <NavItem
                key={workspace.id}
                href={`/workspaces/${workspace.id}`}
                leading={<WorkspaceTile name={workspace.name} />}
              >
                {workspace.name}
              </NavItem>
            ))}
          </Section>
        ) : null}
      </nav>

      <UserMenu />
    </div>
  );
};

import { WorkspaceProvider } from "@/features/workspaces/WorkspaceProvider";

const WorkspaceLayout = async ({
  children,
  params,
}: LayoutProps<"/workspaces/[workspaceId]">) => {
  const { workspaceId } = await params;
  return (
    <WorkspaceProvider workspaceId={workspaceId}>{children}</WorkspaceProvider>
  );
};

export default WorkspaceLayout;

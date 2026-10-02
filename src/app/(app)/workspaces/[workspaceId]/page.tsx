import { WorkspaceDetail } from "@/features/workspaces/WorkspaceDetail";

const WorkspacePage = async ({
  params,
}: PageProps<"/workspaces/[workspaceId]">) => {
  const { workspaceId } = await params;
  return <WorkspaceDetail workspaceId={workspaceId} />;
};

export default WorkspacePage;

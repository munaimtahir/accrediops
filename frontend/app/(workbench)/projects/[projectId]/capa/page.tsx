import { ProjectCapaWorkspaceScreen } from "@/components/screens/project-capa-workspace-screen";

export default async function ProjectCapaWorkspacePage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  return <ProjectCapaWorkspaceScreen projectId={Number(projectId)} />;
}


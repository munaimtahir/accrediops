import { ProjectWorklistScreen } from "@/components/screens/project-worklist-screen";

export default async function ProjectWorklistPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;

  return <ProjectWorklistScreen projectId={Number(projectId)} />;
}

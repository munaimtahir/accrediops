import { ProjectOverviewScreen } from "@/components/screens/project-overview-screen";

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;

  return <ProjectOverviewScreen projectId={Number(projectId)} />;
}

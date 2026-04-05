import { ProjectReadinessScreen } from "@/components/screens/project-readiness-screen";

export default async function ProjectReadinessPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  return <ProjectReadinessScreen projectId={Number(projectId)} />;
}

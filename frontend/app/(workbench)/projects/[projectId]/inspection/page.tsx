import { ProjectInspectionScreen } from "@/components/screens/project-inspection-screen";

export default async function ProjectInspectionPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  return <ProjectInspectionScreen projectId={Number(projectId)} />;
}

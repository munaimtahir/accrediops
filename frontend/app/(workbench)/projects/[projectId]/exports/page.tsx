import { ProjectExportHistoryScreen } from "@/components/screens/project-export-history-screen";

export default async function ProjectExportHistoryPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  return <ProjectExportHistoryScreen projectId={Number(projectId)} />;
}

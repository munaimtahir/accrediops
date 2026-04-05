import { ProjectPrintPackScreen } from "@/components/screens/project-print-pack-screen";

export default async function ProjectPrintPackPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  return <ProjectPrintPackScreen projectId={Number(projectId)} />;
}

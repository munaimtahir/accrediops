import { AreasProgressScreen } from "@/components/screens/areas-progress-screen";

export default async function AreasProgressPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;

  return <AreasProgressScreen projectId={Number(projectId)} />;
}

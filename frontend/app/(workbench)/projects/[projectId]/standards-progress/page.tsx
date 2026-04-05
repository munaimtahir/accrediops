import { StandardsProgressScreen } from "@/components/screens/standards-progress-screen";

export default async function StandardsProgressPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;

  return <StandardsProgressScreen projectId={Number(projectId)} />;
}

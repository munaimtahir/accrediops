import { ProjectRecurringScreen } from "@/components/screens/project-recurring-screen";

export default async function ProjectRecurringPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;

  return <ProjectRecurringScreen projectId={Number(projectId)} />;
}

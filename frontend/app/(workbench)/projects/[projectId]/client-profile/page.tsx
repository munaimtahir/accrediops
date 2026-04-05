import { ProjectClientProfileScreen } from "@/components/screens/project-client-profile-screen";

export default async function ProjectClientProfilePage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  return <ProjectClientProfileScreen projectId={Number(projectId)} />;
}

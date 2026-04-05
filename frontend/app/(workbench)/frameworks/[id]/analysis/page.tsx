import { FrameworkAnalysisScreen } from "@/components/screens/framework-analysis-screen";

export default async function FrameworkAnalysisPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <FrameworkAnalysisScreen frameworkId={Number(id)} />;
}

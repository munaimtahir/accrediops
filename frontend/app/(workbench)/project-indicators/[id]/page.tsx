import { IndicatorDetailScreen } from "@/components/screens/indicator-detail-screen";

export default async function IndicatorDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <IndicatorDetailScreen indicatorId={Number(id)} />;
}

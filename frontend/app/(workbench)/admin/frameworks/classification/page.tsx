import { IndicatorClassificationScreen } from "@/components/screens/indicator-classification-screen";

export default async function IndicatorClassificationPage({
  searchParams,
}: {
  searchParams: Promise<{ framework?: string }>;
}) {
  const params = await searchParams;
  const frameworkId = params.framework ? Number(params.framework) : undefined;
  return <IndicatorClassificationScreen initialFrameworkId={frameworkId} />;
}

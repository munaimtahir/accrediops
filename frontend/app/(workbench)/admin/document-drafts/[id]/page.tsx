import { DocumentDraftReviewScreen } from "@/components/screens/document-draft-review-screen";

export default async function DocumentDraftReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const draftId = Number(resolvedParams.id);
  return <DocumentDraftReviewScreen draftId={draftId} />;
}

import { DocumentDraftReviewScreen } from "@/components/screens/document-draft-review-screen";

export default function DocumentDraftReviewPage({ params }: { params: any }) {
  const draftId = Number(params.id);
  return <DocumentDraftReviewScreen draftId={draftId} />;
}

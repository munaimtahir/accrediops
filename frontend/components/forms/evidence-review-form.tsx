"use client";

import { FormEvent, useState } from "react";

import { useToast } from "@/components/common/toaster";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { StatusSemanticBadge } from "@/components/common/status-semantic-badge";
import { getSafeErrorMessage } from "@/lib/api/client";
import {
  EvidenceApprovalStatus,
  EvidenceCompletenessStatus,
  EvidenceItem,
  EvidenceReviewPayload,
  EvidenceValidityStatus,
} from "@/types";
import { getEvidenceApprovalTone } from "@/utils/status-semantics";

interface EvidenceReviewFormProps {
  evidence: EvidenceItem;
  loading?: boolean;
  onSubmit: (payload: EvidenceReviewPayload) => Promise<unknown>;
  onSuccess?: () => void;
}

const validityOptions: EvidenceValidityStatus[] = ["UNKNOWN", "VALID", "INVALID"];
const completenessOptions: EvidenceCompletenessStatus[] = ["UNKNOWN", "COMPLETE", "INCOMPLETE"];
const approvalOptions: EvidenceApprovalStatus[] = ["PENDING", "APPROVED", "REJECTED"];

export function EvidenceReviewForm({
  evidence,
  loading,
  onSubmit,
  onSuccess,
}: EvidenceReviewFormProps) {
  const { pushToast } = useToast();
  const [validity, setValidity] = useState<EvidenceValidityStatus>(evidence.validity_status);
  const [completeness, setCompleteness] = useState<EvidenceCompletenessStatus>(
    evidence.completeness_status,
  );
  const [approval, setApproval] = useState<EvidenceApprovalStatus>(evidence.approval_status);
  const [reviewNotes, setReviewNotes] = useState(evidence.review_notes ?? "");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      await onSubmit({
        validity_status: validity,
        completeness_status: completeness,
        approval_status: approval,
        review_notes: reviewNotes,
      });
      pushToast("Evidence review saved.", "success");
      onSuccess?.();
    } catch (error) {
      pushToast(getSafeErrorMessage(error), "error");
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="grid gap-4 md:grid-cols-3">
        <label className="space-y-2 text-sm">
          <span className="font-medium text-slate-700">Validity</span>
          <Select value={validity} onChange={(event) => setValidity(event.target.value as EvidenceValidityStatus)}>
            {validityOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </Select>
        </label>
        <label className="space-y-2 text-sm">
          <span className="font-medium text-slate-700">Completeness</span>
          <Select
            value={completeness}
            onChange={(event) => setCompleteness(event.target.value as EvidenceCompletenessStatus)}
          >
            {completenessOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </Select>
        </label>
        <label className="space-y-2 text-sm">
          <span className="font-medium text-slate-700">Approval</span>
          <Select value={approval} onChange={(event) => setApproval(event.target.value as EvidenceApprovalStatus)}>
            {approvalOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </Select>
        </label>
      </div>

      <label className="space-y-2 text-sm">
        <span className="font-medium text-slate-700">Review notes</span>
        <Textarea value={reviewNotes} onChange={(event) => setReviewNotes(event.target.value)} />
      </label>
      <div>
        <p className="text-xs text-slate-500">Current approval semantic</p>
        <div className="mt-1">
          <StatusSemanticBadge tone={getEvidenceApprovalTone(approval)} />
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" loading={loading}>
          Save review
        </Button>
      </div>
    </form>
  );
}

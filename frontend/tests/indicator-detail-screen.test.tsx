import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

import { IndicatorDetailScreen } from "@/components/screens/indicator-detail-screen";
import { renderWithQueryClient } from "./test-utils";

const authState = {
  role: "OWNER",
};

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("@/lib/hooks/use-auth", () => ({
  useAuthSession: () => ({
    data: { authenticated: true, user: { role: authState.role } },
  }),
}));

vi.mock("@/lib/hooks/use-evidence", () => ({
  useEvidence: () => ({ data: [], isLoading: false, error: null }),
}));

vi.mock("@/lib/hooks/use-progress", () => ({
  useProgress: () => ({ data: [], isLoading: false, error: null }),
}));

vi.mock("@/lib/hooks/use-indicator", () => ({
  useIndicator: () => ({
    isLoading: false,
    error: null,
    data: {
      id: 10,
      project: 1,
      indicator: {
        id: 10,
        framework: 1,
        area: 1,
        standard: 1,
        code: "IND-001",
        text: "Indicator text",
        required_evidence_description: "Need evidence",
        evidence_type: "DOCUMENT",
        document_type: "POLICY",
        fulfillment_guidance: "Follow guidance",
        is_recurring: false,
        recurrence_frequency: "NONE",
        recurrence_mode: "EITHER",
        minimum_required_evidence_count: 1,
        reusable_template_allowed: true,
        evidence_reuse_policy: "MANUAL_REVIEW",
        is_active: true,
        sort_order: 1,
      },
      current_status: "NOT_STARTED",
      is_finalized: false,
      is_met: false,
      owner: { id: 1, username: "owner", first_name: "Owner", last_name: "User", role: "OWNER" },
      reviewer: { id: 2, username: "reviewer", first_name: "Reviewer", last_name: "User", role: "REVIEWER" },
      approver: { id: 3, username: "approver", first_name: "Approver", last_name: "User", role: "APPROVER" },
      priority: "MEDIUM",
      due_date: null,
      notes: "",
      last_updated_by: 1,
      last_updated_at: "2026-01-01T00:00:00Z",
      evidence_items: [],
      recurring_requirement: null,
      recurring_instances: [],
      comments: [],
      status_history: [],
      ai_outputs: [],
      audit_summary: [],
      capabilities: {
        can_assign: true,
        can_update_working_state: true,
        can_add_evidence: true,
        can_edit_evidence: true,
        can_review_evidence: true,
        can_submit_recurring: true,
        can_approve_recurring: true,
        can_use_ai_assist: true,
        can_start: true,
        can_send_for_review: true,
        can_mark_met: true,
        can_reopen: false,
      },
      readiness_flags: {
        approved_evidence_count: 0,
        total_current_evidence_count: 0,
        rejected_current_evidence_count: 0,
        minimum_required_evidence_count: 1,
        has_minimum_required_evidence: false,
        all_current_evidence_approved: false,
        no_rejected_current_evidence: true,
        overdue_recurring_instances_count: 0,
        overdue_recurring_count: 0,
        recurring_requirements_clear: true,
        is_ready_for_review: false,
        is_blocked: false,
        missing_evidence_count: 1,
        rejected_evidence_count: 0,
        ready_for_met: false,
        risk: {
          risk_level: "LOW",
          rejected_evidence_count: 0,
          overdue_recurring_count: 0,
          incomplete_evidence_count: 0,
          no_evidence_near_due: false,
          in_review_long_time: false,
        },
      },
    },
  }),
  useAIOutputs: () => ({ data: [], isLoading: false, error: null }),
}));

vi.mock("@/lib/hooks/use-mutations", () => ({
  useAddEvidence: () => ({ isPending: false, mutateAsync: vi.fn() }),
  useEditEvidence: () => ({ isPending: false, mutateAsync: vi.fn() }),
  useReviewEvidence: () => ({ isPending: false, mutateAsync: vi.fn() }),
  useAssignIndicator: () => ({ isPending: false, mutateAsync: vi.fn() }),
  useUpdateWorkingState: () => ({ isPending: false, mutateAsync: vi.fn() }),
  useStartIndicator: () => ({ isPending: false, mutateAsync: vi.fn() }),
  useSendForReview: () => ({ isPending: false, mutateAsync: vi.fn() }),
  useMarkMet: () => ({ isPending: false, mutateAsync: vi.fn() }),
  useReopen: () => ({ isPending: false, mutateAsync: vi.fn() }),
  useGenerateAI: () => ({ isPending: false, mutateAsync: vi.fn() }),
  useSubmitRecurring: () => ({ isPending: false, mutateAsync: vi.fn() }),
  useApproveRecurring: () => ({ isPending: false, mutateAsync: vi.fn() }),
  useAcceptAI: () => ({ isPending: false, mutateAsync: vi.fn() }),
}));

vi.mock("@/components/common/toaster", () => ({
  useToast: () => ({ pushToast: vi.fn() }),
}));

describe("IndicatorDetailScreen governance controls", () => {
  it("disables admin-only reopen and shows governance trail sections for non-admin users", async () => {
    authState.role = "OWNER";
    renderWithQueryClient(<IndicatorDetailScreen indicatorId={10} />);

    const user = userEvent.setup();
    expect(screen.getByText("Session orientation")).toBeInTheDocument();
    expect(screen.getByText("Current section: Readiness status")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Back to project" })).toHaveAttribute("href", "/projects/1");
    expect(screen.getByRole("link", { name: "Back to worklist" })).toHaveAttribute("href", "/projects/1/worklist");
    await user.click(screen.getByRole("button", { name: "Actions" }));
    expect(screen.getByText("Current section: Actions")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Reopen" })).toBeDisabled();

    await user.click(screen.getByRole("button", { name: "Governance / Override" }));
    expect(screen.getByText("Current section: Governance / Override")).toBeInTheDocument();
    expect(screen.getByText("Section 8 — Governance / Override")).toBeInTheDocument();
    expect(screen.getByText("Status transition history")).toBeInTheDocument();
    expect(screen.getByText("Recent audited actions")).toBeInTheDocument();
  });
});

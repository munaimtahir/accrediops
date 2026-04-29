import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

import { IndicatorDrawer } from "@/components/screens/indicator-drawer";
import { renderWithQueryClient } from "./test-utils";

const indicatorData = {
  id: 101,
  project: 1,
  indicator: {
    id: 11,
    framework: 1,
    area: 10,
    standard: 20,
    code: "IND-001",
    text: "Indicator text",
    required_evidence_description: "",
    evidence_type: "DOCUMENT",
    document_type: "POLICY",
    fulfillment_guidance: "Guidance",
    is_recurring: true,
    recurrence_frequency: "MONTHLY",
    recurrence_mode: "EITHER",
    minimum_required_evidence_count: 1,
    reusable_template_allowed: true,
    evidence_reuse_policy: "MANUAL_REVIEW",
    is_active: true,
    sort_order: 1,
  },
  current_status: "IN_PROGRESS",
  is_finalized: false,
  is_met: false,
  owner: { id: 1, username: "owner", first_name: "O", last_name: "W", role: "OWNER" },
  reviewer: null,
  approver: null,
  priority: "HIGH",
  due_date: null,
  notes: "",
  last_updated_by: 1,
  last_updated_at: "2026-01-01T00:00:00Z",
  evidence_items: [],
  recurring_requirement: {
    id: 1,
    frequency: "MONTHLY",
    mode: "EITHER",
    start_date: "2026-01-01",
    end_date: null,
    is_active: true,
    instructions: "",
    expected_title_template: "",
  },
  recurring_instances: [
    {
      id: 900,
      project_indicator_id: 101,
      project_id: 1,
      project_name: "Project",
      indicator_id: 11,
      indicator_code: "IND-001",
      indicator_text: "Indicator text",
      due_date: "2026-02-01",
      period_label: "Jan 2026",
      status: "PENDING",
      linked_evidence_item: null,
      linked_evidence_title: "",
      submitted_at: null,
      approved_at: null,
      notes: "",
    },
  ],
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
    can_reopen: true,
  },
  readiness_flags: {    approved_evidence_count: 0,
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
};

vi.mock("@/lib/hooks/use-auth", () => ({
  useAuthSession: () => ({ data: { authenticated: true, user: { role: "ADMIN" } } }),
}));

vi.mock("@/lib/hooks/use-indicator", () => ({
  useIndicator: () => ({ isLoading: false, error: null, data: indicatorData, refetch: vi.fn() }),
  useAIOutputs: () => ({ data: [] }),
}));

vi.mock("@/lib/hooks/use-evidence", () => ({
  useEvidence: () => ({ data: [], isLoading: false, error: null }),
}));

const mutateAsync = vi.fn().mockResolvedValue({});
vi.mock("@/lib/hooks/use-mutations", () => ({
  useAddEvidence: () => ({ isPending: false, mutateAsync }),
  useReviewEvidence: () => ({ isPending: false, mutateAsync }),
  useUpdateWorkingState: () => ({ isPending: false, mutateAsync }),
  useStartIndicator: () => ({ isPending: false, mutateAsync }),
  useSendForReview: () => ({ isPending: false, mutateAsync }),
  useMarkMet: () => ({ isPending: false, mutateAsync }),
  useReopen: () => ({ isPending: false, mutateAsync }),
  useSubmitRecurring: () => ({ isPending: false, mutateAsync }),
  useApproveRecurring: () => ({ isPending: false, mutateAsync }),
}));

vi.mock("@/components/common/toaster", () => ({
  useToast: () => ({ pushToast: vi.fn() }),
}));

describe("IndicatorDrawer", () => {
  it("renders sections and opens actions/governance-focused controls in drawer context", async () => {
    const user = userEvent.setup();
    renderWithQueryClient(<IndicatorDrawer indicatorId={101} open onClose={vi.fn()} />);

    expect(screen.getByText("IND-001 · Indicator workbench")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Summary" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Evidence" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Recurring" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Comments / Notes" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Review / Governance" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Actions" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Actions" }));
    expect(screen.getByRole("button", { name: "Start" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Send for Review" })).toBeEnabled();

    await user.click(screen.getByRole("button", { name: "Evidence" }));
    expect(screen.getByRole("button", { name: "Add evidence" })).toBeEnabled();
  });
});

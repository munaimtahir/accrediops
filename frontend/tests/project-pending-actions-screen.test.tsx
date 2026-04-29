import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { vi } from "vitest";

import { ProjectPendingActionsScreen } from "@/components/screens/project-pending-actions-screen";

const printMock = vi.fn();

vi.mock("@/lib/hooks/use-projects", () => ({
  useProject: () => ({
    isLoading: false,
    error: null,
    data: {
      id: 1,
      name: "Project Alpha",
      client_name: "Client A",
      accrediting_body_name: "Board",
      framework: 2,
      client_profile: null,
      status: "ACTIVE",
      start_date: "2026-01-01",
      target_date: "2026-12-31",
      notes: "",
      created_by: 1,
      created_at: "2026-01-01T00:00:00Z",
      updated_at: "2026-01-01T00:00:00Z",
      total_indicators: 8,
      met_indicators: 2,
      pending_indicators: 6,
      recurring_due_today: 1,
      overdue_recurring_items: 0,
    },
  }),
}));

vi.mock("@/lib/hooks/use-worklist", () => ({
  useWorklist: () => ({
    isLoading: false,
    error: null,
    data: {
      count: 3,
      results: [
        {
          project_indicator_id: 22,
          project_id: 1,
          project_name: "Project Alpha",
          area_id: 1,
          area_name: "Area One",
          standard_id: 2,
          standard_name: "Standard One",
          indicator_id: 9,
          indicator_code: "IND-001",
          indicator_text: "Workspace indicator statement",
          current_status: "IN_PROGRESS",
          is_met: false,
          priority: "HIGH",
          owner: null,
          due_date: null,
          notes: "Collect the revised SOP and confirm sign-off.",
          is_recurring: false,
          recurrence_frequency: "NONE",
          approved_evidence_count: 0,
          total_evidence_count: 1,
          pending_recurring_instances_count: 0,
          overdue_recurring_instances_count: 0,
          last_updated_at: "2026-01-01T00:00:00Z",
        },
        {
          project_indicator_id: 23,
          project_id: 1,
          project_name: "Project Alpha",
          area_id: 1,
          area_name: "Area One",
          standard_id: 2,
          standard_name: "Standard One",
          indicator_id: 10,
          indicator_code: "IND-002",
          indicator_text: "Completed indicator statement",
          current_status: "MET",
          is_met: true,
          priority: "LOW",
          owner: null,
          due_date: null,
          notes: "This should not be shown because the indicator is met.",
          is_recurring: false,
          recurrence_frequency: "NONE",
          approved_evidence_count: 1,
          total_evidence_count: 1,
          pending_recurring_instances_count: 0,
          overdue_recurring_instances_count: 0,
          last_updated_at: "2026-01-01T00:00:00Z",
        },
        {
          project_indicator_id: 24,
          project_id: 1,
          project_name: "Project Alpha",
          area_id: 1,
          area_name: "Area One",
          standard_id: 2,
          standard_name: "Standard One",
          indicator_id: 11,
          indicator_code: "IND-003",
          indicator_text: "Blank notes indicator statement",
          current_status: "NOT_STARTED",
          is_met: false,
          priority: "MEDIUM",
          owner: null,
          due_date: null,
          notes: "   ",
          is_recurring: false,
          recurrence_frequency: "NONE",
          approved_evidence_count: 0,
          total_evidence_count: 0,
          pending_recurring_instances_count: 0,
          overdue_recurring_instances_count: 0,
          last_updated_at: "2026-01-01T00:00:00Z",
        },
      ],
    },
  }),
}));

describe("ProjectPendingActionsScreen", () => {
  beforeEach(() => {
    printMock.mockReset();
    vi.stubGlobal("print", printMock);
  });

  it("shows only unfinished indicators with non-empty working notes and supports printing", async () => {
    const qc = new QueryClient();
    const user = userEvent.setup();

    render(
      <QueryClientProvider client={qc}>
        <ProjectPendingActionsScreen projectId={1} />
      </QueryClientProvider>,
    );

    expect(screen.getByText("Pending actions")).toBeInTheDocument();
    expect(screen.getByText("IND-001")).toBeInTheDocument();
    expect(screen.getByText("Workspace indicator statement")).toBeInTheDocument();
    expect(screen.getByText("Collect the revised SOP and confirm sign-off.")).toBeInTheDocument();
    expect(screen.queryByText("IND-002")).not.toBeInTheDocument();
    expect(screen.queryByText("IND-003")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Print actionable list" }));
    expect(printMock).toHaveBeenCalled();
  });
});

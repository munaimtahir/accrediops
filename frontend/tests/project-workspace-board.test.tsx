import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

import { ProjectWorkspaceBoard } from "@/components/screens/project-workspace-board";
import { renderWithQueryClient } from "./test-utils";

const areasData = [
  {
    area_id: 10,
    area_code: "AREA-A",
    area_name: "Area A",
    total_standards: 1,
    completed_standards: 0,
    high_risk_standards_count: 0,
    readiness_score: 55,
    progress_percent: 30,
  },
];

const standardsData = [
  {
    area_id: 10,
    area_code: "AREA-A",
    area_name: "Area A",
    standard_id: 20,
    standard_code: "STD-A1",
    standard_name: "Standard A1",
    total_indicators: 2,
    met_indicators: 1,
    blocked_count: 0,
    blocked_indicators: 0,
    in_review_count: 1,
    not_started_count: 0,
    overdue_count: 0,
    readiness_score: 70,
    progress_percent: 50,
  },
];

const worklistData = {
  count: 1,
  results: [
    {
      project_indicator_id: 101,
      project_id: 1,
      project_name: "Project",
      area_id: 10,
      area_name: "Area A",
      standard_id: 20,
      standard_name: "Standard A1",
      indicator_id: 301,
      indicator_code: "IND-001",
      indicator_text: "Indicator Text",
      current_status: "IN_PROGRESS",
      is_met: false,
      priority: "HIGH",
      owner: null,
      due_date: null,
      is_recurring: true,
      recurrence_frequency: "MONTHLY",
      approved_evidence_count: 1,
      total_evidence_count: 2,
      pending_recurring_instances_count: 1,
      overdue_recurring_instances_count: 0,
      last_updated_at: "2026-01-01T00:00:00Z",
    },
  ],
};

vi.mock("@/lib/hooks/use-progress", () => ({
  useProgress: (_projectId: number, kind: "areas" | "standards") => ({
    isLoading: false,
    error: null,
    data: kind === "areas" ? areasData : standardsData,
  }),
}));

vi.mock("@/lib/hooks/use-worklist", () => ({
  useWorklist: () => ({
    isLoading: false,
    error: null,
    data: worklistData,
  }),
}));

vi.mock("@/components/screens/indicator-drawer", () => ({
  IndicatorDrawer: ({ open }: { open: boolean }) =>
    open ? <div>Indicator drawer mock open</div> : <div>Indicator drawer mock closed</div>,
}));

describe("ProjectWorkspaceBoard", () => {
  it("renders area-standard-indicator hierarchy and opens drawer from indicator card", async () => {
    const user = userEvent.setup();
    renderWithQueryClient(<ProjectWorkspaceBoard projectId={1} />);

    expect(screen.getByText("Workspace flow")).toBeInTheDocument();
    expect(screen.getByText("Areas")).toBeInTheDocument();
    expect(screen.getByText("Area A")).toBeInTheDocument();
    expect(screen.getByText("Standard A1")).toBeInTheDocument();
    expect(screen.getByText("IND-001")).toBeInTheDocument();
    expect(screen.queryByText("Indicator drawer mock open")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /IND-001/i }));
    expect(screen.getByText("Indicator drawer mock open")).toBeInTheDocument();
  });
});

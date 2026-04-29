import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { vi } from "vitest";

import { ProjectOverviewScreen } from "@/components/screens/project-overview-screen";

const pushMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

vi.mock("@/lib/hooks/use-auth", () => ({
  useAuthSession: () => ({
    data: { authenticated: true, user: { role: "OWNER" } },
  }),
}));

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

vi.mock("@/lib/hooks/use-progress", () => ({
  useProgress: (_projectId: number, kind: "areas" | "standards") =>
    kind === "areas"
      ? ({
          data: [
            {
              area_id: 1,
              area_code: "A1",
              area_name: "Area One",
              total_standards: 1,
              completed_standards: 0,
              high_risk_standards_count: 0,
              readiness_score: 66,
              progress_percent: 45,
            },
          ],
          isLoading: false,
          error: null,
        })
      : ({
          data: [
            {
              area_id: 1,
              area_code: "A1",
              area_name: "Area One",
              standard_id: 2,
              standard_code: "S1",
              standard_name: "Standard One",
              total_indicators: 3,
              met_indicators: 1,
              blocked_count: 0,
              blocked_indicators: 0,
              in_review_count: 1,
              not_started_count: 1,
              overdue_count: 0,
              readiness_score: 70,
              progress_percent: 33,
            },
          ],
          isLoading: false,
          error: null,
        }),
}));

vi.mock("@/lib/hooks/use-worklist", () => ({
  useWorklist: () => ({
    isLoading: false,
    error: null,
    data: {
      count: 1,
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
          indicator_text: "Workspace indicator",
          current_status: "IN_PROGRESS",
          is_met: false,
          priority: "MEDIUM",
          owner: null,
          due_date: null,
          is_recurring: false,
          recurrence_frequency: "NONE",
          approved_evidence_count: 0,
          total_evidence_count: 1,
          pending_recurring_instances_count: 0,
          overdue_recurring_instances_count: 0,
          last_updated_at: "2026-01-01T00:00:00Z",
        },
      ],
    },
  }),
}));

vi.mock("@/components/screens/indicator-drawer", () => ({
  IndicatorDrawer: () => <div>Indicator drawer mock</div>,
}));

vi.mock("@/lib/hooks/use-mutations", () => ({
  useProjectExport: () => ({
    isPending: false,
    mutateAsync: vi.fn().mockResolvedValue({ message: "Export queued." }),
  }),
}));

vi.mock("@/lib/hooks/use-readiness", () => ({
  usePhysicalRetrievalExport: () => ({
    isFetching: false,
    data: null,
    refetch: vi.fn(),
  }),
}));

vi.mock("@/components/common/toaster", () => ({
  useToast: () => ({ pushToast: pushMock }),
}));

describe("ProjectOverviewScreen", () => {
  it("renders simplified project dashboard with workspace board", () => {
    const qc = new QueryClient();
    render(
      <QueryClientProvider client={qc}>
        <ProjectOverviewScreen projectId={1} />
      </QueryClientProvider>,
    );
    expect(screen.getByText("Project Alpha")).toBeInTheDocument();
    expect(screen.getByText("Priority Work")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Open Worklist" })).toBeInTheDocument();
    expect(screen.getByText("Workspace flow")).toBeInTheDocument();
    expect(screen.getByText("Area One")).toBeInTheDocument();
    expect(screen.getByText("Standard One")).toBeInTheDocument();
    expect(screen.getByText("IND-001")).toBeInTheDocument();
  });
});

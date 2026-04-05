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
  useProgress: () => ({ data: [], isLoading: false, error: null }),
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
  it("shows clone action disabled for non-admin and non-lead roles", () => {
    const qc = new QueryClient();
    render(
      <QueryClientProvider client={qc}>
        <ProjectOverviewScreen projectId={1} />
      </QueryClientProvider>,
    );
    expect(screen.getByText("Project Alpha")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Clone project" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Manage project" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Physical retrieval" })).toBeDisabled();
  });
});

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { vi } from "vitest";

import { ProjectsListScreen } from "@/components/screens/projects-list-screen";

const authState = {
  role: "ADMIN",
};

vi.mock("@/lib/hooks/use-projects", () => ({
  useProjects: () => ({
    isLoading: false,
    error: null,
    data: {
      results: [
        {
          id: 1,
          name: "Project Alpha",
          client_name: "Client A",
          accrediting_body_name: "Board",
          framework: 1,
          client_profile: null,
          status: "ACTIVE",
          start_date: "2026-01-01",
          target_date: "2026-12-31",
          notes: "",
          created_by: 1,
          created_at: "2026-01-01T00:00:00Z",
          updated_at: "2026-01-01T00:00:00Z",
          total_indicators: 10,
          met_indicators: 2,
          pending_indicators: 8,
          recurring_due_today: 1,
          overdue_recurring_items: 0,
        },
      ],
    },
  }),
}));

vi.mock("@/lib/hooks/use-auth", () => ({
  useAuthSession: () => ({
    data: { authenticated: true, user: { role: authState.role } },
  }),
}));

vi.mock("@/components/forms/project-management-form", () => ({
  ProjectManagementForm: () => <div>Project management form</div>,
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

describe("ProjectsListScreen", () => {
  beforeEach(() => {
    authState.role = "ADMIN";
  });

  it("renders project list", () => {
    const qc = new QueryClient();
    render(
      <QueryClientProvider client={qc}>
        <ProjectsListScreen />
      </QueryClientProvider>,
    );
    expect(screen.getByText("Project register")).toBeInTheDocument();
    expect(screen.getByText("Where to start")).toBeInTheDocument();
    expect(screen.getByText("Project Alpha")).toBeInTheDocument();
    expect(screen.getByText(/Framework:/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Open project" })).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "Create project" })[0]).toBeEnabled();
    expect(screen.getByRole("button", { name: "Manage project" })).toBeEnabled();
  });

  it("shows power table only when toggled", async () => {
    const user = userEvent.setup();
    const qc = new QueryClient();
    render(
      <QueryClientProvider client={qc}>
        <ProjectsListScreen />
      </QueryClientProvider>,
    );
    expect(screen.queryByText("Power view")).toBeInTheDocument();
    expect(screen.queryByRole("columnheader", { name: "Progress" })).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Show power table" }));
    expect(screen.getByRole("columnheader", { name: "Progress" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Hide power table" }));
    expect(screen.queryByRole("columnheader", { name: "Progress" })).not.toBeInTheDocument();
  });

  it("disables create project for non-admin and non-lead", () => {
    authState.role = "OWNER";
    const qc = new QueryClient();
    render(
      <QueryClientProvider client={qc}>
        <ProjectsListScreen />
      </QueryClientProvider>,
    );
    expect(screen.getAllByRole("button", { name: /Create project/i })[0]).toBeDisabled();
    expect(screen.getAllByRole("button", { name: /Manage project/i })[0]).toBeDisabled();
    expect(screen.getAllByText(/Only ADMIN or LEAD can create or manage projects/i).length).toBeGreaterThan(0);
  });
});

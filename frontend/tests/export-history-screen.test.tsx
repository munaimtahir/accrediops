import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

import { ProjectExportHistoryScreen } from "@/components/screens/project-export-history-screen";
import { renderWithQueryClient } from "./test-utils";

const mutateAsync = vi.fn();
const pushToast = vi.fn();
const authState = { role: "ADMIN" };

vi.mock("@/lib/hooks/use-readiness", () => ({
  useExportHistory: () => ({
    isLoading: false,
    error: null,
    data: [],
  }),
  useGenerateExport: () => ({
    isPending: false,
    mutateAsync,
  }),
  usePhysicalRetrievalExport: () => ({
    isFetching: false,
    data: null,
    refetch: vi.fn(),
  }),
  useProjectReadiness: () => ({
    isLoading: false,
    error: null,
    data: {
      overall_score: 100,
      percent_met: 100,
      recurring_compliance_score: 100,
      high_risk_indicators: [],
    },
  }),
}));

vi.mock("@/lib/hooks/use-auth", () => ({
  useAuthSession: () => ({
    isLoading: false,
    data: { authenticated: true, user: { role: authState.role } },
  }),
}));

vi.mock("@/components/common/toaster", () => ({
  useToast: () => ({ pushToast }),
}));

describe("ProjectExportHistoryScreen", () => {
  beforeEach(() => {
    mutateAsync.mockReset();
    pushToast.mockReset();
    authState.role = "ADMIN";
  });

  it("renders export history page", () => {
    renderWithQueryClient(<ProjectExportHistoryScreen projectId={1} />);
    expect(screen.getByText("Export history")).toBeInTheDocument();
    expect(screen.getByText("Where you are")).toBeInTheDocument();
    expect(screen.getByText("The project is ready for governed export generation.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Back to project" })).toHaveAttribute("href", "/projects/1");
    expect(screen.getByText(/Generate and track print-bundle, excel, and physical retrieval outputs/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Generate/i })).toBeInTheDocument();
  });

  it("creates export job through generate action", async () => {
    mutateAsync.mockResolvedValue({ id: 10, status: "READY", type: "print-bundle" });
    const user = userEvent.setup();
    renderWithQueryClient(<ProjectExportHistoryScreen projectId={1} />);

    await user.click(screen.getByRole("button", { name: "Generate print-bundle" }));

    expect(mutateAsync).toHaveBeenCalledWith({ type: "print-bundle", parameters: {} });
    expect(pushToast).toHaveBeenCalledWith("Export job created for print-bundle.", "success");
  });

  it("renders explicit restricted state for unauthorized roles", () => {
    authState.role = "OWNER";
    renderWithQueryClient(<ProjectExportHistoryScreen projectId={1} />);

    expect(screen.getByText("Export access restricted")).toBeInTheDocument();
    expect(screen.getByText("Only ADMIN or LEAD can access export generation and history.")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Generate/i })).not.toBeInTheDocument();
  });
});

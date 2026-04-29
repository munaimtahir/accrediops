import { screen } from "@testing-library/react";
import { vi } from "vitest";

import { AdminDashboardScreen } from "@/components/screens/admin-dashboard-screen";
import { renderWithQueryClient } from "./test-utils";

vi.mock("@/lib/hooks/use-admin", () => ({
  useAdminDashboard: () => ({
    isLoading: false,
    error: null,
    data: {
      total_projects: 5,
      active_projects: 4,
      overdue_indicators: 1,
      overdue_recurring_items: 2,
      indicators_under_review: 3,
      recent_audit_events: [],
    },
  }),
}));

describe("AdminDashboardScreen", () => {
  it("renders admin metrics", () => {
    renderWithQueryClient(<AdminDashboardScreen />);
    expect(screen.getByText("Admin dashboard")).toBeInTheDocument();
    expect(screen.getByText("Total projects")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Overrides" })).toBeInTheDocument();
  });
});

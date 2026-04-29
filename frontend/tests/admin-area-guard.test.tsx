import { screen } from "@testing-library/react";
import { vi } from "vitest";

import { AdminAreaGuard } from "@/components/providers/admin-area-guard";
import { renderWithQueryClient } from "./test-utils";

const authState = { role: "ADMIN" };

vi.mock("@/lib/hooks/use-auth", () => ({
  useAuthSession: () => ({
    isLoading: false,
    data: { authenticated: true, user: { role: authState.role } },
  }),
}));

describe("AdminAreaGuard", () => {
  it("renders children for allowed roles", () => {
    authState.role = "LEAD";
    renderWithQueryClient(
      <AdminAreaGuard>
        <div>Admin screen</div>
      </AdminAreaGuard>,
    );
    expect(screen.getByText("Admin screen")).toBeInTheDocument();
  });

  it("renders restricted state for unauthorized roles", () => {
    authState.role = "OWNER";
    renderWithQueryClient(
      <AdminAreaGuard>
        <div>Admin screen</div>
      </AdminAreaGuard>,
    );
    expect(screen.getByText("Admin access restricted")).toBeInTheDocument();
    expect(screen.getByText("Only ADMIN or LEAD can access the admin area.")).toBeInTheDocument();
  });
});

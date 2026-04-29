import { screen } from "@testing-library/react";
import { vi } from "vitest";

import { Sidebar } from "@/components/layout/sidebar";
import { renderWithQueryClient } from "./test-utils";

const authState = {
  role: "OWNER",
};

vi.mock("next/navigation", () => ({
  usePathname: () => "/projects",
  useParams: () => ({ projectId: "1" }),
}));

vi.mock("@/lib/hooks/use-auth", () => ({
  useAuthSession: () => ({
    data: { authenticated: true, user: { role: authState.role } },
  }),
}));

describe("Sidebar", () => {
  it("shows restricted admin and export items as disabled for non-admin/non-lead users", () => {
    authState.role = "OWNER";
    renderWithQueryClient(<Sidebar />);

    expect(screen.queryByText("Admin")).not.toBeInTheDocument();
    expect(screen.queryByText("Settings")).not.toBeInTheDocument();
  });

  it("shows admin and export links for admin users", () => {
    authState.role = "ADMIN";
    renderWithQueryClient(<Sidebar />);

    expect(screen.getByText("Admin")).toBeInTheDocument();
    expect(screen.getByText("Settings")).toBeInTheDocument();
    expect(screen.getByText("AI Classification")).toBeInTheDocument();
  });

  it("shows admin and export links for lead users", () => {
    authState.role = "LEAD";
    renderWithQueryClient(<Sidebar />);

    expect(screen.getByText("Admin")).toBeInTheDocument();
    expect(screen.getByText("Settings")).toBeInTheDocument();
    expect(screen.getByText("AI Classification")).toBeInTheDocument();
  });
});

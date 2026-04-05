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
  it("hides admin and export links for non-admin/non-lead users", () => {
    authState.role = "OWNER";
    renderWithQueryClient(<Sidebar />);

    expect(screen.queryByText("Admin Dashboard")).not.toBeInTheDocument();
    expect(screen.queryByText("Admin Overrides")).not.toBeInTheDocument();
    expect(screen.queryByText("Export History")).not.toBeInTheDocument();
  });

  it("shows admin and export links for admin users", () => {
    authState.role = "ADMIN";
    renderWithQueryClient(<Sidebar />);

    expect(screen.getByText("Admin Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Admin Overrides")).toBeInTheDocument();
    expect(screen.getByText("Export History")).toBeInTheDocument();
  });
});


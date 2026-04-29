import { screen } from "@testing-library/react";
import { vi } from "vitest";

import { AppShell } from "@/components/layout/app-shell";
import { renderWithQueryClient } from "./test-utils";

vi.mock("next/navigation", () => ({
  usePathname: () => "/projects",
  useParams: () => ({}),
  useRouter: () => ({ replace: vi.fn() }),
}));

vi.mock("@/lib/hooks/use-auth", () => ({
  useAuthSession: () => ({
    data: { authenticated: true, user: { role: "OWNER", first_name: "Test", last_name: "User", username: "tester" } },
  }),
  useLogout: () => ({
    isPending: false,
    mutateAsync: vi.fn(),
  }),
}));

vi.mock("@/lib/hooks/use-projects", () => ({
  useProject: () => ({ data: null }),
  useProjects: () => ({ data: { results: [] } }),
}));

describe("AppShell", () => {
  it("renders shell with child content", () => {
    renderWithQueryClient(
      <AppShell>
        <div>Child Content</div>
      </AppShell>,
    );
    expect(screen.getByText("AccrediOps")).toBeInTheDocument();
    expect(screen.getByText("Child Content")).toBeInTheDocument();
    expect(screen.getByText("Viewing as")).toBeInTheDocument();
    expect(screen.getByText("Test User • OWNER")).toBeInTheDocument();
  });
});

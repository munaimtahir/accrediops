import { screen } from "@testing-library/react";
import { vi } from "vitest";

import { AppShell } from "@/components/layout/app-shell";
import { renderWithQueryClient } from "./test-utils";

vi.mock("next/navigation", () => ({
  usePathname: () => "/projects",
  useParams: () => ({}),
  useRouter: () => ({ replace: vi.fn() }),
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
  });
});

import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { vi } from "vitest";

import { ProjectWorklistScreen } from "@/components/screens/project-worklist-screen";

vi.mock("next/navigation", () => ({
  usePathname: () => "/projects/1/worklist",
  useRouter: () => ({ replace: vi.fn() }),
  useSearchParams: () =>
    new URLSearchParams(""),
}));

vi.mock("@/lib/hooks/use-worklist", () => ({
  useWorklist: () => ({
    isLoading: false,
    error: null,
    data: { count: 1, results: [] },
  }),
}));

vi.mock("@/lib/hooks/use-progress", () => ({
  useProgress: () => ({ data: [], isLoading: false, error: null }),
}));

vi.mock("@/lib/hooks/use-users", () => ({
  useUsers: () => ({ data: [], isLoading: false, error: null }),
}));

describe("ProjectWorklistScreen", () => {
  it("renders filters and table", () => {
    const qc = new QueryClient();
    render(
      <QueryClientProvider client={qc}>
        <ProjectWorklistScreen projectId={1} />
      </QueryClientProvider>,
    );
    expect(screen.getByText("Project worklist")).toBeInTheDocument();
    expect(screen.getByText("No worklist rows match the current filter set")).toBeInTheDocument();
  });
});

import { screen } from "@testing-library/react";
import { vi } from "vitest";

import { ProjectReadinessScreen } from "@/components/screens/project-readiness-screen";
import { renderWithQueryClient } from "./test-utils";

const readinessState = {
  isLoading: false,
  error: null as Error | null,
  data: {
    overall_score: 72,
    percent_met: 40,
    percent_in_progress: 35,
    percent_blocked: 25,
    recurring_compliance_score: 80,
  },
};

vi.mock("@/lib/hooks/use-readiness", () => ({
  useProjectReadiness: () => readinessState,
}));

vi.mock("@/lib/hooks/use-auth", () => ({
  useAuthSession: () => ({
    isLoading: false,
    data: { authenticated: true, user: { role: "ADMIN" } },
  }),
}));

describe("ProjectReadinessScreen", () => {
  beforeEach(() => {
    readinessState.isLoading = false;
    readinessState.error = null;
  });

  it("renders orientation and readiness metrics", () => {
    renderWithQueryClient(<ProjectReadinessScreen projectId={4} />);

    expect(screen.getByText("Project readiness")).toBeInTheDocument();
    expect(screen.getByText("Where you are")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Back to project" })).toHaveAttribute("href", "/projects/4");
    expect(
      screen
        .getAllByRole("link", { name: "Open recurring queue" })
        .some((link) => link.getAttribute("href") === "/projects/4/recurring"),
    ).toBe(true);
    expect(screen.getByText("Overall score")).toBeInTheDocument();
    expect(screen.getByText("Recurring compliance")).toBeInTheDocument();
  });

  it("renders API failure cleanly", () => {
    readinessState.error = new Error("readiness unavailable");
    renderWithQueryClient(<ProjectReadinessScreen projectId={4} />);
    expect(screen.getByText("Request failed")).toBeInTheDocument();
    expect(screen.getByText("readiness unavailable")).toBeInTheDocument();
  });
});

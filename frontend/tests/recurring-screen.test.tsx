import { screen } from "@testing-library/react";
import { vi } from "vitest";

import { ProjectRecurringScreen } from "@/components/screens/project-recurring-screen";
import { renderWithQueryClient } from "./test-utils";

vi.mock("@/lib/hooks/use-recurring-queue", () => ({
  useRecurringQueue: () => ({
    isLoading: false,
    error: null,
    data: [],
    refetch: vi.fn(),
  }),
}));

vi.mock("@/lib/hooks/use-mutations", () => ({
  useSubmitRecurring: () => ({
    isPending: false,
    mutateAsync: vi.fn(),
  }),
}));

describe("ProjectRecurringScreen", () => {
  it("renders recurring queue", () => {
    renderWithQueryClient(<ProjectRecurringScreen projectId={1} />);
    expect(screen.getByText("Recurring evidence queue")).toBeInTheDocument();
    expect(screen.getByText("Due today")).toBeInTheDocument();
  });
});

import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

import { AdminOverridesScreen } from "@/components/screens/admin-overrides-screen";
import { renderWithQueryClient } from "./test-utils";

const reopenMutate = vi.fn();
const refetchOverrides = vi.fn();
const refetchWorklist = vi.fn();

vi.mock("@/lib/hooks/use-auth", () => ({
  useAuthSession: () => ({
    isLoading: false,
    error: null,
    data: { user: { role: "ADMIN" } },
  }),
}));

vi.mock("@/lib/hooks/use-admin", () => ({
  useOverrides: () => ({
    isLoading: false,
    error: null,
    data: [{ id: 1, actor_username: "admin", event_type: "project_indicator.status_changed", reason: "Legacy override", timestamp: "2026-04-17T00:00:00Z" }],
    refetch: refetchOverrides,
  }),
}));

vi.mock("@/lib/hooks/use-worklist", () => ({
  useWorklist: () => ({
    isLoading: false,
    error: null,
    data: {
      results: [
        {
          project_indicator_id: 44,
          project_name: "Client Alpha",
          indicator_code: "IND-044",
          indicator_text: "Completed governed indicator",
          current_status: "MET",
        },
      ],
    },
    refetch: refetchWorklist,
  }),
}));

vi.mock("@/lib/hooks/use-mutations", () => ({
  useReopen: () => ({
    isPending: false,
    mutateAsync: reopenMutate,
  }),
}));

vi.mock("@/components/common/toaster", () => ({
  useToast: () => ({ pushToast: vi.fn() }),
}));

describe("AdminOverridesScreen", () => {
  beforeEach(() => {
    reopenMutate.mockReset();
    refetchOverrides.mockReset();
    refetchWorklist.mockReset();
  });

  it("separates override control from history", () => {
    renderWithQueryClient(<AdminOverridesScreen />);

    expect(screen.getByText("Execute governed override")).toBeInTheDocument();
    expect(screen.getByText("Override audit history")).toBeInTheDocument();
    expect(screen.getByText("This table is history-only. It does not execute changes.")).toBeInTheDocument();
    expect(screen.getByText("Cannot proceed because")).toBeInTheDocument();
  });

  it("requires confirmation before executing override", async () => {
    const user = userEvent.setup();
    reopenMutate.mockResolvedValue({});
    renderWithQueryClient(<AdminOverridesScreen />);

    await user.selectOptions(screen.getByLabelText("Select indicator"), "44");
    await user.type(screen.getByLabelText("Reason"), "Evidence requires correction");
    await user.click(screen.getByRole("button", { name: "Confirm override" }));

    expect(screen.getByText("This action will change governed state. Continue?")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Execute override" }));

    expect(reopenMutate).toHaveBeenCalledWith({ reason: "Evidence requires correction" });
  });
});

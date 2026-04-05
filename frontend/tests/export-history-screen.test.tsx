import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

import { ProjectExportHistoryScreen } from "@/components/screens/project-export-history-screen";
import { renderWithQueryClient } from "./test-utils";

const mutateAsync = vi.fn();
const pushToast = vi.fn();

vi.mock("@/lib/hooks/use-readiness", () => ({
  useExportHistory: () => ({
    isLoading: false,
    error: null,
    data: [],
  }),
  useGenerateExport: () => ({
    isPending: false,
    mutateAsync,
  }),
  usePhysicalRetrievalExport: () => ({
    isFetching: false,
    data: null,
    refetch: vi.fn(),
  }),
}));

vi.mock("@/lib/hooks/use-auth", () => ({
  useAuthSession: () => ({
    data: { authenticated: true, user: { role: "ADMIN" } },
  }),
}));

vi.mock("@/components/common/toaster", () => ({
  useToast: () => ({ pushToast }),
}));

describe("ProjectExportHistoryScreen", () => {
  beforeEach(() => {
    mutateAsync.mockReset();
    pushToast.mockReset();
  });

  it("renders export history page", () => {
    renderWithQueryClient(<ProjectExportHistoryScreen projectId={1} />);
    expect(screen.getByText("Export history")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Generate/i })).toBeInTheDocument();
  });

  it("creates export job through generate action", async () => {
    mutateAsync.mockResolvedValue({ id: 10, status: "READY", type: "print-bundle" });
    const user = userEvent.setup();
    renderWithQueryClient(<ProjectExportHistoryScreen projectId={1} />);

    await user.click(screen.getByRole("button", { name: "Generate print-bundle" }));

    expect(mutateAsync).toHaveBeenCalledWith({ type: "print-bundle", parameters: {} });
    expect(pushToast).toHaveBeenCalledWith("Export job created for print-bundle.", "success");
  });
});

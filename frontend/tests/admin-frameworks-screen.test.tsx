import { screen } from "@testing-library/react";
import { vi } from "vitest";

import { AdminFrameworksScreen } from "@/components/screens/admin-frameworks-screen";
import { renderWithQueryClient } from "./test-utils";

const validateState = {
  data: null as null | {
    project_id: number;
    file_name: string;
    rows_processed: number;
    normalized_rows: number;
    missing_headers: string[];
    missing_required_values: number;
    duplicate_warnings: unknown[];
    errors: unknown[];
    log_id: number;
  },
};

vi.mock("@/lib/hooks/use-framework-management", () => ({
  useAdminFrameworks: () => ({
    isLoading: false,
    error: null,
    data: [{ id: 1, name: "PHC Framework", description: "Baseline" }],
  }),
  useFrameworkTemplate: () => ({
    isLoading: false,
    error: null,
    data: {
      version: "1.0",
      columns: ["area_code", "area_name"],
      required_columns: ["area_code"],
      sample_rows: [],
      template_csv: "area_code,area_name\nA1,Area 1\n",
    },
  }),
  useCreateFramework: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
  useFrameworkImportValidate: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
    data: validateState.data,
  }),
  useFrameworkImportCreate: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
  useFrameworkExport: () => ({
    isLoading: false,
    error: null,
    data: null,
  }),
}));

vi.mock("@/lib/hooks/use-projects", () => ({
  useProjects: () => ({
    isLoading: false,
    error: null,
    data: {
      count: 1,
      next: null,
      previous: null,
      results: [
        {
          id: 7,
          name: "Client Alpha Workspace",
          client_name: "Client Alpha",
        },
      ],
    },
  }),
}));

describe("AdminFrameworksScreen", () => {
  it("renders framework management and import actions", () => {
    renderWithQueryClient(<AdminFrameworksScreen />);
    expect(screen.getByText("Framework management")).toBeInTheDocument();
    expect(screen.getAllByText("Framework").length).toBeGreaterThan(0);
    expect(screen.queryByText("Project")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Download template" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Validate import" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Run import" })).toBeInTheDocument();
    expect(screen.getByText("Run validation before importing. Import remains disabled until validation passes.")).toBeInTheDocument();
    expect(screen.getAllByText("PHC Framework").length).toBeGreaterThan(0);
  });
});

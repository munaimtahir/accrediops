import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

import { AdminImportLogsScreen } from "@/components/screens/admin-import-logs-screen";
import { ApiClientError } from "@/lib/api/client";
import { renderWithQueryClient } from "./test-utils";

const mutateAsync = vi.fn();
const resetMock = vi.fn();

const logsState = {
  isLoading: false,
  error: null as Error | null,
  data: [] as Record<string, unknown>[],
};

const authState = {
  isLoading: false,
  data: { authenticated: true, user: { role: "ADMIN" } },
};

const frameworksState = {
  isLoading: false,
  error: null as Error | null,
  data: [{ id: 7, name: "Validation Framework" }],
};

const validateState = {
  isPending: false,
  data: null as null | {
    framework_id: number;
    file_name: string;
    rows_processed: number;
    normalized_rows: number;
    missing_headers: string[];
    missing_required_values: number;
    duplicate_warnings: unknown[];
    errors: Record<string, unknown>[];
    log_id: number;
  },
  error: null as null | Error,
};

vi.mock("@/lib/hooks/use-admin", () => ({
  useImportLogs: () => ({
    isLoading: logsState.isLoading,
    error: logsState.error,
    data: logsState.data,
  }),
  useAdminFrameworks: () => ({
    isLoading: frameworksState.isLoading,
    error: frameworksState.error,
    data: frameworksState.data,
  }),
  useFrameworkImportValidation: () => ({
    mutateAsync,
    isPending: validateState.isPending,
    data: validateState.data,
    error: validateState.error,
    reset: resetMock,
  }),
}));

vi.mock("@/lib/hooks/use-auth", () => ({
  useAuthSession: () => ({
    isLoading: authState.isLoading,
    data: authState.data,
  }),
}));

describe("AdminImportLogsScreen", () => {
  beforeEach(() => {
    mutateAsync.mockReset();
    resetMock.mockReset();
    logsState.isLoading = false;
    logsState.error = null;
    logsState.data = [];
    authState.isLoading = false;
    authState.data = { authenticated: true, user: { role: "ADMIN" } };
    frameworksState.isLoading = false;
    frameworksState.error = null;
    frameworksState.data = [{ id: 7, name: "Validation Framework" }];
    validateState.isPending = false;
    validateState.data = null;
    validateState.error = null;
  });

  it("does not crash when loading state resolves", () => {
    logsState.isLoading = true;
    const view = renderWithQueryClient(<AdminImportLogsScreen />);

    logsState.isLoading = false;
    expect(() => view.rerender(<AdminImportLogsScreen />)).not.toThrow();
    expect(screen.getByRole("heading", { name: /framework import logs/i })).toBeInTheDocument();
  });

  it("keeps validation disabled until framework and file are provided", async () => {
    const user = userEvent.setup();
    renderWithQueryClient(<AdminImportLogsScreen />);

    const validateButton = screen.getByRole("button", { name: "Validate sample" });
    expect(validateButton).toBeDisabled();
    expect(screen.getByText("Select a framework before validation.")).toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText("Framework"), "7");
    expect(validateButton).toBeDisabled();
    expect(screen.getByText("Select a CSV file before validation.")).toBeInTheDocument();

    const file = new File(
      ["area_code,area_name,standard_code,standard_name,indicator_code,indicator_text\nA1,Area,STD1,Standard,IND-1,Indicator"],
      "validate.csv",
      { type: "text/csv" },
    );
    await user.upload(screen.getByLabelText("Checklist CSV file"), file);
    expect(validateButton).toBeEnabled();
  });

  it("submits selected framework and file to validation hook", async () => {
    const user = userEvent.setup();
    mutateAsync.mockResolvedValue({
      framework_id: 7,
      file_name: "validate.csv",
      rows_processed: 1,
      normalized_rows: 1,
      missing_headers: [],
      missing_required_values: 0,
      duplicate_warnings: [],
      errors: [],
      log_id: 9,
    });

    renderWithQueryClient(<AdminImportLogsScreen />);
    await user.selectOptions(screen.getByLabelText("Framework"), "7");
    const file = new File(
      ["area_code,area_name,standard_code,standard_name,indicator_code,indicator_text\nA1,Area,STD1,Standard,IND-1,Indicator"],
      "validate.csv",
      { type: "text/csv" },
    );
    await user.upload(screen.getByLabelText("Checklist CSV file"), file);
    await user.click(screen.getByRole("button", { name: "Validate sample" }));

    expect(mutateAsync).toHaveBeenCalledWith({ framework_id: 7, file });
  });

  it("renders structured validation error details", () => {
    validateState.error = new ApiClientError("Checklist validation failed.", {
      code: "VALIDATION_ERROR",
      status: 400,
      details: { file: ["Checklist file is empty."] },
    });

    renderWithQueryClient(<AdminImportLogsScreen />);

    expect(screen.getByText("Validation failed")).toBeInTheDocument();
    expect(screen.getByText("Checklist validation failed.")).toBeInTheDocument();
    expect(screen.getByText(/Code: VALIDATION_ERROR/i)).toBeInTheDocument();
    expect(screen.getByText(/Status: 400/i)).toBeInTheDocument();
    expect(screen.getByText(/Checklist file is empty/)).toBeInTheDocument();
  });
});

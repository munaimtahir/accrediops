import { act, renderHook } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode } from "react";
import { vi } from "vitest";

import { useFrameworkImportValidation } from "@/lib/hooks/use-admin";

const { postFormMock } = vi.hoisted(() => ({
  postFormMock: vi.fn(),
}));

vi.mock("@/lib/api/client", () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    postForm: postFormMock,
    patch: vi.fn(),
  },
}));

function createWrapper() {
  const queryClient = new QueryClient();
  return ({ children }: { children: ReactNode }) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

describe("useFrameworkImportValidation", () => {
  it("submits multipart form-data with framework_id and file", async () => {
    postFormMock.mockResolvedValue({
      framework_id: 8,
      file_name: "validate.csv",
      rows_processed: 1,
      normalized_rows: 1,
      missing_headers: [],
      missing_required_values: 0,
      duplicate_warnings: [],
      errors: [],
      log_id: 101,
    });

    const { result } = renderHook(() => useFrameworkImportValidation(), { wrapper: createWrapper() });
    const file = new File(
      ["area_code,area_name,standard_code,standard_name,indicator_code,indicator_text\nA1,Area,STD1,Standard,IND-1,Indicator"],
      "validate.csv",
      { type: "text/csv" },
    );

    await act(async () => {
      await result.current.mutateAsync({
        framework_id: 8,
        file,
      });
    });

    expect(postFormMock).toHaveBeenCalledWith("/api/admin/import/validate-framework/", expect.any(FormData));
    const formData = postFormMock.mock.calls[0][1] as FormData;
    expect(formData.get("framework_id")).toBe("8");
    expect(formData.get("file")).toBe(file);
  });
});

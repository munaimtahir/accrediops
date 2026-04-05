import { screen } from "@testing-library/react";
import { vi } from "vitest";

import { ProjectInspectionScreen } from "@/components/screens/project-inspection-screen";
import { renderWithQueryClient } from "./test-utils";

vi.mock("@/lib/hooks/use-readiness", () => ({
  usePreInspectionCheck: () => ({
    isLoading: false,
    error: null,
    data: {
      missing_evidence: [],
      unapproved_items: [],
      overdue_recurring: [],
      high_risk_indicators: [],
    },
  }),
  useInspectionView: () => ({
    isLoading: false,
    error: null,
    data: {
      sections: [],
    },
  }),
}));

describe("ProjectInspectionScreen", () => {
  it("renders inspection mode", () => {
    renderWithQueryClient(<ProjectInspectionScreen projectId={1} />);
    expect(screen.getByText("Inspection mode")).toBeInTheDocument();
    expect(screen.getByText("Pre-inspection checks clear.")).toBeInTheDocument();
  });
});

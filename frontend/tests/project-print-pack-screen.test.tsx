import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

import { ProjectPrintPackScreen } from "@/components/screens/project-print-pack-screen";
import { renderWithQueryClient } from "./test-utils";

const printBundleState = {
  isPending: false,
  error: null as Error | null,
  data: null as
    | {
        sections?: Array<{
          name: string;
          standards: Array<{
            name: string;
            indicators: Array<{
              project_indicator_id: number;
              indicator_code: string;
              status: string;
              indicator_text: string;
              reusable_template_allowed: boolean;
              evidence_reuse_policy: string;
              evidence_list: Array<{
                id: number;
                order: number;
                title: string;
                approval_status: string;
                file_label: string;
                physical_location_type: string;
                location_details: string;
              }>;
            }>;
          }>;
        }>;
      }
    | null,
  mutate: vi.fn(),
};

vi.mock("@/lib/hooks/use-auth", () => ({
  useAuthSession: () => ({
    isLoading: false,
    data: { user: { role: "ADMIN" } },
  }),
}));

vi.mock("@/lib/hooks/use-mutations", () => ({
  useProjectExport: () => printBundleState,
}));

vi.mock("@/lib/hooks/use-readiness", () => ({
  useProjectReadiness: () => ({
    isLoading: false,
    error: null,
    data: {
      overall_score: 100,
      percent_met: 100,
      recurring_compliance_score: 100,
      high_risk_indicators: [],
    },
  }),
}));

describe("ProjectPrintPackScreen", () => {
  beforeEach(() => {
    printBundleState.isPending = false;
    printBundleState.error = null;
    printBundleState.data = null;
    printBundleState.mutate.mockReset();
  });

  it("shows empty state with context links before generation", () => {
    renderWithQueryClient(<ProjectPrintPackScreen projectId={9} />);

    expect(screen.getByText("Print pack preview")).toBeInTheDocument();
    expect(screen.getByText("Where you are")).toBeInTheDocument();
    expect(screen.getByText("The project is ready for governed print-pack output.")).toBeInTheDocument();
    expect(screen.getByText("No print pack generated")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Back to project" })).toHaveAttribute("href", "/projects/9");
    expect(screen.getByRole("link", { name: "Open export history" })).toHaveAttribute("href", "/projects/9/exports");
  });

  it("triggers generation from primary CTA", async () => {
    const user = userEvent.setup();
    renderWithQueryClient(<ProjectPrintPackScreen projectId={9} />);

    await user.click(screen.getByRole("button", { name: "Generate Print Pack" }));
    expect(printBundleState.mutate).toHaveBeenCalledTimes(1);
  });

  it("renders loading state while generation is pending", () => {
    printBundleState.isPending = true;
    const { container } = renderWithQueryClient(<ProjectPrintPackScreen projectId={9} />);

    expect(screen.getByRole("button", { name: "Working..." })).toBeDisabled();
    expect(container.querySelectorAll(".animate-pulse").length).toBeGreaterThanOrEqual(2);
    expect(screen.queryByText("No print pack generated")).not.toBeInTheDocument();
  });

  it("shows API failure cleanly", () => {
    printBundleState.error = new Error("print bundle failed");
    renderWithQueryClient(<ProjectPrintPackScreen projectId={9} />);

    expect(screen.getByText("Request failed")).toBeInTheDocument();
    expect(screen.getByText("print bundle failed")).toBeInTheDocument();
  });

  it("renders structured print-pack rows including physical evidence data", () => {
    printBundleState.data = {
      sections: [
        {
          name: "Area A",
          standards: [
            {
              name: "Standard A",
              indicators: [
                {
                  project_indicator_id: 101,
                  indicator_code: "IND-101",
                  status: "MET",
                  indicator_text: "Indicator text",
                  reusable_template_allowed: true,
                  evidence_reuse_policy: "MANUAL_REVIEW",
                  evidence_list: [
                    {
                      id: 1,
                      order: 1,
                      title: "Policy Binder",
                      approval_status: "APPROVED",
                      file_label: "Binder-12",
                      physical_location_type: "CABINET",
                      location_details: "Cabinet 3",
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    };

    renderWithQueryClient(<ProjectPrintPackScreen projectId={9} />);

    expect(screen.getByText("Area A")).toBeInTheDocument();
    expect(screen.getByText("Standard A")).toBeInTheDocument();
    expect(screen.getByText("IND-101 — MET")).toBeInTheDocument();
    expect(screen.getByText("Reuse: Allowed • Policy: MANUAL_REVIEW")).toBeInTheDocument();
    expect(screen.getByText("#1 Policy Binder [APPROVED] • Binder-12 • CABINET (Cabinet 3)")).toBeInTheDocument();
  });
});

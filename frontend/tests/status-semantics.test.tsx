import { screen } from "@testing-library/react";

import { GlobalStatusLegend } from "@/components/common/global-status-legend";
import { StatusSemanticBadge } from "@/components/common/status-semantic-badge";
import {
  getEvidenceApprovalTone,
  getProjectStatusTone,
  getRecurringStatusTone,
  getStatusSemanticVisual,
  globalStatusLegendOrder,
} from "@/utils/status-semantics";
import { renderWithQueryClient } from "./test-utils";

describe("status semantics helper layer", () => {
  it("maps project statuses to expected semantic tones", () => {
    expect(getProjectStatusTone("COMPLETED")).toBe("green");
    expect(getProjectStatusTone("ACTIVE")).toBe("yellow");
    expect(getProjectStatusTone("ARCHIVED")).toBe("grey");
    expect(getProjectStatusTone("DRAFT")).toBe("grey");
  });

  it("maps recurring statuses to expected semantic tones", () => {
    expect(getRecurringStatusTone("APPROVED")).toBe("green");
    expect(getRecurringStatusTone("SUBMITTED")).toBe("blue");
    expect(getRecurringStatusTone("MISSED")).toBe("red");
    expect(getRecurringStatusTone("PENDING")).toBe("yellow");
  });

  it("maps evidence approvals to expected semantic tones", () => {
    expect(getEvidenceApprovalTone("APPROVED")).toBe("green");
    expect(getEvidenceApprovalTone("REJECTED")).toBe("red");
    expect(getEvidenceApprovalTone("PENDING")).toBe("blue");
  });

  it("returns stable visual metadata for each tone", () => {
    expect(globalStatusLegendOrder).toEqual(["green", "yellow", "red", "blue", "grey"]);
    const green = getStatusSemanticVisual("green");
    const red = getStatusSemanticVisual("red");
    expect(green.label).toBe("Completed");
    expect(green.meaning).toContain("complete");
    expect(green.badgeClassName).toContain("emerald");
    expect(red.label).toBe("Not met");
    expect(red.swatchClassName).toContain("rose");
  });
});

describe("status semantics components", () => {
  it("renders badge label and meaning tooltip from tone", () => {
    renderWithQueryClient(<StatusSemanticBadge tone="blue" />);
    const badge = screen.getByText("Under review");
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveAttribute("title", "Pending reviewer/approver decision.");
  });

  it("renders global legend labels and detailed meaning when not compact", () => {
    renderWithQueryClient(<GlobalStatusLegend />);
    expect(screen.getByText("Global status legend")).toBeInTheDocument();
    expect(screen.getByText("Completed")).toBeInTheDocument();
    expect(screen.getByText("In progress")).toBeInTheDocument();
    expect(screen.getByText("Not met")).toBeInTheDocument();
    expect(screen.getByText("Under review")).toBeInTheDocument();
    expect(screen.getByText("N/A")).toBeInTheDocument();
    expect(screen.getByText("Blocked, failed, or needs remediation.")).toBeInTheDocument();
  });

  it("renders compact legend without long meaning copy", () => {
    renderWithQueryClient(<GlobalStatusLegend compact />);
    expect(screen.getByText("Global status legend")).toBeInTheDocument();
    expect(screen.queryByText("Blocked, failed, or needs remediation.")).not.toBeInTheDocument();
  });
});

import { screen } from "@testing-library/react";

import { WorkflowContextStrip } from "@/components/common/workflow-context-strip";
import { renderWithQueryClient } from "./test-utils";

describe("WorkflowContextStrip", () => {
  it("renders context, next step, role hint, and navigation actions", () => {
    renderWithQueryClient(
      <WorkflowContextStrip
        scope="Project 1 · Worklist"
        current="Reviewing indicators"
        nextStep="Open indicator and update evidence."
        roleHint="Some actions require ADMIN or LEAD."
        actions={[
          { label: "Back to project", href: "/projects/1" },
          { label: "Open recurring queue", href: "/projects/1/recurring" },
        ]}
      />,
    );

    expect(screen.getByText("Where you are")).toBeInTheDocument();
    expect(screen.getByText("Project 1 · Worklist")).toBeInTheDocument();
    expect(screen.getByText("Reviewing indicators", { exact: false })).toBeInTheDocument();
    expect(screen.getByText("Next Action:", { exact: false })).toBeInTheDocument();
    expect(screen.getByText("Open indicator and update evidence.", { exact: false })).toBeInTheDocument();
    expect(screen.getByText("Some actions require ADMIN or LEAD.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Back to project" })).toHaveAttribute("href", "/projects/1");
  });
});

import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

import { EvidenceForm } from "@/components/forms/evidence-form";
import { renderWithQueryClient } from "./test-utils";

describe("EvidenceForm", () => {
  it("submits with physical evidence fields", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue({});
    renderWithQueryClient(
      <EvidenceForm
        indicatorId={10}
        submitLabel="Add evidence"
        onSubmit={onSubmit}
      />,
    );
    await user.type(screen.getByLabelText(/Title/i), "Policy A");
    await user.type(screen.getByLabelText(/File label/i), "POL-77");
    await user.click(screen.getByRole("checkbox"));
    await user.click(screen.getByRole("button", { name: "Add evidence" }));
    expect(onSubmit).toHaveBeenCalled();
  });
});

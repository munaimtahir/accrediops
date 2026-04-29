import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

import { ClientProfileForm } from "@/components/forms/client-profile-form";
import { renderWithQueryClient } from "./test-utils";

const mutateSaveAsync = vi.fn();
const mutatePreviewAsync = vi.fn();
const pushToast = vi.fn();

vi.mock("@/lib/hooks/use-client-profiles", () => ({
  useSaveClientProfile: () => ({
    isPending: false,
    mutateAsync: mutateSaveAsync,
  }),
  useVariablesPreview: () => ({
    isPending: false,
    mutateAsync: mutatePreviewAsync,
  }),
}));

vi.mock("@/lib/hooks/use-users", () => ({
  useUsers: () => ({
    isLoading: false,
    error: null,
    data: [
      { id: 2, username: "owner_user", first_name: "Olive", last_name: "Owner", role: "OWNER" },
      { id: 3, username: "reviewer_user", first_name: "Riley", last_name: "Reviewer", role: "REVIEWER" },
    ],
  }),
}));

vi.mock("@/components/common/toaster", () => ({
  useToast: () => ({ pushToast }),
}));

describe("ClientProfileForm", () => {
  beforeEach(() => {
    mutateSaveAsync.mockReset();
    mutatePreviewAsync.mockReset();
    pushToast.mockReset();
  });

  it("saves linked user ids with the client profile", async () => {
    mutateSaveAsync.mockResolvedValue({ id: 10 });
    const user = userEvent.setup();

    renderWithQueryClient(<ClientProfileForm />);

    await user.type(screen.getByLabelText(/Organization name/i), "Acme Health");
    await user.click(screen.getByLabelText(/Olive Owner/i));
    await user.click(screen.getByLabelText(/Riley Reviewer/i));
    await user.click(screen.getByRole("button", { name: "Save client profile" }));

    expect(mutateSaveAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        organization_name: "Acme Health",
        linked_user_ids: [2, 3],
      }),
    );
  });
});

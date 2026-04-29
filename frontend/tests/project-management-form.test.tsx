import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

import { ProjectManagementForm } from "@/components/forms/project-management-form";
import { renderWithQueryClient } from "./test-utils";

const mutateUpdateAsync = vi.fn();
const mutateDeleteAsync = vi.fn();
const pushToast = vi.fn();
const routerPush = vi.fn();

vi.mock("@/lib/hooks/use-frameworks", () => ({
  useFrameworks: () => ({
    isLoading: false,
    error: null,
    data: [{ id: 1, name: "Hospital Accreditation", description: "Base framework" }],
  }),
}));

vi.mock("@/lib/hooks/use-client-profiles", () => ({
  useClientProfiles: () => ({
    isLoading: false,
    error: null,
    data: [
      {
        id: 5,
        organization_name: "Client Profile A",
        address: "",
        license_number: "",
        registration_number: "",
        contact_person: "",
        department_names: [],
        created_at: "",
        updated_at: "",
      },
    ],
  }),
}));

vi.mock("@/lib/hooks/use-mutations", () => ({
  useUpdateProject: () => ({
    isPending: false,
    mutateAsync: mutateUpdateAsync,
  }),
  useDeleteProject: () => ({
    isPending: false,
    mutateAsync: mutateDeleteAsync,
  }),
}));

vi.mock("@/components/common/toaster", () => ({
  useToast: () => ({ pushToast }),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: routerPush, replace: vi.fn() }),
}));

describe("ProjectManagementForm", () => {
  beforeEach(() => {
    mutateUpdateAsync.mockReset();
    mutateDeleteAsync.mockReset();
    pushToast.mockReset();
    routerPush.mockReset();
    vi.stubGlobal("confirm", vi.fn(() => true));
  });

  it("updates project details and client profile linkage", async () => {
    mutateUpdateAsync.mockResolvedValue({ id: 1 });
    const onSuccess = vi.fn();
    const user = userEvent.setup();

    renderWithQueryClient(
      <ProjectManagementForm
        project={{
          id: 1,
          name: "Project Alpha",
          client_name: "Client A",
          accrediting_body_name: "Board",
          framework: 1,
          client_profile: null,
          status: "ACTIVE",
          start_date: "2026-01-01",
          target_date: "2026-12-31",
          notes: "",
          created_by: 1,
          created_at: "2026-01-01T00:00:00Z",
          updated_at: "2026-01-01T00:00:00Z",
          total_indicators: 10,
          met_indicators: 2,
          pending_indicators: 8,
          recurring_due_today: 1,
          overdue_recurring_items: 0,
        }}
        onSuccess={onSuccess}
      />,
    );

    await user.clear(screen.getByLabelText(/Project name/i));
    await user.type(screen.getByLabelText(/Project name/i), "Project Alpha Updated");
    await user.selectOptions(screen.getByLabelText(/Client profile/i), "5");
    await user.click(screen.getByRole("button", { name: "Save project" }));

    expect(mutateUpdateAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Project Alpha Updated",
        client_profile: 5,
      }),
    );
    expect(onSuccess).toHaveBeenCalled();
  });

  it("deletes the project and redirects back to the register", async () => {
    mutateDeleteAsync.mockResolvedValue({ id: 1, deleted: true });
    const onDelete = vi.fn();
    const user = userEvent.setup();

    renderWithQueryClient(
      <ProjectManagementForm
        project={{
          id: 1,
          name: "Project Alpha",
          client_name: "Client A",
          accrediting_body_name: "Board",
          framework: 1,
          client_profile: null,
          status: "ACTIVE",
          start_date: "2026-01-01",
          target_date: "2026-12-31",
          notes: "",
          created_by: 1,
          created_at: "2026-01-01T00:00:00Z",
          updated_at: "2026-01-01T00:00:00Z",
          total_indicators: 10,
          met_indicators: 2,
          pending_indicators: 8,
          recurring_due_today: 1,
          overdue_recurring_items: 0,
        }}
        onDelete={onDelete}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Delete project" }));

    expect(mutateDeleteAsync).toHaveBeenCalled();
    expect(onDelete).toHaveBeenCalled();
    expect(routerPush).toHaveBeenCalledWith("/projects");
  });
});

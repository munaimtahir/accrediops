import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

import { CreateProjectForm } from "@/components/forms/create-project-form";
import { renderWithQueryClient } from "./test-utils";

const mutateCreateAsync = vi.fn();
const mutateInitAsync = vi.fn();
const pushToast = vi.fn();

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
  useCreateProject: () => ({
    isPending: false,
    mutateAsync: mutateCreateAsync,
  }),
  useInitializeProjectFromFramework: () => ({
    isPending: false,
    mutateAsync: mutateInitAsync,
  }),
}));

vi.mock("@/components/common/toaster", () => ({
  useToast: () => ({ pushToast }),
}));

describe("CreateProjectForm", () => {
  beforeEach(() => {
    mutateCreateAsync.mockReset();
    mutateInitAsync.mockReset();
    pushToast.mockReset();
  });

  it("creates and initializes project when checkbox is enabled", async () => {
    mutateCreateAsync.mockResolvedValue({ id: 42 });
    mutateInitAsync.mockResolvedValue({ created_project_indicators: 2 });
    const onSuccess = vi.fn();
    const user = userEvent.setup();

    renderWithQueryClient(<CreateProjectForm onSuccess={onSuccess} />);

    await user.type(screen.getByLabelText(/Project name/i), "Client Gamma Workspace");
    await user.type(screen.getByLabelText(/Client name/i), "Client Gamma");
    await user.type(screen.getByLabelText(/Accrediting body name/i), "National Board");
    await user.click(screen.getByRole("button", { name: "Create project" }));

    expect(mutateCreateAsync).toHaveBeenCalled();
    expect(mutateInitAsync).toHaveBeenCalledWith({
      projectId: 42,
      payload: { create_initial_instances: true },
    });
    expect(onSuccess).toHaveBeenCalledWith(42);
  });

  it("creates draft only when initialize is unchecked", async () => {
    mutateCreateAsync.mockResolvedValue({ id: 99 });
    mutateInitAsync.mockResolvedValue({ created_project_indicators: 0 });
    const onSuccess = vi.fn();
    const user = userEvent.setup();

    renderWithQueryClient(<CreateProjectForm onSuccess={onSuccess} />);

    await user.type(screen.getByLabelText(/Project name/i), "Draft Workspace");
    await user.type(screen.getByLabelText(/Client name/i), "Client Draft");
    await user.type(screen.getByLabelText(/Accrediting body name/i), "National Board");
    await user.selectOptions(screen.getByLabelText(/Client profile/i), "5");
    await user.click(screen.getByRole("checkbox"));
    await user.click(screen.getByRole("button", { name: "Create project" }));

    expect(mutateCreateAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        client_profile: 5,
      }),
    );
    expect(mutateInitAsync).not.toHaveBeenCalled();
    expect(onSuccess).toHaveBeenCalledWith(99);
  });
});

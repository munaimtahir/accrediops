"use client";

import { FormEvent, useState } from "react";

import { ErrorPanel } from "@/components/common/error-panel";
import { LoadingSkeleton } from "@/components/common/loading-skeleton";
import { Modal } from "@/components/common/modal";
import { SettingsPageHeader } from "@/components/common/settings-page-header";
import { useToast } from "@/components/common/toaster";
import { WorkbenchTable } from "@/components/common/workbench-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { getSafeErrorMessage } from "@/lib/api/client";
import { useAdminUsers, useCreateAdminUser, useResetAdminUserPassword, useUpdateAdminUser } from "@/lib/hooks/use-admin";
import { useAuthSession } from "@/lib/hooks/use-auth";

const roles = ["ADMIN", "LEAD", "OWNER", "REVIEWER", "APPROVER"] as const;

function UserRoleCell({ row }: { row: Record<string, unknown> }) {
  const updateUser = useUpdateAdminUser(Number(row.id));
  return (
    <Select
      value={String(row.role ?? "OWNER")}
      onChange={(event) => updateUser.mutate({ role: event.target.value })}
      disabled={updateUser.isPending}
    >
      {roles.map((role) => (
        <option key={role} value={role}>
          {role}
        </option>
      ))}
    </Select>
  );
}

function UserActiveCell({ row }: { row: Record<string, unknown> }) {
  const updateUser = useUpdateAdminUser(Number(row.id));
  return (
    <Select
      value={String(row.is_active ? "true" : "false")}
      onChange={(event) => updateUser.mutate({ is_active: event.target.value === "true" })}
      disabled={updateUser.isPending}
    >
      <option value="true">Active</option>
      <option value="false">Inactive</option>
    </Select>
  );
}

function CreateUserModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { pushToast } = useToast();
  const createAdminUser = useCreateAdminUser();
  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("OWNER");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      await createAdminUser.mutateAsync({
        username,
        first_name: firstName,
        last_name: lastName,
        email,
        password,
        role,
        is_active: true,
      });
      pushToast("User created successfully.", "success");
      onClose();
    } catch (error) {
      pushToast(getSafeErrorMessage(error), "error");
    }
  }

  return (
    <Modal open={open} title="Create user" description="Add a new user to the system." onClose={onClose}>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="grid gap-3 md:grid-cols-2">
          <label className="space-y-1 text-sm">
            <span className="font-medium text-slate-700">Username</span>
            <Input value={username} onChange={(e) => setUsername(e.target.value)} required />
          </label>
          <label className="space-y-1 text-sm">
            <span className="font-medium text-slate-700">Email</span>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </label>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <label className="space-y-1 text-sm">
            <span className="font-medium text-slate-700">First name</span>
            <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
          </label>
          <label className="space-y-1 text-sm">
            <span className="font-medium text-slate-700">Last name</span>
            <Input value={lastName} onChange={(e) => setLastName(e.target.value)} required />
          </label>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <label className="space-y-1 text-sm">
            <span className="font-medium text-slate-700">Role</span>
            <Select value={role} onChange={(e) => setRole(e.target.value)}>
              {roles.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </Select>
          </label>
          <label className="space-y-1 text-sm">
            <span className="font-medium text-slate-700">Initial password</span>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </label>
        </div>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={createAdminUser.isPending}>
            Create user
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function ResetPasswordModal({ userId, open, onClose }: { userId: number; open: boolean; onClose: () => void }) {
  const { pushToast } = useToast();
  const resetPassword = useResetAdminUserPassword(userId);
  const [password, setPassword] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      await resetPassword.mutateAsync({ password });
      pushToast("Password reset successfully.", "success");
      onClose();
    } catch (error) {
      pushToast(getSafeErrorMessage(error), "error");
    }
  }

  return (
    <Modal open={open} title="Reset password" description="Set a new password for this user." onClose={onClose}>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <label className="space-y-1 text-sm">
          <span className="font-medium text-slate-700">New password</span>
          <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </label>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={resetPassword.isPending}>
            Reset password
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export function AdminUsersScreen() {
  const authQuery = useAuthSession();
  const query = useAdminUsers();
  const [showCreate, setShowCreate] = useState(false);
  const [resetUserId, setResetUserId] = useState<number | null>(null);

  if (query.isLoading || authQuery.isLoading) return <LoadingSkeleton className="h-40 w-full" />;
  if (query.error) return <ErrorPanel message={query.error.message} />;
  
  const rows = query.data ?? [];
  const isAdmin = authQuery.data?.user?.role === "ADMIN";

  return (
    <div className="space-y-6">
      <SettingsPageHeader
        title="Users and roles"
        description="Manage user role assignments and activation state. Role changes immediately affect UI and API permissions."
        actions={
          isAdmin && (
            <Button onClick={() => setShowCreate(true)}>Create user</Button>
          )
        }
      />
      <WorkbenchTable<Record<string, unknown>>
        columns={[
          { key: "username", header: "Username", render: (row) => String(row.username ?? "") },
          { key: "name", header: "Name", render: (row) => `${row.first_name ?? ""} ${row.last_name ?? ""}`.trim() },
          { key: "department", header: "Department", render: (row) => String(row.department_name ?? "") },
          { key: "role", header: "Role", render: (row) => <UserRoleCell row={row} /> },
          { key: "active", header: "Status", render: (row) => <UserActiveCell row={row} /> },
          { 
            key: "actions", 
            header: "", 
            render: (row) => (
              isAdmin && (
                <Button size="sm" variant="ghost" onClick={() => setResetUserId(Number(row.id))}>
                  Reset password
                </Button>
              )
            ) 
          },
        ]}
        rows={rows}
        rowKey={(row) => String(row.id)}
      />

      {showCreate && <CreateUserModal open={showCreate} onClose={() => setShowCreate(false)} />}
      {resetUserId !== null && (
        <ResetPasswordModal userId={resetUserId} open={true} onClose={() => setResetUserId(null)} />
      )}
    </div>
  );
}

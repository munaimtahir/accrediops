"use client";

import { ErrorPanel } from "@/components/common/error-panel";
import { LoadingSkeleton } from "@/components/common/loading-skeleton";
import { PageHeader } from "@/components/common/page-header";
import { WorkbenchTable } from "@/components/common/workbench-table";
import { Select } from "@/components/ui/select";
import { useAdminUsers, useUpdateAdminUser } from "@/lib/hooks/use-admin";

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

export function AdminUsersScreen() {
  const query = useAdminUsers();
  if (query.isLoading) return <LoadingSkeleton className="h-40 w-full" />;
  if (query.error) return <ErrorPanel message={query.error.message} />;
  const rows = query.data ?? [];
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Admin" title="Users and roles" />
      <WorkbenchTable<Record<string, unknown>>
        columns={[
          { key: "username", header: "Username", render: (row) => String(row.username ?? "") },
          { key: "name", header: "Name", render: (row) => `${row.first_name ?? ""} ${row.last_name ?? ""}`.trim() },
          { key: "department", header: "Department", render: (row) => String(row.department_name ?? "") },
          { key: "role", header: "Role", render: (row) => <UserRoleCell row={row} /> },
          { key: "active", header: "Status", render: (row) => <UserActiveCell row={row} /> },
        ]}
        rows={rows}
        rowKey={(row) => String(row.id)}
      />
    </div>
  );
}

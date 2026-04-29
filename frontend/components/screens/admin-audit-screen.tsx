"use client";

import { useState } from "react";

import { ErrorPanel } from "@/components/common/error-panel";
import { LoadingSkeleton } from "@/components/common/loading-skeleton";
import { SettingsPageHeader } from "@/components/common/settings-page-header";
import { WorkbenchTable } from "@/components/common/workbench-table";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useAuditLogs } from "@/lib/hooks/use-admin";
import { useUsers } from "@/lib/hooks/use-users";

export function AdminAuditScreen() {
  const [user, setUser] = useState("");
  const [eventType, setEventType] = useState("");
  const [objectType, setObjectType] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const users = useUsers({});
  const query = useAuditLogs({
    user: user || undefined,
    event_type: eventType || undefined,
    object_type: objectType || undefined,
    start: start ? new Date(start).toISOString() : undefined,
    end: end ? new Date(end).toISOString() : undefined,
  });
  if (query.isLoading) return <LoadingSkeleton className="h-40 w-full" />;
  if (query.error) return <ErrorPanel message={query.error.message} />;
  const rows = query.data ?? [];
  const userOptions = users.data ?? [];
  return (
    <div className="space-y-6">
      <SettingsPageHeader
        title="Audit log viewer"
        description="Filter governance events by actor, event type, object type, and time window."
      />
      <div className="grid gap-3 md:grid-cols-5">
        <Select value={user} onChange={(event) => setUser(event.target.value)}>
          <option value="">All users</option>
          {userOptions.map((item) => (
            <option key={item.id} value={item.id}>
              {item.username}
            </option>
          ))}
        </Select>
        <Input placeholder="event_type" value={eventType} onChange={(event) => setEventType(event.target.value)} />
        <Input placeholder="object_type" value={objectType} onChange={(event) => setObjectType(event.target.value)} />
        <Input type="datetime-local" value={start} onChange={(event) => setStart(event.target.value)} />
        <Input type="datetime-local" value={end} onChange={(event) => setEnd(event.target.value)} />
      </div>
      <WorkbenchTable<Record<string, unknown>>
        columns={[
          { key: "actor", header: "Actor", render: (row) => String(row.actor_username ?? "System") },
          { key: "event", header: "Event", render: (row) => String(row.event_type ?? "") },
          { key: "object", header: "Object", render: (row) => `${row.object_type}:${row.object_id}` },
          { key: "before", header: "Before", render: (row) => <pre className="text-xs">{JSON.stringify(row.before_json, null, 2)}</pre> },
          { key: "after", header: "After", render: (row) => <pre className="text-xs">{JSON.stringify(row.after_json, null, 2)}</pre> },
          { key: "reason", header: "Reason", render: (row) => String(row.reason ?? "") },
          { key: "timestamp", header: "Timestamp", render: (row) => String(row.timestamp ?? "") },
        ]}
        rows={rows}
        rowKey={(row) => String(row.id)}
      />
    </div>
  );
}

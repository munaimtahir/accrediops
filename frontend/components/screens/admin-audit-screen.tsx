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

function AuditChanges({
  before,
  after,
}: {
  before: Record<string, unknown> | null;
  after: Record<string, unknown> | null;
}) {
  const [expanded, setExpanded] = useState(false);

  // Compute diff
  const changes: Record<string, { from: unknown; to: unknown }> = {};
  if (before && after) {
    for (const key of Array.from(new Set([...Object.keys(before), ...Object.keys(after)]))) {
      const b = before[key];
      const a = after[key];
      if (JSON.stringify(b) !== JSON.stringify(a)) {
        changes[key] = { from: b, to: a };
      }
    }
  } else if (after && !before) {
    changes["CREATED"] = { from: null, to: "New Object" };
  } else if (before && !after) {
    changes["DELETED"] = { from: "Object", to: null };
  }

  const changeKeys = Object.keys(changes);

  return (
    <div className="flex flex-col gap-2 max-w-sm">
      {changeKeys.length > 0 ? (
        <ul className="text-xs space-y-1">
          {changeKeys.slice(0, 3).map((key) => (
            <li key={key} className="break-all">
              <span className="font-semibold text-slate-700">{key}</span>:{" "}
              <span className="line-through text-slate-400">{String(changes[key].from)}</span> &rarr;{" "}
              <span className="font-medium text-slate-900">{String(changes[key].to)}</span>
            </li>
          ))}
          {changeKeys.length > 3 && <li className="text-slate-500 italic">... and {changeKeys.length - 3} more</li>}
        </ul>
      ) : (
        <span className="text-xs italic text-slate-500">No data changes</span>
      )}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="text-left text-xs font-semibold text-indigo-600 hover:text-indigo-800"
      >
        {expanded ? "Hide raw JSON" : "Show raw JSON"}
      </button>
      {expanded && (
        <div className="mt-2 grid gap-2 md:grid-cols-2">
          <div className="bg-slate-50 p-2 rounded border border-slate-200">
            <p className="text-[10px] font-semibold uppercase text-slate-500 mb-1">Before</p>
            <pre className="text-[10px] overflow-auto max-h-48 whitespace-pre-wrap">{JSON.stringify(before, null, 2)}</pre>
          </div>
          <div className="bg-slate-50 p-2 rounded border border-slate-200">
            <p className="text-[10px] font-semibold uppercase text-slate-500 mb-1">After</p>
            <pre className="text-[10px] overflow-auto max-h-48 whitespace-pre-wrap">{JSON.stringify(after, null, 2)}</pre>
          </div>
        </div>
      )}
    </div>
  );
}

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
      {query.isLoading ? (
        <LoadingSkeleton className="h-40 w-full" />
      ) : (
        <WorkbenchTable<Record<string, unknown>>
          columns={[
            { key: "actor", header: "Actor", render: (row) => String(row.actor_username ?? "System") },
            { key: "event", header: "Event", render: (row) => String(row.event_type ?? "") },
            { key: "object", header: "Object", render: (row) => `${row.object_type}:${row.object_id}` },
            {
              key: "changes",
              header: "Changes",
              render: (row) => (
                <AuditChanges
                  before={row.before_json as Record<string, unknown> | null}
                  after={row.after_json as Record<string, unknown> | null}
                />
              ),
            },
            { key: "reason", header: "Reason", render: (row) => String(row.reason ?? "") },
            { key: "timestamp", header: "Timestamp", render: (row) => String(row.timestamp ?? "") },
          ]}
          rows={rows}
          rowKey={(row) => String(row.id)}
        />
      )}
    </div>
  );
}

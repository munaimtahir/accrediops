"use client";

import { FormEvent, useState } from "react";

import { ErrorPanel } from "@/components/common/error-panel";
import { LoadingSkeleton } from "@/components/common/loading-skeleton";
import { PageHeader } from "@/components/common/page-header";
import { WorkbenchTable } from "@/components/common/workbench-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMasterValues, useSaveMasterValue } from "@/lib/hooks/use-admin";

export function AdminMastersScreen({ masterKey, title }: { masterKey: string; title: string }) {
  const query = useMasterValues(masterKey);
  const createMutation = useSaveMasterValue(masterKey);
  const [code, setCode] = useState("");
  const [label, setLabel] = useState("");

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await createMutation.mutateAsync({ code, label, is_active: true, sort_order: 0 });
    setCode("");
    setLabel("");
  }

  if (query.isLoading) return <LoadingSkeleton className="h-32 w-full" />;
  if (query.error) return <ErrorPanel message={query.error.message} />;
  const rows = query.data ?? [];
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Admin Masters" title={title} />
      <form className="grid gap-3 md:grid-cols-4" onSubmit={handleCreate}>
        <Input placeholder="Code" value={code} onChange={(e) => setCode(e.target.value)} required />
        <Input placeholder="Label" value={label} onChange={(e) => setLabel(e.target.value)} required />
        <Button type="submit" loading={createMutation.isPending}>
          Add
        </Button>
      </form>
      <WorkbenchTable<Record<string, unknown>>
        columns={[
          { key: "code", header: "Code", render: (row) => String(row.code ?? "") },
          { key: "label", header: "Label", render: (row) => String(row.label ?? "") },
          { key: "active", header: "Active", render: (row) => (row.is_active ? "Yes" : "No") },
          { key: "order", header: "Order", render: (row) => String(row.sort_order ?? 0) },
        ]}
        rows={rows}
        rowKey={(row) => String(row.id)}
      />
    </div>
  );
}

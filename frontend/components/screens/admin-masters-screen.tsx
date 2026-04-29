"use client";

import { FormEvent, useState } from "react";

import { ErrorPanel } from "@/components/common/error-panel";
import { LoadingSkeleton } from "@/components/common/loading-skeleton";
import { Modal } from "@/components/common/modal";
import { PageHeader } from "@/components/common/page-header";
import { WorkbenchTable } from "@/components/common/workbench-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/common/toaster";
import { getSafeErrorMessage } from "@/lib/api/client";
import { useMasterValues, useSaveMasterValue } from "@/lib/hooks/use-admin";

function EditMasterForm({
  item,
  masterKey,
  onClose,
}: {
  item: Record<string, unknown>;
  masterKey: string;
  onClose: () => void;
}) {
  const { pushToast } = useToast();
  const [label, setLabel] = useState(String(item.label ?? ""));
  const [sortOrder, setSortOrder] = useState(Number(item.sort_order ?? 0));
  const mutation = useSaveMasterValue(masterKey, Number(item.id));

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      await mutation.mutateAsync({
        label,
        sort_order: sortOrder,
      });
      pushToast("Master value saved.", "success");
      onClose();
    } catch (error) {
      pushToast(getSafeErrorMessage(error), "error");
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <label htmlFor={`edit-master-label-${String(item.id)}`} className="block text-sm font-medium text-slate-700">
        Label
        <Input
          id={`edit-master-label-${String(item.id)}`}
          placeholder="Label"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          required
        />
      </label>
      <label htmlFor={`edit-master-sort-${String(item.id)}`} className="block text-sm font-medium text-slate-700">
        Sort Order
        <Input
          id={`edit-master-sort-${String(item.id)}`}
          placeholder="Sort order"
          value={sortOrder}
          onChange={(e) => setSortOrder(Number(e.target.value))}
          type="number"
        />
      </label>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" loading={mutation.isPending}>
          Save
        </Button>
      </div>
    </form>
  );
}

export function AdminMastersScreen({ masterKey, title }: { masterKey: string; title: string }) {
  const query = useMasterValues(masterKey);
  const createMutation = useSaveMasterValue(masterKey);
  const [code, setCode] = useState("");
  const [label, setLabel] = useState("");
  const [editingItem, setEditingItem] = useState<Record<string, unknown> | null>(null);

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
      <PageHeader
        eyebrow="Admin Masters"
        title={title}
        description="Maintain controlled vocabulary used by governed workflows."
      />
      <form className="grid gap-3 md:grid-cols-4" onSubmit={handleCreate}>
        <label htmlFor={`master-code-${masterKey}`} className="space-y-2 text-sm">
          <span className="font-medium text-slate-700">Code</span>
          <Input
            id={`master-code-${masterKey}`}
            placeholder="Code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
          />
        </label>
        <label htmlFor={`master-label-${masterKey}`} className="space-y-2 text-sm">
          <span className="font-medium text-slate-700">Label</span>
          <Input
            id={`master-label-${masterKey}`}
            placeholder="Label"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            required
          />
        </label>
        <div className="flex items-end">
          <Button type="submit" loading={createMutation.isPending}>
            Add master value
          </Button>
        </div>
      </form>
      <WorkbenchTable<Record<string, unknown>>
        columns={[
          { key: "code", header: "Code", render: (row) => String(row.code ?? "") },
          { key: "label", header: "Label", render: (row) => String(row.label ?? "") },
          { key: "active", header: "Active", render: (row) => (row.is_active ? "Yes" : "No") },
          { key: "order", header: "Order", render: (row) => String(row.sort_order ?? 0) },
          {
            key: "action",
            header: "Action",
            render: (row) => (
              <Button variant="secondary" size="sm" onClick={() => setEditingItem(row)}>
                Edit
              </Button>
            ),
          },
        ]}
        rows={rows}
        rowKey={(row) => String(row.id)}
      />
      {editingItem && (
        <Modal
          open={Boolean(editingItem)}
          title="Edit Master Value"
          description="Update the details of this master value."
          onClose={() => setEditingItem(null)}
        >
          <EditMasterForm
            item={editingItem}
            masterKey={masterKey}
            onClose={() => setEditingItem(null)}
          />
        </Modal>
      )}
    </div>
  );
}

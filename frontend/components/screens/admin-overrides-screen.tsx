"use client";

import { useMemo, useState } from "react";

import { ErrorPanel } from "@/components/common/error-panel";
import { LoadingSkeleton } from "@/components/common/loading-skeleton";
import { NextActionBanner } from "@/components/common/next-action-banner";
import { SettingsPageHeader } from "@/components/common/settings-page-header";
import { WorkbenchTable } from "@/components/common/workbench-table";
import { useToast } from "@/components/common/toaster";
import { Modal } from "@/components/common/modal";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { getSafeErrorMessage } from "@/lib/api/client";
import { canExecuteOverrides, getRestrictionMessage } from "@/lib/authz";
import { useAuthSession } from "@/lib/hooks/use-auth";
import { useOverrides } from "@/lib/hooks/use-admin";
import { useReopen } from "@/lib/hooks/use-mutations";
import { useWorklist } from "@/lib/hooks/use-worklist";

type OverrideType = "REOPEN_TO_IN_PROGRESS";

export function AdminOverridesScreen() {
  const { pushToast } = useToast();
  const authQuery = useAuthSession();
  const historyQuery = useOverrides();
  const metIndicatorsQuery = useWorklist({ status: "MET", page_size: "all" });
  const [selectedIndicatorId, setSelectedIndicatorId] = useState("");
  const [overrideType, setOverrideType] = useState<OverrideType>("REOPEN_TO_IN_PROGRESS");
  const [reason, setReason] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const reopen = useReopen(Number(selectedIndicatorId || 0));
  const canRunOverrides = canExecuteOverrides(authQuery.data?.user);

  const indicatorOptions = useMemo(() => metIndicatorsQuery.data?.results ?? [], [metIndicatorsQuery.data?.results]);
  const indicatorMap = useMemo(() => new Map(indicatorOptions.map(row => [row.project_indicator_id, row])), [indicatorOptions]);
  const selectedIndicator = indicatorMap.get(Number(selectedIndicatorId));
  const executionBlockers = [
    !canRunOverrides ? getRestrictionMessage("overrideExecution") : "",
    !selectedIndicatorId ? "No indicator selected." : "",
    !reason.trim() ? "Override reason is required." : "",
  ].filter(Boolean);
  const canSubmitOverride = executionBlockers.length === 0;

  if (authQuery.isLoading || historyQuery.isLoading || metIndicatorsQuery.isLoading) {
    return <LoadingSkeleton className="h-40 w-full" />;
  }
  if (historyQuery.error) return <ErrorPanel message={historyQuery.error.message} />;
  if (metIndicatorsQuery.error) return <ErrorPanel message={metIndicatorsQuery.error.message} />;

  async function handleConfirmOverride() {
    try {
      await reopen.mutateAsync({ reason });
      pushToast("Governed override executed.", "success");
      setConfirmOpen(false);
      setSelectedIndicatorId("");
      setReason("");
      await Promise.all([historyQuery.refetch(), metIndicatorsQuery.refetch()]);
    } catch (error) {
      pushToast(getSafeErrorMessage(error), "error");
    }
  }

  const rows = historyQuery.data ?? [];
  return (
    <div className="space-y-6">
      <SettingsPageHeader
        title="Overrides & reopen control"
        description="Execute governed overrides deliberately, then review the immutable history trail below."
      />

      <NextActionBanner
        action="Select a completed indicator, choose the override type, record the reason, then confirm the governed change."
        reason="Overrides are administrative state changes and must be explicit, justified, and traceable."
        status={`Available MET indicators: ${indicatorOptions.length} • Recorded override events: ${rows.length}`}
        blockers={executionBlockers}
      />

      <section className="grid gap-6 xl:grid-cols-[1.1fr,0.9fr]">
        {canRunOverrides ? (
          <Card className="space-y-4 p-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Override Control</p>
              <h2 className="mt-1 text-lg font-semibold text-slate-950">Execute governed override</h2>
              <p className="mt-1 text-sm text-slate-600">
                This control is for state change execution only. Audit history stays read-only below.
              </p>
            </div>

            <label className="space-y-2 text-sm">
              <span className="font-medium text-slate-700">Select indicator</span>
              <Select value={selectedIndicatorId} onChange={(event) => setSelectedIndicatorId(event.target.value)}>
                <option value="">Select a MET indicator</option>
                {indicatorOptions.map((row) => (
                  <option key={row.project_indicator_id} value={row.project_indicator_id}>
                    {row.project_name} • {row.indicator_code} • {row.indicator_text}
                  </option>
                ))}
              </Select>
            </label>

            <label className="space-y-2 text-sm">
              <span className="font-medium text-slate-700">Select override type</span>
              <Select
                value={overrideType}
                onChange={(event) => setOverrideType(event.target.value as OverrideType)}
              >
                <option value="REOPEN_TO_IN_PROGRESS">Reopen MET indicator to IN_PROGRESS</option>
              </Select>
            </label>

            <label className="space-y-2 text-sm">
              <span className="font-medium text-slate-700">Reason</span>
              <Input
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                placeholder="Document why this governed override is required."
              />
            </label>

            {selectedIndicator ? (
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                <p className="font-semibold text-slate-900">Selected state change</p>
                <p className="mt-1">
                  {selectedIndicator.project_name} • {selectedIndicator.indicator_code}
                </p>
                <p className="mt-1">Current status: {selectedIndicator.current_status}</p>
              </div>
            ) : null}

            <Button onClick={() => setConfirmOpen(true)} disabled={!canSubmitOverride}>
              Confirm override
            </Button>
          </Card>
        ) : (
          <Card className="space-y-4 p-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Override Control</p>
              <h2 className="mt-1 text-lg font-semibold text-slate-950">Execution restricted</h2>
              <p className="mt-1 text-sm text-slate-600">
                Leads can review override history here, but execution remains ADMIN-only.
              </p>
            </div>
            <div className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-950">
              {getRestrictionMessage("overrideExecution")}
            </div>
          </Card>
        )}

        <Card className="space-y-4 p-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Override Rules</p>
            <h2 className="mt-1 text-lg font-semibold text-slate-950">Safety conditions</h2>
          </div>
          <ul className="space-y-2 text-sm text-slate-700">
            <li>- Only completed indicators are offered for reopen override.</li>
            <li>- A human reason is required before the action can proceed.</li>
            <li>- The override returns governed state to IN_PROGRESS for corrective work.</li>
            <li>- Every execution is written to the audit trail with actor and timestamp.</li>
          </ul>
        </Card>
      </section>

      <section className="space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">History</p>
          <h2 className="mt-1 text-lg font-semibold text-slate-950">Override audit history</h2>
          <p className="mt-1 text-sm text-slate-600">This table is history-only. It does not execute changes.</p>
        </div>
        <WorkbenchTable<Record<string, unknown>>
          columns={[
            { key: "actor", header: "Actor", render: (row) => String(row.actor_username ?? "System") },
            { key: "event", header: "Event", render: (row) => String(row.event_type ?? "") },
            { key: "reason", header: "Reason", render: (row) => String(row.reason ?? "") },
            { key: "timestamp", header: "Timestamp", render: (row) => String(row.timestamp ?? "") },
          ]}
          rows={rows}
          rowKey={(row) => String(row.id)}
        />
      </section>

      <Modal
        open={confirmOpen}
        title="Confirm governed override"
        description="This action will change governed state. Continue?"
        onClose={() => setConfirmOpen(false)}
      >
        <div className="space-y-4">
          <div className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-950">
            <p className="font-semibold">Override summary</p>
            <p className="mt-1">{selectedIndicator ? `${selectedIndicator.project_name} • ${selectedIndicator.indicator_code}` : "No indicator selected"}</p>
            <p className="mt-1">Type: {overrideType}</p>
            <p className="mt-1">Reason: {reason || "No reason entered."}</p>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmOverride} loading={reopen.isPending} disabled={!canSubmitOverride}>
              Execute override
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

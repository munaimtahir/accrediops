"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { CapaStatusBadge } from "@/components/badges/capa-status-badge";
import { PriorityBadge } from "@/components/badges/priority-badge";
import { Drawer } from "@/components/common/drawer";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorPanel } from "@/components/common/error-panel";
import { LoadingSkeleton } from "@/components/common/loading-skeleton";
import { MetricCard } from "@/components/common/metric-card";
import { PageHeader } from "@/components/common/page-header";
import { WorkflowContextStrip } from "@/components/common/workflow-context-strip";
import { Button, buttonVariants } from "@/components/ui/button";
import { useToast } from "@/components/common/toaster";
import { useAuthSession } from "@/lib/hooks/use-auth";
import { useProjectCapas, useProjectCapaSummary, useProjectGaps } from "@/lib/hooks/use-capa";
import { useUpdateCapa } from "@/lib/hooks/use-capa-mutations";
import { useCapaAction } from "@/lib/hooks/use-mutations";
import type { Capa, CapaStatus, Priority, UserRole, Gap } from "@/types";
import { cn } from "@/utils/cn";

type WorkspaceView = "dashboard" | "gaps" | "board" | "my";

const ACTIVE_STATUSES: CapaStatus[] = ["OPEN", "IN_PROGRESS", "SUBMITTED_FOR_REVIEW", "REJECTED"];
const EMPTY_CAPAS: Capa[] = [];
const EMPTY_GAPS: Gap[] = [];

function canEdit(role: UserRole | undefined) {
  return role === "ADMIN" || role === "LEAD" || role === "OWNER";
}

function canApprove(role: UserRole | undefined) {
  return role === "ADMIN" || role === "APPROVER";
}

function formatDate(value: string | null | undefined) {
  if (!value) return "Not set";
  return value;
}

function toStatus(status: unknown): CapaStatus {
  const s = String(status ?? "OPEN") as CapaStatus;
  return s;
}

export function ProjectCapaWorkspaceScreen({ projectId }: { projectId: number }) {
  const { pushToast } = useToast();
  const auth = useAuthSession();
  const userId = auth.data?.user?.id ?? null;
  const role = auth.data?.user?.role;

  const [view, setView] = useState<WorkspaceView>("dashboard");
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const capasQuery = useProjectCapas(projectId);
  const gapsQuery = useProjectGaps(projectId);
  const summaryQuery = useProjectCapaSummary(projectId);

  const capas = capasQuery.data ?? EMPTY_CAPAS;
  const gaps = gapsQuery.data ?? EMPTY_GAPS;
  const selected = selectedId ? capas.find((c) => c.id === selectedId) ?? null : null;

  const openCapas = useMemo(
    () => capas.filter((c) => c.status === "OPEN" || c.status === "IN_PROGRESS"),
    [capas],
  );
  const submitted = useMemo(() => capas.filter((c) => c.status === "SUBMITTED_FOR_REVIEW"), [capas]);
  const closed = useMemo(() => capas.filter((c) => c.status === "CLOSED"), [capas]);
  const highRisk = useMemo(
    () => capas.filter((c) => c.gap_severity === "HIGH" || c.gap_severity === "CRITICAL"),
    [capas],
  );
  const overdue = useMemo(() => capas.filter((c) => Boolean(c.is_overdue)), [capas]);
  const exportBlockers = useMemo(() => capas.filter((c) => Boolean(c.is_export_blocker)), [capas]);
  const assignedToMe = useMemo(
    () => (userId ? capas.filter((c) => c.responsible_person === userId) : []),
    [capas, userId],
  );

  const [dashboardFilter, setDashboardFilter] = useState<
    | { kind: "all" }
    | { kind: "open" }
    | { kind: "inProgress" }
    | { kind: "submitted" }
    | { kind: "closed" }
    | { kind: "highRisk" }
    | { kind: "overdue" }
    | { kind: "exportBlockers" }
    | { kind: "assignedToMe" }
  >({ kind: "all" });

  const dashboardList = useMemo(() => {
    switch (dashboardFilter.kind) {
      case "open":
        return openCapas;
      case "inProgress":
        return capas.filter((c) => c.status === "IN_PROGRESS");
      case "submitted":
        return submitted;
      case "closed":
        return closed;
      case "highRisk":
        return highRisk.filter((c) => ACTIVE_STATUSES.includes(c.status));
      case "overdue":
        return overdue;
      case "exportBlockers":
        return exportBlockers.filter((c) => ACTIVE_STATUSES.includes(c.status));
      case "assignedToMe":
        return assignedToMe.filter((c) => ACTIVE_STATUSES.includes(c.status));
      default:
        return capas;
    }
  }, [assignedToMe, capas, closed, dashboardFilter.kind, exportBlockers, highRisk, openCapas, overdue, submitted]);

  const isLoading = auth.isLoading || capasQuery.isLoading || summaryQuery.isLoading;
  if (isLoading) return <LoadingSkeleton className="h-40 w-full" />;
  if (capasQuery.error) return <ErrorPanel message={capasQuery.error.message} />;
  if (summaryQuery.error) return <ErrorPanel message={summaryQuery.error.message} />;

  const summary = summaryQuery.data;
  const total = summary?.total_capa ?? capas.length;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Gap & CAPA"
        title="CAPA workspace"
        description="Review, triage, and move CAPA records through the workflow without drilling into individual indicators."
        actions={
          <>
            <Link
              href={`/projects/${projectId}/worklist`}
              className={cn(buttonVariants({ variant: "secondary", size: "sm" }))}
            >
              Open worklist
            </Link>
            <Link
              href={`/projects/${projectId}/exports`}
              className={cn(buttonVariants({ variant: "secondary", size: "sm" }))}
            >
              Open exports
            </Link>
          </>
        }
      />

      <WorkflowContextStrip
        scope={`Project ${projectId} · CAPA`}
        current="Triage CAPA items across the project."
        nextStep="Resolve export blockers and overdue CAPAs, then re-check readiness and exports."
        actions={[
          { label: "Back to project", href: `/projects/${projectId}` },
          { label: "Open worklist", href: `/projects/${projectId}/worklist` },
        ]}
      />

      <div className="flex flex-wrap gap-2">
        <SegmentButton active={view === "dashboard"} onClick={() => setView("dashboard")}>
          Dashboard
        </SegmentButton>
        <SegmentButton active={view === "gaps"} onClick={() => setView("gaps")}>
          Open gaps
        </SegmentButton>
        <SegmentButton active={view === "board"} onClick={() => setView("board")}>
          Board
        </SegmentButton>
        <SegmentButton active={view === "my"} onClick={() => setView("my")}>
          My tasks
        </SegmentButton>
      </div>

      {total === 0 && gaps.length === 0 ? (
        <EmptyState
          title="No CAPA records or gaps yet"
          description="CAPAs appear here once gaps are recorded and CAPA is initialized from an evidence requirement."
          action={
            <Link href={`/projects/${projectId}/worklist`} className={cn(buttonVariants({ variant: "secondary" }))}>
              Open worklist
            </Link>
          }
        />
      ) : view === "dashboard" ? (
        <div className="space-y-6" data-testid="gap-capa-dashboard">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <ClickableMetricCard
              label="Open gaps"
              value={gaps.filter(g => g.status === "OPEN").length}
              selected={false}
              onClick={() => setView("gaps")}
            />
            <ClickableMetricCard
              label="Open CAPA"
              value={Number(summary?.open_capa_count ?? openCapas.length)}
              selected={dashboardFilter.kind === "open"}
              onClick={() => setDashboardFilter({ kind: "open" })}
            />
            <ClickableMetricCard
              label="In progress"
              value={Number(summary?.in_progress_capa_count ?? capas.filter((c) => c.status === "IN_PROGRESS").length)}
              selected={dashboardFilter.kind === "inProgress"}
              onClick={() => setDashboardFilter({ kind: "inProgress" })}
            />
            <ClickableMetricCard
              label="Submitted for review"
              value={Number(summary?.submitted_capa_count ?? submitted.length)}
              selected={dashboardFilter.kind === "submitted"}
              onClick={() => setDashboardFilter({ kind: "submitted" })}
            />
            <ClickableMetricCard
              label="High risk"
              value={highRisk.filter((c) => ACTIVE_STATUSES.includes(c.status)).length}
              selected={dashboardFilter.kind === "highRisk"}
              onClick={() => setDashboardFilter({ kind: "highRisk" })}
            />
            <ClickableMetricCard
              label="Overdue"
              value={Number(summary?.overdue_capa_count ?? overdue.length)}
              selected={dashboardFilter.kind === "overdue"}
              onClick={() => setDashboardFilter({ kind: "overdue" })}
            />
            <ClickableMetricCard
              label="Export blockers"
              value={Number(summary?.export_blocker_count ?? exportBlockers.filter((c) => ACTIVE_STATUSES.includes(c.status)).length)}
              selected={dashboardFilter.kind === "exportBlockers"}
              onClick={() => setDashboardFilter({ kind: "exportBlockers" })}
            />
            <ClickableMetricCard
              label="Closed CAPA"
              value={Number(summary?.closed_capa_count ?? closed.length)}
              selected={dashboardFilter.kind === "closed"}
              onClick={() => setDashboardFilter({ kind: "closed" })}
            />
            <ClickableMetricCard
              label="Assigned to me"
              value={Number(summary?.assigned_to_me_count ?? assignedToMe.filter((c) => ACTIVE_STATUSES.includes(c.status)).length)}
              selected={dashboardFilter.kind === "assignedToMe"}
              onClick={() => setDashboardFilter({ kind: "assignedToMe" })}
            />
            <ClickableMetricCard
              label="All CAPA"
              value={total}
              selected={dashboardFilter.kind === "all"}
              onClick={() => setDashboardFilter({ kind: "all" })}
            />
          </div>

          <Section title="CAPA list">
            <CapaList capas={dashboardList} onOpen={(id) => setSelectedId(id)} />
          </Section>
        </div>
      ) : view === "gaps" ? (
        <OpenGapsView gaps={gaps} />
      ) : view === "board" ? (
        <BoardView capas={capas} onOpen={(id) => setSelectedId(id)} />
      ) : (
        <MyTasksView capas={capas} userId={userId} role={role} onOpen={(id) => setSelectedId(id)} />
      )}

      <CapaDetailDrawer
        open={selected != null}
        capa={selected}
        projectId={projectId}
        userRole={role}
        onClose={() => setSelectedId(null)}
        onNavigateToIndicator={(projectIndicatorId) => {
          window.location.assign(`/project-indicators/${projectIndicatorId}`);
        }}
        onNavigateToEvidenceRequirement={(projectIndicatorId) => {
          window.location.assign(`/project-indicators/${projectIndicatorId}?panel=requiredEvidence`);
        }}
        onToast={(message, tone) => pushToast(message, tone)}
      />
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-panel">
      <h2 className="text-lg font-semibold text-slate-950 mb-4">{title}</h2>
      {children}
    </div>
  );
}

function ClickableMetricCard({
  label,
  value,
  selected,
  onClick,
}: {
  label: string;
  value: number;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn("text-left rounded-xl", selected ? "ring-2 ring-slate-900" : "ring-0")}
    >
      <MetricCard label={label} value={value} helper="Click to filter" />
    </button>
  );
}

function SegmentButton({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1.5 text-sm font-semibold",
        active ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-white text-slate-800",
      )}
    >
      {children}
    </button>
  );
}

function CapaList({ capas, onOpen }: { capas: Capa[]; onOpen: (id: number) => void }) {
  if (capas.length === 0) {
    return <p className="text-sm text-slate-600">No matching CAPAs.</p>;
  }

  return (
    <div className="grid gap-3 lg:grid-cols-2">
      {capas.map((capa) => (
        <button
          key={capa.id}
          type="button"
          onClick={() => onOpen(capa.id)}
          className="text-left rounded-xl border border-slate-200 bg-white p-4 shadow-panel hover:border-slate-300"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <CapaStatusBadge status={toStatus(capa.status)} />
                {capa.gap_severity ? <PriorityBadge priority={capa.gap_severity as Priority} /> : null}
                {capa.is_overdue ? <Badge tone="danger">Overdue</Badge> : null}
                {capa.is_export_blocker ? <Badge tone="warning" dataTestId="capa-export-blocker-badge">Export blocker</Badge> : null}
              </div>
              <h3 className="mt-2 font-semibold text-slate-950 truncate">{capa.title}</h3>
              <p className="mt-1 text-sm text-slate-600">
                {capa.indicator_code ? <span className="font-semibold text-slate-700">{capa.indicator_code}</span> : null}
                {capa.evidence_requirement_title ? (
                  <span className="ml-2 text-slate-600">· {capa.evidence_requirement_title}</span>
                ) : null}
              </p>
            </div>
            <div className="text-right text-xs text-slate-600">
              <div>Due: {formatDate(capa.due_date)}</div>
              <div className="mt-1">
                Owner: {capa.responsible_person_username ? capa.responsible_person_username : "Unassigned"}
              </div>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}

function BoardView({ capas, onOpen }: { capas: Capa[]; onOpen: (id: number) => void }) {
  const columns: { key: CapaStatus; title: string; items: Capa[] }[] = [
    { key: "OPEN", title: "Open", items: capas.filter((c) => c.status === "OPEN") },
    { key: "IN_PROGRESS", title: "In progress", items: capas.filter((c) => c.status === "IN_PROGRESS") },
    { key: "SUBMITTED_FOR_REVIEW", title: "Submitted for review", items: capas.filter((c) => c.status === "SUBMITTED_FOR_REVIEW") },
    { key: "CLOSED", title: "Closed", items: capas.filter((c) => c.status === "CLOSED") },
    { key: "REJECTED", title: "Rejected", items: capas.filter((c) => c.status === "REJECTED") },
    { key: "CANCELLED", title: "Cancelled", items: capas.filter((c) => c.status === "CANCELLED") },
  ];

  return (
    <div className="grid gap-4 xl:grid-cols-3" data-testid="capa-board">
      {columns.map((col) => (
        <div key={col.key} className="rounded-xl border border-slate-200 bg-white shadow-panel">
          <div className="border-b border-slate-200 px-4 py-3">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-slate-950">{col.title}</h2>
              <span className="text-xs font-semibold text-slate-600">{col.items.length}</span>
            </div>
          </div>
          <div className="p-4 space-y-3">
            {col.items.length === 0 ? (
              <p className="text-sm text-slate-600">No items.</p>
            ) : (
              col.items.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  data-testid="capa-card"
                  onClick={() => onOpen(c.id)}
                  className="w-full text-left rounded-xl border border-slate-200 bg-white p-3 hover:border-slate-300"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <CapaStatusBadge status={toStatus(c.status)} />
                    {c.gap_severity ? <PriorityBadge priority={c.gap_severity as Priority} /> : null}
                    {c.is_overdue ? <Badge tone="danger">Overdue</Badge> : null}
                    {c.is_export_blocker ? <Badge tone="warning" dataTestId="capa-export-blocker-badge">Blocker</Badge> : null}
                  </div>
                  <div className="mt-2 font-semibold text-slate-950 truncate">{c.title}</div>
                  <div className="mt-1 text-xs text-slate-600">
                    {c.indicator_code ? `${c.indicator_code}` : "Indicator"} · Due {formatDate(c.due_date)}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function MyTasksView({
  capas,
  userId,
  role,
  onOpen,
}: {
  capas: Capa[];
  userId: number | null;
  role: UserRole | undefined;
  onOpen: (id: number) => void;
}) {
  const myAssigned = userId ? capas.filter((c) => c.responsible_person === userId) : [];
  const overdue = myAssigned.filter((c) => Boolean(c.is_overdue));
  const submittedByMe = userId ? capas.filter((c) => c.submitted_by === userId) : [];
  const returnedRejected = myAssigned.filter((c) => c.status === "REJECTED");
  const awaitingMyReview = canApprove(role) ? capas.filter((c) => c.status === "SUBMITTED_FOR_REVIEW") : [];
  const dueThisWeek = myAssigned.filter((c) => {
    if (!c.due_date) return false;
    const due = new Date(c.due_date);
    if (Number.isNaN(due.getTime())) return false;
    const now = new Date();
    const end = new Date(now);
    end.setDate(now.getDate() + 7);
    return due >= now && due <= end;
  });

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Assigned to me" value={myAssigned.filter((c) => ACTIVE_STATUSES.includes(c.status)).length} />
        <MetricCard label="Overdue (mine)" value={overdue.length} />
        <MetricCard label="Submitted by me" value={submittedByMe.length} />
        <MetricCard label="Returned / rejected" value={returnedRejected.length} />
        <MetricCard label="Due this week" value={dueThisWeek.length} />
        <MetricCard label="Awaiting my review" value={awaitingMyReview.length} />
      </div>
      <Section title="My assigned CAPA">
        <CapaList capas={myAssigned} onOpen={onOpen} />
      </Section>
      {canApprove(role) ? (
        <Section title="Awaiting my review">
          <CapaList capas={awaitingMyReview} onOpen={onOpen} />
        </Section>
      ) : null}
    </div>
  );
}

function Badge({ tone, children, dataTestId }: { tone: "danger" | "warning"; children: React.ReactNode; dataTestId?: string }) {
  const klass =
    tone === "danger"
      ? "border-rose-300 bg-rose-50 text-rose-900"
      : "border-amber-300 bg-amber-50 text-amber-900";
  return <span className={cn("inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold", klass)} data-testid={dataTestId}>{children}</span>;
}

function CapaDetailDrawer({
  open,
  capa,
  projectId,
  userRole,
  onClose,
  onNavigateToIndicator,
  onNavigateToEvidenceRequirement,
  onToast,
}: {
  open: boolean;
  capa: Capa | null;
  projectId: number;
  userRole: UserRole | undefined;
  onClose: () => void;
  onNavigateToIndicator: (projectIndicatorId: number) => void;
  onNavigateToEvidenceRequirement: (projectIndicatorId: number) => void;
  onToast: (message: string, tone: "success" | "error") => void;
}) {
  const update = useUpdateCapa(projectId);
  const capaAction = useCapaAction(capa?.project_indicator ?? Number.NaN, projectId);

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<{
    title: string;
    root_cause: string;
    corrective_action: string;
    preventive_action: string;
    due_date: string;
  } | null>(null);

  if (!open || capa == null) return null;
  const currentCapa = capa;

  const canEditThis = canEdit(userRole);
  const canApproveThis = canApprove(userRole);

  const effectiveDraft = draft ?? {
    title: currentCapa.title ?? "",
    root_cause: currentCapa.root_cause ?? "",
    corrective_action: currentCapa.corrective_action ?? "",
    preventive_action: currentCapa.preventive_action ?? "",
    due_date: currentCapa.due_date ?? "",
  };

  async function handleSave() {
    try {
      await update.mutateAsync({
        capaId: currentCapa.id,
        payload: {
          title: effectiveDraft.title,
          root_cause: effectiveDraft.root_cause,
          corrective_action: effectiveDraft.corrective_action,
          preventive_action: effectiveDraft.preventive_action,
          due_date: effectiveDraft.due_date ? effectiveDraft.due_date : null,
        },
      });
      onToast("CAPA updated.", "success");
      setEditing(false);
      setDraft(null);
    } catch (e) {
      onToast(e instanceof Error ? e.message : "Update failed.", "error");
    }
  }

  async function handleAction(action: "SUBMIT" | "CLOSE" | "REJECT") {
    try {
      await capaAction.mutateAsync({ capaId: currentCapa.id, payload: { action } });
      const labels: Record<"SUBMIT" | "CLOSE" | "REJECT", string> = {
        SUBMIT: "submitted",
        CLOSE: "closed",
        REJECT: "rejected",
      };
      onToast(`CAPA ${labels[action]}.`, "success");
      onClose();
    } catch (e) {
      onToast(e instanceof Error ? e.message : "Action failed.", "error");
    }
  }

  return (
      <Drawer
      open={open}
      title={currentCapa.title}
      description={`${currentCapa.indicator_code ?? "Indicator"} · Status ${String(currentCapa.status)}`}
      onClose={onClose}
      data-testid="capa-detail-drawer"
    >
      <div className="space-y-6">
        <div className="flex flex-wrap items-center gap-2">
          <CapaStatusBadge status={toStatus(currentCapa.status)} />
          {currentCapa.gap_severity ? <PriorityBadge priority={currentCapa.gap_severity as Priority} /> : null}
          {currentCapa.is_overdue ? <Badge tone="danger">Overdue</Badge> : null}
          {currentCapa.is_export_blocker ? <Badge tone="warning" dataTestId="capa-export-blocker-badge">Export blocker</Badge> : null}
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <Info label="Due date" value={formatDate(currentCapa.due_date)} />
          <Info label="Responsible" value={currentCapa.responsible_person_username ?? "Unassigned"} />
          <Info label="Evidence requirement" value={currentCapa.evidence_requirement_title ?? "Not linked"} />
          <Info label="Gap" value={currentCapa.gap_title ?? `Gap #${currentCapa.gap}`} />
        </div>

        <div className="flex flex-wrap gap-2">
          <Button type="button" size="sm" variant="secondary" onClick={() => onNavigateToIndicator(currentCapa.project_indicator)}>
            Open indicator
          </Button>
          {currentCapa.project_evidence_requirement ? (
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() => onNavigateToEvidenceRequirement(currentCapa.project_indicator)}
              title="Opens the indicator detail at the required evidence panel"
            >
              Open evidence requirement
            </Button>
          ) : null}
          {canEditThis ? (
            <Button type="button" size="sm" variant={editing ? "secondary" : "default"} onClick={() => {
              setEditing((v) => !v);
              setDraft(null);
            }}>
              {editing ? "Stop editing" : "Edit"}
            </Button>
          ) : null}
          {canEditThis && currentCapa.status !== "SUBMITTED_FOR_REVIEW" && currentCapa.status !== "CLOSED" ? (
            <Button type="button" size="sm" variant="default" onClick={() => handleAction("SUBMIT")} data-testid="submit-capa-button">
              Submit
            </Button>
          ) : null}
          {canApproveThis && currentCapa.status === "SUBMITTED_FOR_REVIEW" ? (
            <>
              <Button type="button" size="sm" variant="default" onClick={() => handleAction("CLOSE")} data-testid="close-capa-button">
                Close
              </Button>
              <Button type="button" size="sm" variant="secondary" onClick={() => handleAction("REJECT")} data-testid="reject-capa-button">
                Reject
              </Button>
            </>
          ) : null}
        </div>

        {editing ? (
          <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <Field label="Title">
              <input
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
                value={effectiveDraft.title}
                onChange={(e) => setDraft({ ...effectiveDraft, title: e.target.value })}
              />
            </Field>
            <Field label="Root cause">
              <textarea
                className="w-full min-h-24 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
                value={effectiveDraft.root_cause}
                onChange={(e) => setDraft({ ...effectiveDraft, root_cause: e.target.value })}
              />
            </Field>
            <Field label="Corrective action">
              <textarea
                className="w-full min-h-24 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
                value={effectiveDraft.corrective_action}
                onChange={(e) => setDraft({ ...effectiveDraft, corrective_action: e.target.value })}
              />
            </Field>
            <Field label="Preventive action">
              <textarea
                className="w-full min-h-24 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
                value={effectiveDraft.preventive_action}
                onChange={(e) => setDraft({ ...effectiveDraft, preventive_action: e.target.value })}
              />
            </Field>
            <Field label="Due date (YYYY-MM-DD)">
              <input
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
                value={effectiveDraft.due_date}
                onChange={(e) => setDraft({ ...effectiveDraft, due_date: e.target.value })}
              />
            </Field>
            <div className="flex gap-2">
              <Button type="button" size="sm" onClick={handleSave} loading={update.isPending}>
                Save
              </Button>
              <Button type="button" size="sm" variant="secondary" onClick={() => { setEditing(false); setDraft(null); }}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid gap-4">
            <LongText label="Root cause" value={currentCapa.root_cause} />
            <LongText label="Corrective action" value={currentCapa.corrective_action} />
            <LongText label="Preventive action" value={currentCapa.preventive_action} />
            {currentCapa.closure_notes ? <LongText label="Closure notes" value={currentCapa.closure_notes} /> : null}
            {currentCapa.rejection_reason ? <LongText label="Rejection reason" value={currentCapa.rejection_reason} /> : null}
          </div>
        )}
      </div>
    </Drawer>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3">
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-600">{label}</div>
      <div className="mt-1 text-sm text-slate-950">{value}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-1.5">
      <span className="text-sm font-semibold text-slate-800">{label}</span>
      {children}
    </label>
  );
}

function LongText({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-600">{label}</div>
      <div className="mt-2 whitespace-pre-wrap text-sm text-slate-900">{value ? value : "Not provided."}</div>
    </div>
  );
}

function OpenGapsView({ gaps }: { gaps: Gap[] }) {
  if (gaps.length === 0) {
    return <EmptyState title="No open gaps" description="Missing, rejected, or partial evidence requirements can create gaps." />;
  }
  
  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-panel overflow-x-auto">
      <table className="w-full text-left text-sm whitespace-nowrap" data-testid="open-gaps-table">
        <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
          <tr>
            <th className="px-4 py-3 font-semibold">Gap</th>
            <th className="px-4 py-3 font-semibold">Severity</th>
            <th className="px-4 py-3 font-semibold">Source</th>
            <th className="px-4 py-3 font-semibold">Status</th>
            <th className="px-4 py-3 font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {gaps.map((gap) => (
            <tr key={gap.id} className="hover:bg-slate-50/50" data-testid="gap-row">
              <td className="px-4 py-3">
                <div className="font-semibold text-slate-950">{gap.title}</div>
              </td>
              <td className="px-4 py-3">
                <PriorityBadge priority={gap.severity} />
              </td>
              <td className="px-4 py-3 text-slate-600">{gap.source.replace(/_/g, " ")}</td>
              <td className="px-4 py-3 text-slate-600">{gap.status}</td>
              <td className="px-4 py-3">
                {gap.status === "OPEN" ? (
                  <Button type="button" size="sm" variant="secondary" onClick={() => window.location.assign(`/project-indicators/${gap.project_indicator}?panel=capa`)} data-testid="create-capa-button">
                    Create CAPA
                  </Button>
                ) : (
                  <span className="text-slate-400">Resolved</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

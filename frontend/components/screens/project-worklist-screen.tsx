"use client";

import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { EmptyState } from "@/components/common/empty-state";
import { ErrorPanel } from "@/components/common/error-panel";
import { FilterBar } from "@/components/common/filter-bar";
import { LoadingSkeleton } from "@/components/common/loading-skeleton";
import { NextActionBanner } from "@/components/common/next-action-banner";
import { OnboardingCallout } from "@/components/common/onboarding-callout";
import { PageHeader } from "@/components/common/page-header";
import { WorkflowContextStrip } from "@/components/common/workflow-context-strip";
import { PaginationControls } from "@/components/common/pagination-controls";
import { IndicatorDrawer } from "@/components/screens/indicator-drawer";
import { AreaSection } from "@/components/worklist/area-section";
import { StatusLegend } from "@/components/worklist/status-legend";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { useProgress } from "@/lib/hooks/use-progress";
import { useUsers } from "@/lib/hooks/use-users";
import { useWorklist } from "@/lib/hooks/use-worklist";
import { DashboardRow, IndicatorStatus, Priority, StandardProgress, WorklistFilters } from "@/types";
import { formatUserName } from "@/utils/format";

const defaultPageSize = 25;
const pageSizeOptions: Array<number | "all"> = [25, 50, 100, "all"];
const indicatorStatuses: IndicatorStatus[] = [
  "NOT_STARTED",
  "IN_PROGRESS",
  "UNDER_REVIEW",
  "MET",
  "BLOCKED",
];
const priorityOptions: Priority[] = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

function parseNumber(value: string | null) {
  if (!value) {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function parseBoolean(value: string | null) {
  if (value === "true") return true;
  if (value === "false") return false;
  return undefined;
}

function parsePageSize(value: string | null): number | "all" {
  if (value === "all") {
    return "all";
  }
  const parsed = Number(value);
  if ([25, 50, 100].includes(parsed)) {
    return parsed;
  }
  return defaultPageSize;
}

function WorklistLoading() {
  return (
    <div className="space-y-4">
      <LoadingSkeleton className="h-32 w-full" />
      <LoadingSkeleton className="h-20 w-full" />
      <LoadingSkeleton className="h-96 w-full" />
    </div>
  );
}

type AreaGroup = {
  areaName: string;
  standards: Array<{
    standardName: string;
    indicators: DashboardRow[];
  }>;
};

export function ProjectWorklistScreen({ projectId }: { projectId: number }) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [activeIndicatorId, setActiveIndicatorId] = useState<number | null>(null);
  const deferredSearch = useDeferredValue(search);
  const selectedPageSize = parsePageSize(searchParams.get("page_size"));

  useEffect(() => {
    setSearch(searchParams.get("search") ?? "");
  }, [searchParams]);

  useEffect(() => {
    const current = searchParams.get("search") ?? "";
    if (deferredSearch === current) {
      return;
    }

    const params = new URLSearchParams(searchParams.toString());
    if (deferredSearch) {
      params.set("search", deferredSearch);
    } else {
      params.delete("search");
    }
    params.delete("page");
    router.replace(`${pathname}?${params.toString()}`);
  }, [deferredSearch, pathname, router, searchParams]);

  const filters: WorklistFilters = {
    project_id: projectId,
    area_id: parseNumber(searchParams.get("area")),
    standard_id: parseNumber(searchParams.get("standard")),
    status: (searchParams.get("status") as IndicatorStatus | null) ?? undefined,
    priority: (searchParams.get("priority") as Priority | null) ?? undefined,
    owner_id: parseNumber(searchParams.get("owner")),
    recurring: parseBoolean(searchParams.get("recurring")),
    due_today: searchParams.get("due_today") === "true",
    overdue: searchParams.get("overdue") === "true",
    search: deferredSearch || undefined,
    page: selectedPageSize === "all" ? 1 : parseNumber(searchParams.get("page")) ?? 1,
    page_size: selectedPageSize,
  };

  const worklistQuery = useWorklist(filters);
  const standardsQuery = useProgress(projectId, "standards");
  const ownersQuery = useUsers({ role: "OWNER" });

  function updateParam(key: string, value?: string, resetPage = true) {
    const params = new URLSearchParams(searchParams.toString());
    if (!value) {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    if (resetPage) {
      params.delete("page");
    }
    router.replace(`${pathname}?${params.toString()}`);
  }

  function clearFilters() {
    router.replace(pathname);
  }

  const rows = worklistQuery.data?.results ?? [];
  const standards = Array.isArray(standardsQuery.data) ? (standardsQuery.data as StandardProgress[]) : [];
  const areaOptions = standards.reduce<Array<{ id: number; name: string }>>((items, row) => {
    if (!items.some((entry) => entry.id === row.area_id)) {
      items.push({ id: row.area_id, name: row.area_name });
    }
    return items;
  }, []);
  const ownerOptions = ownersQuery.data ?? [];
  const groupedRows = useMemo<AreaGroup[]>(() => {
    const areaMap = new Map<string, Map<string, DashboardRow[]>>();

    rows.forEach((row) => {
      const areaName = row.area_name || "Unassigned area";
      const standardName = row.standard_name || "Unassigned standard";

      if (!areaMap.has(areaName)) {
        areaMap.set(areaName, new Map());
      }
      const standardMap = areaMap.get(areaName)!;
      if (!standardMap.has(standardName)) {
        standardMap.set(standardName, []);
      }
      standardMap.get(standardName)!.push(row);
    });

    return Array.from(areaMap.entries()).map(([areaName, standardMap]) => ({
      areaName,
      standards: Array.from(standardMap.entries()).map(([standardName, indicators]) => ({
        standardName,
        indicators,
      })),
    }));
  }, [rows]);

  if (worklistQuery.isLoading) {
    return <WorklistLoading />;
  }

  if (worklistQuery.error) {
    return <ErrorPanel message={worklistQuery.error.message} />;
  }

  function openIndicator(projectIndicatorId: number) {
    setActiveIndicatorId(projectIndicatorId);
  }

  const overdueRows = rows.filter((row) => row.due_date && new Date(row.due_date) < new Date());
  const reviewRows = rows.filter((row) => row.current_status === "UNDER_REVIEW");
  const nextWorklistAction = overdueRows.length
    ? "Open overdue indicators and resolve blocked evidence first."
    : reviewRows.length
      ? "Open indicators under review and close readiness blockers."
      : rows.length
        ? "Open the next in-progress indicator and continue evidence work."
        : "Clear filters or move to recurring queue for the next governed task.";
  const nextWorklistReason = overdueRows.length
    ? `${overdueRows.length} indicator(s) in this view are overdue.`
    : reviewRows.length
      ? `${reviewRows.length} indicator(s) are waiting in review.`
      : rows.length
        ? `${rows.length} indicator(s) match the current worklist filter.`
        : "No indicators match the current filter set.";
  const worklistStatus = `Filtered indicators: ${rows.length} • Areas: ${groupedRows.length}`;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Primary Screen"
        title="Project worklist"
        description="Inspection-first indicator dashboard grouped by Area and Standard with status-driven tiles for rapid accreditation scanning."
      />

      <WorkflowContextStrip
        scope={`Project ${projectId} · Worklist`}
        current="Browsing grouped indicators with workflow and overdue filters."
        nextStep="Open an indicator, complete evidence work, then run governed command actions."
        actions={[
          { label: "Back to project", href: `/projects/${projectId}` },
          { label: "Open recurring queue", href: `/projects/${projectId}/recurring` },
          { label: "Readiness view", href: `/projects/${projectId}/readiness` },
        ]}
      />

      <NextActionBanner action={nextWorklistAction} reason={nextWorklistReason} status={worklistStatus} />

      <OnboardingCallout
        storageKey={`worklist-${projectId}`}
        title="Fast operator path"
        description="Filter by Overdue or Under Review first, then open indicators to complete evidence review and workflow commands."
      />

      <FilterBar>
        <label className="space-y-2 text-sm">
          <span className="font-medium text-slate-700">Area</span>
          <Select
            value={searchParams.get("area") ?? ""}
            onChange={(event) => updateParam("area", event.target.value || undefined)}
          >
            <option value="">All areas</option>
            {areaOptions.map((area) => (
              <option key={area.id} value={area.id}>
                {area.name}
              </option>
            ))}
          </Select>
        </label>

        <label className="space-y-2 text-sm">
          <span className="font-medium text-slate-700">Standard</span>
          <Select
            value={searchParams.get("standard") ?? ""}
            onChange={(event) => updateParam("standard", event.target.value || undefined)}
          >
            <option value="">All standards</option>
            {standards.map((standard) => (
              <option key={standard.standard_id} value={standard.standard_id}>
                {standard.standard_name}
              </option>
            ))}
          </Select>
        </label>

        <label className="space-y-2 text-sm">
          <span className="font-medium text-slate-700">Status</span>
          <Select
            value={searchParams.get("status") ?? ""}
            onChange={(event) => updateParam("status", event.target.value || undefined)}
          >
            <option value="">All statuses</option>
            {indicatorStatuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </Select>
        </label>

        <label className="space-y-2 text-sm">
          <span className="font-medium text-slate-700">Priority</span>
          <Select
            value={searchParams.get("priority") ?? ""}
            onChange={(event) => updateParam("priority", event.target.value || undefined)}
          >
            <option value="">All priorities</option>
            {priorityOptions.map((priority) => (
              <option key={priority} value={priority}>
                {priority}
              </option>
            ))}
          </Select>
        </label>

        <label className="space-y-2 text-sm">
          <span className="font-medium text-slate-700">Owner</span>
          <Select
            value={searchParams.get("owner") ?? ""}
            onChange={(event) => updateParam("owner", event.target.value || undefined)}
          >
            <option value="">All owners</option>
            {ownerOptions.map((owner) => (
              <option key={owner.id} value={owner.id}>
                {formatUserName(owner)}
              </option>
            ))}
          </Select>
        </label>

        <label className="space-y-2 text-sm">
          <span className="font-medium text-slate-700">Recurring</span>
          <Select
            value={searchParams.get("recurring") ?? ""}
            onChange={(event) => updateParam("recurring", event.target.value || undefined)}
          >
            <option value="">All</option>
            <option value="true">Recurring only</option>
            <option value="false">One-time only</option>
          </Select>
        </label>

        <label className="space-y-2 text-sm">
          <span className="font-medium text-slate-700">Due today</span>
          <Select
            value={searchParams.get("due_today") ?? ""}
            onChange={(event) => updateParam("due_today", event.target.value || undefined)}
          >
            <option value="">All</option>
            <option value="true">Due today</option>
          </Select>
        </label>

        <label className="space-y-2 text-sm">
          <span className="font-medium text-slate-700">Overdue</span>
          <Select
            value={searchParams.get("overdue") ?? ""}
            onChange={(event) => updateParam("overdue", event.target.value || undefined)}
          >
            <option value="">All</option>
            <option value="true">Overdue only</option>
          </Select>
        </label>

        <label className="space-y-2 text-sm">
          <span className="font-medium text-slate-700">Page size</span>
          <Select
            data-testid="worklist-page-size"
            value={String(selectedPageSize)}
            onChange={(event) => updateParam("page_size", event.target.value || undefined)}
          >
            {pageSizeOptions.map((option) => (
              <option key={String(option)} value={String(option)}>
                {option === "all" ? "Show all" : option}
              </option>
            ))}
          </Select>
        </label>

        <label className="space-y-2 text-sm md:col-span-2 xl:col-span-4">
          <span className="font-medium text-slate-700">Search</span>
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Indicator code, text, area, standard, or project"
          />
        </label>

        <div className="flex items-end">
          <Button variant="secondary" onClick={clearFilters}>
            Clear filters
          </Button>
        </div>
      </FilterBar>

      <StatusLegend />

      <Card className="border-indigo-200 bg-indigo-50/60 p-4">
        <h2 className="text-base font-semibold text-indigo-950">Area → Standard → Indicator workbench</h2>
        <p className="mt-1 text-sm text-indigo-900">
          Use cards below as your primary navigation model. Click any indicator card to open the update drawer without
          leaving this workspace.
        </p>
      </Card>

      {rows.length === 0 ? (
        <EmptyState
          title="No worklist rows match the current filter set"
          description="Adjust filters or clear them to return to the full operational queue."
          action={
            <Button variant="secondary" onClick={clearFilters}>
              Reset to full queue
            </Button>
          }
        />
      ) : (
        <div className="space-y-4">
          {groupedRows.map((areaGroup) => (
            <AreaSection
              key={areaGroup.areaName}
              areaName={areaGroup.areaName}
              standards={areaGroup.standards}
              onOpenIndicator={openIndicator}
            />
          ))}
        </div>
      )}

      <PaginationControls
        page={filters.page ?? 1}
        pageSize={selectedPageSize === "all" ? Math.max(worklistQuery.data?.count ?? rows.length, 1) : selectedPageSize}
        total={worklistQuery.data?.count ?? 0}
        onPageChange={(page) => updateParam("page", String(page), false)}
      />

      {activeIndicatorId ? (
        <IndicatorDrawer indicatorId={activeIndicatorId} open onClose={() => setActiveIndicatorId(null)} />
      ) : null}
    </div>
  );
}

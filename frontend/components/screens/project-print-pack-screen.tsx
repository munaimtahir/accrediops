"use client";

import { useMemo } from "react";

import { EmptyState } from "@/components/common/empty-state";
import { ErrorPanel } from "@/components/common/error-panel";
import { LoadingSkeleton } from "@/components/common/loading-skeleton";
import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import { useProjectExport } from "@/lib/hooks/use-mutations";

export function ProjectPrintPackScreen({ projectId }: { projectId: number }) {
  const printBundle = useProjectExport(projectId, "print-bundle");

  const sections = useMemo(() => {
    if (!printBundle.data) {
      return [];
    }
    return printBundle.data.sections ?? printBundle.data.bundle?.sections ?? [];
  }, [printBundle.data]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Exports"
        title="Print pack preview"
        description="Structured print pack with area → standard → indicator → evidence ordering."
        actions={
          <Button onClick={() => printBundle.mutate()} loading={printBundle.isPending}>
            Generate Print Pack
          </Button>
        }
      />

      {printBundle.isPending ? (
        <div className="space-y-3">
          <LoadingSkeleton className="h-40 w-full" />
          <LoadingSkeleton className="h-40 w-full" />
        </div>
      ) : null}

      {printBundle.error ? <ErrorPanel message={printBundle.error.message} /> : null}

      {!sections.length && !printBundle.isPending && !printBundle.error ? (
        <EmptyState
          title="No print pack generated"
          description="Generate print pack to preview evidence structure and print order."
        />
      ) : null}

      {sections.map((section) => (
        <div key={section.name} className="rounded-xl border border-slate-200 bg-white p-4 shadow-panel">
          <h3 className="text-lg font-semibold text-slate-950">{section.name}</h3>
          <div className="mt-3 space-y-3">
            {section.standards.map((standard) => (
              <div key={standard.name} className="rounded-lg border border-slate-200 p-3">
                <h4 className="font-semibold text-slate-900">{standard.name}</h4>
                <div className="mt-2 space-y-2">
                  {standard.indicators.map((indicator) => (
                    <div key={indicator.project_indicator_id} className="rounded border border-slate-200 p-3">
                      <p className="font-medium text-slate-900">
                        {indicator.indicator_code} — {indicator.status}
                      </p>
                      <p className="mt-1 text-sm text-slate-700">{indicator.indicator_text}</p>
                      <p className="mt-1 text-xs text-slate-600">
                        Reuse: {indicator.reusable_template_allowed ? "Allowed" : "Not allowed"} • Policy:{" "}
                        {indicator.evidence_reuse_policy}
                      </p>
                      <ul className="mt-2 space-y-1 text-sm text-slate-700">
                        {indicator.evidence_list.map((evidence) => (
                          <li key={evidence.id}>
                            #{evidence.order} {evidence.title} [{evidence.approval_status}] • {evidence.file_label || "no label"}
                            {" • "}
                            {evidence.physical_location_type || "No location"}
                            {evidence.location_details ? ` (${evidence.location_details})` : ""}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

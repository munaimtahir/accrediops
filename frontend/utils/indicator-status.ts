export type IndicatorStatusTone =
  | "NA"
  | "NOT_MET"
  | "COMPLETED"
  | "IN_PROCESS"
  | "UNDER_REVIEW";

export const indicatorStatusToneOrder: IndicatorStatusTone[] = [
  "NA",
  "NOT_MET",
  "COMPLETED",
  "IN_PROCESS",
  "UNDER_REVIEW",
];

const statusAliasMap: Record<string, IndicatorStatusTone> = {
  NA: "NA",
  NOT_APPLICABLE: "NA",
  N_A: "NA",
  NOT_STARTED: "NA",
  NONE: "NA",
  NOT_MET: "NOT_MET",
  BLOCKED: "NOT_MET",
  REJECTED: "NOT_MET",
  MET: "COMPLETED",
  COMPLETED: "COMPLETED",
  COMPLETE: "COMPLETED",
  IN_PROGRESS: "IN_PROCESS",
  IN_PROCESS: "IN_PROCESS",
  STARTED: "IN_PROCESS",
  UNDER_REVIEW: "UNDER_REVIEW",
  IN_REVIEW: "UNDER_REVIEW",
  REVIEW: "UNDER_REVIEW",
  PENDING_REVIEW: "UNDER_REVIEW",
};

type StatusVisual = {
  label: string;
  badgeClassName: string;
  tileClassName: string;
  legendSwatchClassName: string;
};

const statusVisualMap: Record<IndicatorStatusTone, StatusVisual> = {
  NA: {
    label: "N/A",
    badgeClassName: "border-slate-300 bg-slate-100 text-slate-700",
    tileClassName: "border-slate-300 bg-slate-100 text-slate-800",
    legendSwatchClassName: "bg-slate-400",
  },
  NOT_MET: {
    label: "Not Met",
    badgeClassName: "border-rose-300 bg-rose-100 text-rose-900",
    tileClassName: "border-rose-300 bg-rose-100 text-rose-900",
    legendSwatchClassName: "bg-rose-500",
  },
  COMPLETED: {
    label: "Completed",
    badgeClassName: "border-emerald-300 bg-emerald-100 text-emerald-900",
    tileClassName: "border-emerald-300 bg-emerald-100 text-emerald-900",
    legendSwatchClassName: "bg-emerald-500",
  },
  IN_PROCESS: {
    label: "In Process",
    badgeClassName: "border-amber-300 bg-amber-100 text-amber-900",
    tileClassName: "border-amber-300 bg-amber-100 text-amber-900",
    legendSwatchClassName: "bg-amber-500",
  },
  UNDER_REVIEW: {
    label: "Under Review",
    badgeClassName: "border-sky-300 bg-sky-100 text-sky-900",
    tileClassName: "border-sky-300 bg-sky-100 text-sky-900",
    legendSwatchClassName: "bg-sky-500",
  },
};

export function normalizeIndicatorStatus(rawStatus?: string | null): IndicatorStatusTone {
  if (!rawStatus) {
    return "NA";
  }

  const normalizedKey = rawStatus.trim().toUpperCase().replace(/[\s-]+/g, "_");
  return statusAliasMap[normalizedKey] ?? "NA";
}

export function getIndicatorStatusVisual(rawStatus?: string | null) {
  const tone = normalizeIndicatorStatus(rawStatus);
  return {
    tone,
    ...statusVisualMap[tone],
  };
}

export function createStatusCounts() {
  return {
    NA: 0,
    NOT_MET: 0,
    COMPLETED: 0,
    IN_PROCESS: 0,
    UNDER_REVIEW: 0,
  } satisfies Record<IndicatorStatusTone, number>;
}

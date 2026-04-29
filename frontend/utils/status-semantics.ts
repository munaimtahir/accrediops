import { EvidenceApprovalStatus, ProjectStatus, RecurringInstanceStatus } from "@/types";

export type StatusSemanticTone = "green" | "yellow" | "red" | "blue" | "grey";

type StatusSemanticVisual = {
  label: string;
  meaning: string;
  badgeClassName: string;
  swatchClassName: string;
};

const semanticVisuals: Record<StatusSemanticTone, StatusSemanticVisual> = {
  green: {
    label: "Completed",
    meaning: "Work is complete and accepted.",
    badgeClassName: "border-emerald-300 bg-emerald-100 text-emerald-900",
    swatchClassName: "bg-emerald-500",
  },
  yellow: {
    label: "In progress",
    meaning: "Work is actively in progress.",
    badgeClassName: "border-amber-300 bg-amber-100 text-amber-900",
    swatchClassName: "bg-amber-500",
  },
  red: {
    label: "Not met",
    meaning: "Blocked, failed, or needs remediation.",
    badgeClassName: "border-rose-300 bg-rose-100 text-rose-900",
    swatchClassName: "bg-rose-500",
  },
  blue: {
    label: "Under review",
    meaning: "Pending reviewer/approver decision.",
    badgeClassName: "border-sky-300 bg-sky-100 text-sky-900",
    swatchClassName: "bg-sky-500",
  },
  grey: {
    label: "N/A",
    meaning: "Not applicable or not started.",
    badgeClassName: "border-slate-300 bg-slate-100 text-slate-700",
    swatchClassName: "bg-slate-400",
  },
};

export const globalStatusLegendOrder: StatusSemanticTone[] = [
  "green",
  "yellow",
  "red",
  "blue",
  "grey",
];

export function getStatusSemanticVisual(tone: StatusSemanticTone) {
  return semanticVisuals[tone];
}

export function getProjectStatusTone(status: ProjectStatus): StatusSemanticTone {
  if (status === "COMPLETED") return "green";
  if (status === "ACTIVE") return "yellow";
  if (status === "ARCHIVED") return "grey";
  return "grey";
}

export function getRecurringStatusTone(status: RecurringInstanceStatus): StatusSemanticTone {
  if (status === "APPROVED") return "green";
  if (status === "SUBMITTED") return "blue";
  if (status === "MISSED") return "red";
  return "yellow";
}

export function getEvidenceApprovalTone(status: EvidenceApprovalStatus): StatusSemanticTone {
  if (status === "APPROVED") return "green";
  if (status === "REJECTED") return "red";
  return "blue";
}

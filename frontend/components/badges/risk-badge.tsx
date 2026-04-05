import { cn } from "@/utils/cn";

const toneMap: Record<"LOW" | "MEDIUM" | "HIGH", string> = {
  LOW: "border-emerald-300 bg-emerald-100 text-emerald-900",
  MEDIUM: "border-amber-300 bg-amber-100 text-amber-900",
  HIGH: "border-rose-300 bg-rose-100 text-rose-900",
};

export function RiskBadge({ risk }: { risk: "LOW" | "MEDIUM" | "HIGH" }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide",
        toneMap[risk],
      )}
    >
      Risk {risk}
    </span>
  );
}

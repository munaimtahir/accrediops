import { RecurrenceFrequency } from "@/types";
import { cn } from "@/utils/cn";
import { formatEnumLabel } from "@/utils/format";

export function RecurringBadge({
  isRecurring,
  frequency,
}: {
  isRecurring: boolean;
  frequency?: RecurrenceFrequency;
}) {
  if (!isRecurring) {
    return (
      <span className="inline-flex rounded-full border border-slate-300 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-600">
        One-time
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex rounded-full border border-indigo-300 bg-indigo-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-indigo-900",
      )}
    >
      {frequency ? formatEnumLabel(frequency) : "Recurring"}
    </span>
  );
}

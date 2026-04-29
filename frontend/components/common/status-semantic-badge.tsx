import { StatusSemanticTone, getStatusSemanticVisual } from "@/utils/status-semantics";
import { cn } from "@/utils/cn";

export function StatusSemanticBadge({
  tone,
  className,
}: {
  tone: StatusSemanticTone;
  className?: string;
}) {
  const visual = getStatusSemanticVisual(tone);
  return (
    <span
      className={cn(
        "inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide",
        visual.badgeClassName,
        className,
      )}
      title={visual.meaning}
    >
      {visual.label}
    </span>
  );
}

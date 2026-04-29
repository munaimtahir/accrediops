import { Card } from "@/components/ui/card";
import { globalStatusLegendOrder, getStatusSemanticVisual } from "@/utils/status-semantics";

export function GlobalStatusLegend({ compact = false }: { compact?: boolean }) {
  return (
    <Card className={compact ? "p-3" : "p-4"}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">Global status legend</p>
      <div className={`mt-3 grid gap-2 ${compact ? "sm:grid-cols-2 lg:grid-cols-5" : "sm:grid-cols-2 xl:grid-cols-5"}`}>
        {globalStatusLegendOrder.map((tone) => {
          const visual = getStatusSemanticVisual(tone);
          return (
            <div key={tone} className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
              <span className={`h-3 w-3 rounded-sm ${visual.swatchClassName}`} />
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-800">{visual.label}</p>
                {!compact ? <p className="text-xs text-slate-600">{visual.meaning}</p> : null}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

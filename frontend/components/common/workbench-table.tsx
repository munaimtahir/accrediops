import { ReactNode } from "react";

import { cn } from "@/utils/cn";

interface Column<T> {
  key: string;
  header: string;
  className?: string;
  render: (row: T) => ReactNode;
}

export function WorkbenchTable<T>({
  columns,
  rows,
  rowKey,
  empty,
  dense = true,
}: {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string | number;
  empty?: ReactNode;
  dense?: boolean;
}) {
  if (!rows.length && empty) {
    return <>{empty}</>;
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-panel">
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead className="bg-slate-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={cn(
                    "border-b border-slate-200 px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-600",
                    column.className,
                  )}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={rowKey(row)} className="border-b border-slate-100 last:border-b-0">
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={cn(
                      dense ? "px-4 py-3" : "px-4 py-4",
                      "align-top text-sm text-slate-800",
                      column.className,
                    )}
                  >
                    {column.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

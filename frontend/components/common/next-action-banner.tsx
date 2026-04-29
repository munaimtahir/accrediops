"use client";

import { Card } from "@/components/ui/card";

type NextActionBannerProps = {
  action: string;
  reason: string;
  status: string;
  blockers?: string[];
};

export function NextActionBanner({ action, reason, status, blockers = [] }: NextActionBannerProps) {
  return (
    <Card data-testid="next-action-banner" className="border-sky-200 bg-sky-50 p-4 text-sm text-sky-950">
      <div className="grid gap-3 lg:grid-cols-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-sky-700">Action</p>
          <p className="mt-1 font-semibold">{action}</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-sky-700">Reason</p>
          <p className="mt-1 text-sky-900">{reason}</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-sky-700">Status</p>
          <p className="mt-1 text-sky-900">{status}</p>
        </div>
      </div>
      {blockers.length ? (
        <div className="mt-4 rounded-lg border border-amber-300 bg-amber-50 p-3 text-amber-950">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-amber-700">Cannot proceed because</p>
          <ul className="mt-2 space-y-1">
            {blockers.map((blocker) => (
              <li key={blocker}>- {blocker}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </Card>
  );
}

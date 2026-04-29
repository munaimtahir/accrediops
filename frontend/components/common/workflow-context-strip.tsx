import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/utils/cn";

type WorkflowContextAction = {
  label: string;
  href: string;
};

export function WorkflowContextStrip({
  scope,
  current,
  nextStep,
  actions = [],
  roleHint,
  noActionReason,
}: {
  scope: string;
  current: string;
  nextStep: string;
  actions?: WorkflowContextAction[];
  roleHint?: string;
  noActionReason?: string;
}) {
  const hasAction = nextStep.trim().length > 0 && !/^no action$/i.test(nextStep.trim());
  return (
    <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-4 text-sm text-indigo-950">
      <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-indigo-700">Where you are</p>
      <p className="mt-1 font-semibold">{scope}</p>
      <p className="mt-2 text-indigo-900">
        <span className="font-semibold">Current:</span> {current}
      </p>
      <p className="mt-1 text-indigo-900">
        <span className="font-semibold">Next Action:</span> {hasAction ? nextStep : "No action"}
      </p>
      {!hasAction && noActionReason ? (
        <p className="mt-1 text-xs text-indigo-800">
          <span className="font-semibold">Reason:</span> {noActionReason}
        </p>
      ) : null}
      {roleHint ? <p className="mt-2 text-xs text-indigo-800">{roleHint}</p> : null}
      {actions.length ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {actions.map((action) => (
            <Link
              key={`${action.href}-${action.label}`}
              href={action.href}
              className={cn(buttonVariants({ variant: "secondary", size: "sm" }))}
            >
              {action.label}
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}

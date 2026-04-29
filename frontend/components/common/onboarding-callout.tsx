"use client";

import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";

const STORAGE_PREFIX = "accrediops:onboarding:dismissed:";

export function OnboardingCallout({
  storageKey,
  title,
  description,
}: {
  storageKey: string;
  title: string;
  description: string;
}) {
  const localStorageKey = useMemo(() => `${STORAGE_PREFIX}${storageKey}`, [storageKey]);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const storage = window.localStorage;
    if (!storage || typeof storage.getItem !== "function") return;
    setDismissed(storage.getItem(localStorageKey) === "1");
  }, [localStorageKey]);

  if (dismissed) {
    return null;
  }

  return (
    <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-semibold">{title}</p>
          <p className="mt-1">{description}</p>
        </div>
        <Button
          size="sm"
          variant="secondary"
          onClick={() => {
            if (typeof window !== "undefined") {
              const storage = window.localStorage;
              if (storage && typeof storage.setItem === "function") {
                storage.setItem(localStorageKey, "1");
              }
            }
            setDismissed(true);
          }}
        >
          Dismiss
        </Button>
      </div>
    </div>
  );
}

"use client";

import { KeyboardEvent, ReactNode, useEffect, useId, useRef } from "react";

import { Button } from "@/components/ui/button";

const focusableSelector = [
  "a[href]",
  "button:not([disabled])",
  "textarea:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

export function Modal({
  open,
  title,
  description,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    if (!open) {
      return;
    }
    previousFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const firstFocusable = dialogRef.current?.querySelector<HTMLElement>(focusableSelector);
    window.setTimeout(() => {
      (firstFocusable ?? dialogRef.current)?.focus();
    }, 0);
    return () => {
      previousFocusRef.current?.focus();
    };
  }, [open]);

  if (!open) {
    return null;
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      onClose();
      return;
    }
    if (event.key !== "Tab" || !dialogRef.current) {
      return;
    }
    const focusable = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(focusableSelector)).filter(
      (element) => !element.hasAttribute("disabled") && element.offsetParent !== null,
    );
    if (!focusable.length) {
      event.preventDefault();
      return;
    }
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  return (
    <div className="fixed inset-0 z-40 overflow-y-auto bg-slate-900/30 p-4 pt-16" onKeyDown={handleKeyDown}>
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
        className="mx-auto w-full max-w-2xl rounded-xl border border-slate-200 bg-white shadow-panel outline-none"
      >
        <div className="flex items-start justify-between border-b border-slate-200 px-5 py-4">
          <div>
            <h3 id={titleId} className="text-lg font-semibold text-slate-900">{title}</h3>
            {description ? <p id={descriptionId} className="mt-1 text-sm text-slate-600">{description}</p> : null}
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

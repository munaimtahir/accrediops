"use client";

import { KeyboardEvent, ReactNode, useEffect, useId, useRef } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/utils/cn";

const focusableSelector = [
  "a[href]",
  "button:not([disabled])",
  "textarea:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

export function Drawer({
  open,
  title,
  description,
  onClose,
  children,
  widthClassName = "max-w-3xl",
}: {
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  children: ReactNode;
  widthClassName?: string;
}) {
  const drawerRef = useRef<HTMLElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    if (!open) {
      return;
    }
    previousFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const firstFocusable = drawerRef.current?.querySelector<HTMLElement>(focusableSelector);
    window.setTimeout(() => {
      (firstFocusable ?? drawerRef.current)?.focus();
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
    if (event.key !== "Tab" || !drawerRef.current) {
      return;
    }
    const focusable = Array.from(drawerRef.current.querySelectorAll<HTMLElement>(focusableSelector)).filter(
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
    <div className="fixed inset-0 z-50 bg-slate-900/40" onKeyDown={handleKeyDown}>
      <button
        type="button"
        aria-label="Close drawer overlay"
        className="absolute inset-0 h-full w-full cursor-default"
        onClick={onClose}
      />
      <aside
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
        className={cn(
          "absolute right-0 top-0 h-full w-full overflow-y-auto border-l border-slate-200 bg-white shadow-2xl outline-none",
          widthClassName,
        )}
      >
        <header className="sticky top-0 z-10 border-b border-slate-200 bg-white px-5 py-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 id={titleId} className="text-lg font-semibold text-slate-950">{title}</h2>
              {description ? <p id={descriptionId} className="mt-1 text-sm text-slate-600">{description}</p> : null}
            </div>
            <Button type="button" size="sm" variant="secondary" onClick={onClose}>
              Close
            </Button>
          </div>
        </header>
        <div className="p-5">{children}</div>
      </aside>
    </div>
  );
}

"use client";

import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from "react";

import { cn } from "@/utils/cn";

type ToastTone = "info" | "error" | "success";

interface ToastItem {
  id: number;
  message: string;
  tone: ToastTone;
}

interface ToastContextValue {
  pushToast: (message: string, tone?: ToastTone) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

function ToastViewport({ items }: { items: ToastItem[] }) {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex w-full max-w-sm flex-col gap-2">
      {items.map((item) => (
        <div
          key={item.id}
          className={cn(
            "rounded-lg border px-4 py-3 text-sm shadow-panel",
            item.tone === "error" && "border-rose-300 bg-rose-50 text-rose-900",
            item.tone === "success" && "border-emerald-300 bg-emerald-50 text-emerald-900",
            item.tone === "info" && "border-slate-300 bg-white text-slate-900",
          )}
        >
          {item.message}
        </div>
      ))}
    </div>
  );
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const pushToast = useCallback((message: string, tone: ToastTone = "info") => {
    const item: ToastItem = {
      id: Date.now() + Math.floor(Math.random() * 1000),
      message,
      tone,
    };

    setItems((current) => [...current, item]);

    window.setTimeout(() => {
      setItems((current) => current.filter((entry) => entry.id !== item.id));
    }, 3500);
  }, []);

  const value = useMemo(() => ({ pushToast }), [pushToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport items={items} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    return {
      pushToast: () => undefined,
    };
  }

  return context;
}

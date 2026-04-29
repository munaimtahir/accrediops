import { ReactNode } from "react";

import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[#f5f7fb] text-slate-900">
      <Sidebar />
      <div className="min-w-0 flex-1">
        <Topbar />
        <main id="main-content" tabIndex={-1} className="min-h-[calc(100vh-81px)] p-6 outline-none">
          <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-6">{children}</div>
        </main>
      </div>
    </div>
  );
}

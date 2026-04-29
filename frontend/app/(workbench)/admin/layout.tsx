import { ReactNode } from "react";

import { AdminAreaGuard } from "@/components/providers/admin-area-guard";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <AdminAreaGuard>{children}</AdminAreaGuard>;
}

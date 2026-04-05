import { ReactNode } from "react";

import { Card } from "@/components/ui/card";
import { cn } from "@/utils/cn";

export function FilterBar({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <Card className={cn("p-4", className)}>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">{children}</div>
    </Card>
  );
}

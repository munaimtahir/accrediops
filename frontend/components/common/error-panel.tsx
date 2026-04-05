import { AlertTriangle } from "lucide-react";

import { Card } from "@/components/ui/card";

export function ErrorPanel({ message }: { message: string }) {
  return (
    <Card className="border-rose-200 bg-rose-50 p-4 text-rose-900">
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 h-4 w-4" />
        <div>
          <h3 className="text-sm font-semibold">Request failed</h3>
          <p className="mt-1 text-sm">{message}</p>
        </div>
      </div>
    </Card>
  );
}

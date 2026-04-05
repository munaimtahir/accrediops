import { UserSummary } from "@/types";
import { formatUserName } from "@/utils/format";

export function UserPill({ user }: { user?: UserSummary | null }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-3 py-1 text-xs font-medium text-slate-700">
      <span className="h-2 w-2 rounded-full bg-slate-400" />
      {formatUserName(user)}
    </span>
  );
}

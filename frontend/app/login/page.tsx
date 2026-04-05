import { Suspense } from "react";

import { LoginScreen } from "@/components/screens/login-screen";
import { LoadingSkeleton } from "@/components/common/loading-skeleton";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center p-6">
          <LoadingSkeleton className="h-96 w-full max-w-md" />
        </div>
      }
    >
      <LoginScreen />
    </Suspense>
  );
}

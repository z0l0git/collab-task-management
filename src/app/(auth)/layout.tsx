"use client";

import { SquareKanban } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

import { Spinner } from "@/components/ui";
import { useAuth } from "@/features/auth/AuthProvider";

const AuthLayout = ({ children }: { children: ReactNode }) => {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) router.replace("/workspaces");
  }, [loading, user, router]);

  if (loading || user) {
    return (
      <div className="text-ink-subtle flex flex-1 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex items-center justify-center gap-2">
          <span className="bg-accent text-on-accent rounded-sm p-1">
            <SquareKanban className="size-4" aria-hidden="true" />
          </span>
          <span className="text-ink font-medium">Taskboard</span>
        </div>
        {children}
      </div>
    </div>
  );
};

export default AuthLayout;

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
    <div className="bg-canvas flex flex-1 flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-xs">
        <span className="bg-accent text-on-accent mx-auto mb-6 flex size-10 items-center justify-center rounded-lg">
          <SquareKanban className="size-5" aria-hidden="true" />
        </span>
        {children}
      </div>
    </div>
  );
};

export default AuthLayout;

"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

import { AppShell } from "@/components/layout/AppShell";
import { Spinner } from "@/components/ui";
import { useAuth } from "@/features/auth/AuthProvider";

const AppLayout = ({ children }: { children: ReactNode }) => {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <div className="text-ink-subtle flex flex-1 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return <AppShell>{children}</AppShell>;
};

export default AppLayout;

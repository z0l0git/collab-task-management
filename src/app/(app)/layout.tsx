"use client";

import { LogOut, SquareKanban } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { Button, Spinner } from "@/components/ui";
import { useAuth } from "@/features/auth/AuthProvider";
import { signOut } from "@/features/auth/authService";

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

  return (
    <>
      <header className="border-hairline bg-canvas sticky top-0 z-10 h-14 border-b">
        <div className="mx-auto flex h-full max-w-5xl items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <span className="bg-accent text-on-accent rounded-sm p-1">
              <SquareKanban className="size-4" aria-hidden="true" />
            </span>
            <span className="text-ink font-medium">Taskboard</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-body-sm text-ink-subtle hidden sm:inline">
              {user.displayName || user.email}
            </span>
            <ThemeToggle />
            <Button
              variant="secondary"
              leadingIcon={<LogOut className="size-4" aria-hidden="true" />}
              onClick={() => void signOut()}
            >
              Sign out
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10 sm:px-6">
        {children}
      </main>
    </>
  );
};

export default AppLayout;

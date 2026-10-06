"use client";

import { TriangleAlert } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

import { RouteState } from "@/components/layout/RouteState";
import { Button, buttonClasses } from "@/components/ui";

const AppError = ({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) => {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <RouteState
      icon={TriangleAlert}
      title="Something went wrong"
      description="This page hit an unexpected error. Try again, or go back to your workspaces."
    >
      <Button onClick={retry}>Try again</Button>
      <Link
        href="/workspaces"
        className={buttonClasses({ variant: "secondary" })}
      >
        All workspaces
      </Link>
    </RouteState>
  );
};

export default AppError;

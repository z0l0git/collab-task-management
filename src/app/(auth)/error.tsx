"use client";

import { TriangleAlert } from "lucide-react";
import { useEffect } from "react";

import { RouteState } from "@/components/layout/RouteState";
import { Button } from "@/components/ui";

const AuthError = ({
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
      description="We couldn't load this page. Check your connection and try again."
    >
      <Button onClick={retry}>Try again</Button>
    </RouteState>
  );
};

export default AuthError;

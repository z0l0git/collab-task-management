"use client";

import "./globals.css";

import { TriangleAlert } from "lucide-react";
import { useEffect } from "react";

import { RouteState } from "@/components/layout/RouteState";
import { themeScript } from "@/components/theme/themeScript";
import { Button } from "@/components/ui";

const GlobalError = ({
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
    <html lang="en" suppressHydrationWarning className="h-full">
      <head>
        <title>Something went wrong · Taskboard</title>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="bg-canvas flex min-h-full flex-col">
        <RouteState
          icon={TriangleAlert}
          title="Something went wrong"
          description="Taskboard couldn't start. Reload the page to try again."
        >
          <Button onClick={retry}>Reload</Button>
        </RouteState>
      </body>
    </html>
  );
};

export default GlobalError;

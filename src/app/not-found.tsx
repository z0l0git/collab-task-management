import { FileQuestion } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { RouteState } from "@/components/layout/RouteState";
import { buttonClasses } from "@/components/ui";

export const metadata: Metadata = { title: "Page not found" };

const NotFound = () => (
  <main className="bg-canvas flex flex-1 flex-col">
    <RouteState
      icon={FileQuestion}
      title="Page not found"
      description="This page doesn't exist or has moved. Check the address, or head back to your workspaces."
    >
      <Link href="/workspaces" className={buttonClasses()}>
        Go to workspaces
      </Link>
    </RouteState>
  </main>
);

export default NotFound;

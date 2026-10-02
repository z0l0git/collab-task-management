import { CircleDashed, SquareKanban } from "lucide-react";

import { ThemeToggle } from "@/components/theme/ThemeToggle";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  EmptyState,
  Input,
  Select,
  Spinner,
  Textarea,
} from "@/components/ui";

import { ModalPreview } from "./ModalPreview";

const SURFACES = [
  { token: "canvas", className: "bg-canvas", use: "page" },
  { token: "surface-1", className: "bg-surface-1", use: "cards, columns" },
  { token: "surface-2", className: "bg-surface-2", use: "raised, hover" },
  { token: "surface-3", className: "bg-surface-3", use: "popovers" },
  { token: "surface-4", className: "bg-surface-4", use: "dragging" },
] as const;

const HomePage = () => {
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
            <ThemeToggle />
            <Button variant="secondary" className="hidden sm:inline-flex">
              Sign in
            </Button>
            <Button>Get started</Button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-16 sm:px-6">
        <p className="text-eyebrow text-ink-subtle uppercase">Sprint 0</p>
        <h1 className="text-display-md text-ink mt-3 max-w-2xl text-balance">
          A foundation for collaborative work
        </h1>
        <p className="text-body-lg text-ink-subtle mt-4 max-w-xl">
          Next.js, strict TypeScript, Firebase and the emulator suite are wired
          up. Authentication lands next.
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          <Badge variant="accent" withDot>
            Next.js 16
          </Badge>
          <Badge withDot>TypeScript strict</Badge>
          <Badge withDot>Tailwind v4</Badge>
          <Badge withDot>Firebase</Badge>
          <Badge withDot>Emulators</Badge>
        </div>

        <section className="mt-20 space-y-5" aria-labelledby="ladder">
          <div>
            <h2 id="ladder" className="text-headline text-ink">
              Surface ladder
            </h2>
            <p className="text-body-sm text-ink-subtle mt-1.5 max-w-xl">
              Depth is a step up the ladder plus a 1px hairline — not a shadow.
              The modal is the single exception.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            {SURFACES.map(({ token, className, use }) => (
              <div
                key={token}
                className="border-hairline overflow-hidden rounded-lg border"
              >
                <div className={`${className} h-16`} />
                <div className="border-hairline bg-surface-1 border-t px-3 py-2">
                  <p className="text-mono text-ink font-mono">{token}</p>
                  <p className="text-caption text-ink-subtle mt-0.5">{use}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-20 space-y-5" aria-labelledby="product-colour">
          <div>
            <h2 id="product-colour" className="text-headline text-ink">
              Priority and status
            </h2>
            <p className="text-body-sm text-ink-subtle mt-1.5 max-w-xl">
              The product colour layer the guide doesn&apos;t cover. Badge-only,
              never a chrome surface, and always paired with a text label so
              colour is never the sole signal.
            </p>
          </div>
          <Card>
            <CardContent className="space-y-4 pt-6">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-caption text-ink-subtle w-16">
                  Priority
                </span>
                <Badge variant="priority-low" withDot>
                  Low
                </Badge>
                <Badge variant="priority-medium" withDot>
                  Medium
                </Badge>
                <Badge variant="priority-high" withDot>
                  High
                </Badge>
                <Badge variant="priority-urgent" withDot>
                  Urgent
                </Badge>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-caption text-ink-subtle w-16">
                  Status
                </span>
                <Badge variant="status-todo" withDot>
                  Todo
                </Badge>
                <Badge variant="status-in_progress" withDot>
                  In progress
                </Badge>
                <Badge variant="status-done" withDot>
                  Done
                </Badge>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="mt-20 space-y-5" aria-labelledby="components">
          <h2 id="components" className="text-headline text-ink">
            Components
          </h2>

          <Card>
            <CardHeader>
              <CardTitle>Buttons</CardTitle>
              <CardDescription>
                Lavender is spent only on the primary action. Everything else
                lifts a surface step on hover.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap items-center gap-2">
              <Button>Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="danger">Delete</Button>
              <Button isLoading>Saving</Button>
              <Button disabled>Disabled</Button>
              <ModalPreview />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Form controls</CardTitle>
              <CardDescription>
                Labels, hints and errors are wired up for screen readers in one
                shared wrapper. Focus is a single rule for the whole app.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Task title"
                placeholder="Write the README"
                hint="Short and specific."
                required
              />
              <Select
                label="Priority"
                defaultValue="medium"
                options={[
                  { value: "low", label: "Low" },
                  { value: "medium", label: "Medium" },
                  { value: "high", label: "High" },
                  { value: "urgent", label: "Urgent" },
                ]}
              />
              <Input
                label="Due date"
                type="date"
                error="Due date can't be in the past."
              />
              <Textarea
                label="Description"
                placeholder="What needs to happen?"
                rows={3}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Feedback states</CardTitle>
              <CardDescription>
                Every async path in the app gets a loading, empty and error
                state.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="text-ink-subtle flex items-center gap-4">
                <Spinner size="sm" />
                <Spinner />
                <Spinner size="lg" />
              </div>
              <EmptyState
                icon={CircleDashed}
                title="No tasks yet"
                description="Tasks you create in this workspace will show up here."
                action={<Button>Create task</Button>}
              />
            </CardContent>
          </Card>
        </section>
      </main>
    </>
  );
};

export default HomePage;

"use client";

import { Plus, X } from "lucide-react";
import { useState, type FormEvent } from "react";

import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
} from "@/components/ui";
import { toUserMessage } from "@/lib/firebase";

import { addLabel, removeLabel } from "./workspaceService";
import type { Workspace } from "./types";

const MAX_LABELS = 50;
const MAX_LABEL_LENGTH = 30;

export const LabelsPanel = ({ workspace }: { workspace: Workspace }) => {
  const [label, setLabel] = useState("");
  const [inputError, setInputError] = useState("");
  const [actionError, setActionError] = useState("");
  const [pending, setPending] = useState(false);

  const onAdd = async (event: FormEvent) => {
    event.preventDefault();
    const trimmed = label.trim();
    if (!trimmed) {
      setInputError("Enter a label name.");
      return;
    }
    if (
      workspace.labels.some(
        (existing) => existing.toLowerCase() === trimmed.toLowerCase(),
      )
    ) {
      setInputError("That label already exists.");
      return;
    }
    if (workspace.labels.length >= MAX_LABELS) {
      setInputError(`A workspace can have up to ${MAX_LABELS} labels.`);
      return;
    }

    setInputError("");
    setPending(true);
    try {
      await addLabel(workspace.id, trimmed);
      setLabel("");
    } catch (error) {
      setInputError(toUserMessage(error, "We couldn't add that label."));
    } finally {
      setPending(false);
    }
  };

  const onRemove = async (name: string) => {
    setActionError("");
    try {
      await removeLabel(workspace.id, name);
    } catch (error) {
      setActionError(toUserMessage(error, "We couldn't remove that label."));
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Labels</CardTitle>
        <CardDescription>
          Members tag tasks with these. Removing one keeps it on tasks that
          already use it.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={onAdd} className="flex items-start gap-2">
          <Input
            className="flex-1"
            placeholder="e.g. bug, design, backend"
            aria-label="Label name"
            value={label}
            onChange={(event) => setLabel(event.target.value)}
            error={inputError}
            maxLength={MAX_LABEL_LENGTH}
          />
          <Button
            type="submit"
            isLoading={pending}
            leadingIcon={<Plus className="size-4" aria-hidden="true" />}
          >
            Add
          </Button>
        </form>

        {workspace.labels.length === 0 ? (
          <p className="text-caption text-ink-subtle">No labels yet.</p>
        ) : (
          <ul className="flex flex-wrap gap-1.5">
            {workspace.labels.map((name) => (
              <li
                key={name}
                className="border-hairline bg-surface-2 text-caption text-ink-muted inline-flex items-center gap-1 rounded-full border py-0.5 pr-1 pl-2.5 font-medium"
              >
                {name}
                <button
                  type="button"
                  aria-label={`Remove label ${name}`}
                  onClick={() => void onRemove(name)}
                  className="hover:bg-surface-3 hover:text-ink rounded-full p-0.5 transition-colors"
                >
                  <X className="size-3" aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        )}

        {actionError ? (
          <p
            role="alert"
            className="bg-danger/10 text-danger text-body-sm rounded-md px-3 py-2"
          >
            {actionError}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
};

"use client";

import { useState, type FormEvent } from "react";

import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Textarea,
} from "@/components/ui";
import { toUserMessage } from "@/lib/firebase";
import { updateWorkspace } from "@/services/workspaceService";
import type { Workspace } from "@/types/workspace";

export const WorkspaceSettings = ({ workspace }: { workspace: Workspace }) => {
  const [name, setName] = useState(workspace.name);
  const [description, setDescription] = useState(workspace.description);
  const [nameError, setNameError] = useState("");
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [pending, setPending] = useState(false);

  const dirty =
    name !== workspace.name || description !== workspace.description;

  const onSave = async (event: FormEvent) => {
    event.preventDefault();
    if (!name.trim()) {
      setNameError("Please name your workspace.");
      return;
    }

    setNameError("");
    setError("");
    setPending(true);
    try {
      await updateWorkspace(workspace.id, { name, description });
      setSaved(true);
    } catch (caught) {
      setError(toUserMessage(caught, "We couldn't save those changes."));
    } finally {
      setPending(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>General</CardTitle>
        <CardDescription>The workspace name and description.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSave} className="space-y-4">
          <Input
            label="Name"
            value={name}
            onChange={(event) => {
              setName(event.target.value);
              setSaved(false);
            }}
            error={nameError}
            maxLength={80}
            required
          />
          <Textarea
            label="Description"
            value={description}
            onChange={(event) => {
              setDescription(event.target.value);
              setSaved(false);
            }}
            maxLength={500}
            rows={3}
          />

          {error ? (
            <p
              role="alert"
              className="bg-danger/10 text-danger text-body-sm rounded-md px-3 py-2"
            >
              {error}
            </p>
          ) : null}

          <div className="flex items-center gap-3">
            <Button type="submit" isLoading={pending} disabled={!dirty}>
              Save changes
            </Button>
            {saved && !dirty ? (
              <span role="status" className="text-caption text-success">
                Saved
              </span>
            ) : null}
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

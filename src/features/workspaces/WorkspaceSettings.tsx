"use client";

import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Modal,
  Textarea,
} from "@/components/ui";
import { toUserMessage } from "@/lib/firebase";

import { deleteWorkspace, updateWorkspace } from "./workspaceService";
import type { Workspace } from "./types";

export const WorkspaceSettings = ({ workspace }: { workspace: Workspace }) => {
  const router = useRouter();
  const [name, setName] = useState(workspace.name);
  const [description, setDescription] = useState(workspace.description);
  const [nameError, setNameError] = useState("");
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [pending, setPending] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

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

  const onDelete = async () => {
    setError("");
    setDeleting(true);
    try {
      await deleteWorkspace(workspace.id);
      router.replace("/workspaces");
    } catch (caught) {
      setError(toUserMessage(caught, "We couldn't delete this workspace."));
      setDeleting(false);
      setConfirmingDelete(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Settings</CardTitle>
          <CardDescription>Only the owner can change these.</CardDescription>
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

      <Card className="border-danger/40">
        <CardHeader>
          <CardTitle>Delete workspace</CardTitle>
          <CardDescription>
            Removes the workspace and everything in it, for every member. This
            cannot be undone.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="danger"
            leadingIcon={<Trash2 className="size-4" aria-hidden="true" />}
            onClick={() => setConfirmingDelete(true)}
          >
            Delete workspace
          </Button>
        </CardContent>
      </Card>

      <Modal
        open={confirmingDelete}
        onClose={() => setConfirmingDelete(false)}
        title={`Delete "${workspace.name}"?`}
        description="Every member loses access immediately. This cannot be undone."
        size="sm"
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => setConfirmingDelete(false)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              isLoading={deleting}
              onClick={() => void onDelete()}
            >
              Delete
            </Button>
          </>
        }
      />
    </>
  );
};

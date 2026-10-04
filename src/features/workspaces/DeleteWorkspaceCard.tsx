"use client";

import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Modal,
} from "@/components/ui";
import { toUserMessage } from "@/lib/firebase";

import type { Workspace } from "./types";
import { deleteWorkspace } from "./workspaceService";

export const DeleteWorkspaceCard = ({
  workspace,
}: {
  workspace: Workspace;
}) => {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  const onDelete = async () => {
    setError("");
    setDeleting(true);
    try {
      await deleteWorkspace(workspace.id);
      router.replace("/workspaces");
    } catch (caught) {
      setError(toUserMessage(caught, "We couldn't delete this workspace."));
      setDeleting(false);
      setConfirming(false);
    }
  };

  return (
    <>
      <Card className="border-danger/40">
        <CardHeader>
          <CardTitle>Delete workspace</CardTitle>
          <CardDescription>
            Removes the workspace and everything in it, for every member. This
            cannot be undone.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error ? (
            <p
              role="alert"
              className="bg-danger/10 text-danger text-body-sm rounded-md px-3 py-2"
            >
              {error}
            </p>
          ) : null}
          <Button
            variant="danger"
            leadingIcon={<Trash2 className="size-4" aria-hidden="true" />}
            onClick={() => setConfirming(true)}
          >
            Delete workspace
          </Button>
        </CardContent>
      </Card>

      <Modal
        open={confirming}
        onClose={() => setConfirming(false)}
        title={`Delete "${workspace.name}"?`}
        description="Every member loses access immediately. This cannot be undone."
        size="sm"
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => setConfirming(false)}
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

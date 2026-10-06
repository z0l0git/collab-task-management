"use client";

import { useRouter } from "next/navigation";
import { useId, useState, type FormEvent } from "react";

import { Button, Input, Modal, Textarea } from "@/components/ui";
import { useAuth } from "@/features/auth/AuthProvider";
import { toUserMessage } from "@/lib/firebase";
import { createWorkspace } from "@/services/workspaceService";

export const CreateWorkspaceDialog = ({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) => {
  const { user } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [nameError, setNameError] = useState("");
  const [formError, setFormError] = useState("");
  const [pending, setPending] = useState(false);
  const formId = useId();

  const close = () => {
    setName("");
    setDescription("");
    setNameError("");
    setFormError("");
    onClose();
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!user) return;

    if (!name.trim()) {
      setNameError("Please name your workspace.");
      return;
    }

    setNameError("");
    setFormError("");
    setPending(true);
    try {
      const id = await createWorkspace(user, { name, description });
      close();
      router.push(`/workspaces/${id}`);
    } catch (error) {
      setFormError(toUserMessage(error, "We couldn't create that workspace."));
    } finally {
      setPending(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={close}
      title="New workspace"
      description="A shared space for your team's tasks."
      footer={
        <>
          <Button variant="ghost" onClick={close} disabled={pending}>
            Cancel
          </Button>
          <Button form={formId} type="submit" isLoading={pending}>
            Create workspace
          </Button>
        </>
      }
    >
      <form id={formId} onSubmit={onSubmit} className="space-y-4">
        <Input
          label="Name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          error={nameError}
          maxLength={80}
          required
          data-autofocus
        />
        <Textarea
          label="Description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          hint="Optional."
          maxLength={500}
          rows={3}
        />
        {formError ? (
          <p
            role="alert"
            className="bg-danger/10 text-danger text-body-sm rounded-md px-3 py-2"
          >
            {formError}
          </p>
        ) : null}
      </form>
    </Modal>
  );
};

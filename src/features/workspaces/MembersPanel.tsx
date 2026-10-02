"use client";

import { LogOut, UserMinus, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
} from "@/components/ui";
import { useAuth } from "@/features/auth/AuthProvider";
import { toUserMessage } from "@/lib/firebase";

import { addMemberByEmail, removeMember } from "./workspaceService";
import { isOwner, memberList, type Workspace } from "./types";

export const MembersPanel = ({ workspace }: { workspace: Workspace }) => {
  const { user } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [inviteError, setInviteError] = useState("");
  const [actionError, setActionError] = useState("");
  const [pending, setPending] = useState(false);
  const [leaving, setLeaving] = useState(false);

  const viewerIsOwner = isOwner(workspace, user?.uid);
  const members = memberList(workspace);

  const onAdd = async (event: FormEvent) => {
    event.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) {
      setInviteError("Enter the member's email.");
      return;
    }
    if (
      workspace.memberIds.some(
        (uid) => workspace.members[uid]?.email === trimmed,
      )
    ) {
      setInviteError("That person is already a member.");
      return;
    }

    setInviteError("");
    setPending(true);
    try {
      await addMemberByEmail(workspace.id, trimmed);
      setEmail("");
    } catch (error) {
      setInviteError(
        error instanceof Error && error.message === "NO_ACCOUNT"
          ? "No account found with that email. They need to sign up first."
          : toUserMessage(error, "We couldn't add that member."),
      );
    } finally {
      setPending(false);
    }
  };

  const onRemove = async (uid: string) => {
    setActionError("");
    try {
      await removeMember(workspace.id, uid);
    } catch (error) {
      setActionError(toUserMessage(error, "We couldn't remove that member."));
    }
  };

  const onLeave = async () => {
    if (!user) return;
    setActionError("");
    setLeaving(true);
    try {
      await removeMember(workspace.id, user.uid);
      router.replace("/workspaces");
    } catch (error) {
      setActionError(
        toUserMessage(error, "We couldn't remove you from this workspace."),
      );
      setLeaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Members</CardTitle>
        <CardDescription>
          {viewerIsOwner
            ? "Add people by the email they signed up with."
            : "Everyone with access to this workspace."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {viewerIsOwner ? (
          <form onSubmit={onAdd} className="flex items-start gap-2">
            <Input
              className="flex-1"
              type="email"
              placeholder="teammate@example.com"
              aria-label="Member email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              error={inviteError}
            />
            <Button
              type="submit"
              isLoading={pending}
              leadingIcon={<UserPlus className="size-4" aria-hidden="true" />}
            >
              Add
            </Button>
          </form>
        ) : null}

        <ul className="divide-hairline divide-y">
          {members.map((member) => (
            <li
              key={member.uid}
              className="flex items-center justify-between gap-3 py-2.5"
            >
              <div className="min-w-0">
                <p className="text-ink truncate font-medium">
                  {member.displayName}
                  {member.uid === user?.uid ? (
                    <span className="text-ink-subtle font-normal"> (you)</span>
                  ) : null}
                </p>
                <p className="text-caption text-ink-subtle truncate">
                  {member.email}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Badge variant={member.role === "owner" ? "accent" : "neutral"}>
                  {member.role === "owner" ? "Owner" : "Member"}
                </Badge>
                {viewerIsOwner && member.role !== "owner" ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    aria-label={`Remove ${member.displayName}`}
                    onClick={() => void onRemove(member.uid)}
                  >
                    <UserMinus className="size-4" aria-hidden="true" />
                  </Button>
                ) : null}
              </div>
            </li>
          ))}
        </ul>

        {actionError ? (
          <p
            role="alert"
            className="bg-danger/10 text-danger text-body-sm rounded-md px-3 py-2"
          >
            {actionError}
          </p>
        ) : null}

        {!viewerIsOwner ? (
          <Button
            variant="secondary"
            isLoading={leaving}
            leadingIcon={<LogOut className="size-4" aria-hidden="true" />}
            onClick={() => void onLeave()}
          >
            Leave workspace
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
};

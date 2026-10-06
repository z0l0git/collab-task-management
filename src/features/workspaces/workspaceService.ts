import type { User } from "firebase/auth";
import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  deleteField,
  doc,
  getDocs,
  limit,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";

import type { TaskStatus } from "@/features/tasks/statuses";
import { getFirebaseDb } from "@/lib/firebase";

import type { WorkspaceMember } from "./types";
import { statusesToFirestore } from "./workspaceConverter";

const workspacesRef = () => collection(getFirebaseDb(), "workspaces");

const workspaceRef = (workspaceId: string) =>
  doc(getFirebaseDb(), "workspaces", workspaceId);

const memberFromUser = (user: User, role: WorkspaceMember["role"]) => ({
  role,
  displayName: user.displayName?.trim() || user.email || "Member",
  email: user.email ?? "",
  photoURL: user.photoURL,
});

export const createWorkspace = async (
  user: User,
  input: { name: string; description: string },
) => {
  const created = await addDoc(workspacesRef(), {
    name: input.name.trim(),
    description: input.description.trim(),
    ownerId: user.uid,
    memberIds: [user.uid],
    members: { [user.uid]: memberFromUser(user, "owner") },
    labels: [],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return created.id;
};

export const updateWorkspace = (
  workspaceId: string,
  input: { name: string; description: string },
) =>
  updateDoc(workspaceRef(workspaceId), {
    name: input.name.trim(),
    description: input.description.trim(),
    updatedAt: serverTimestamp(),
  });

export const findUserByEmail = async (email: string) => {
  const matches = await getDocs(
    query(
      collection(getFirebaseDb(), "users"),
      where("emailLower", "==", email.trim().toLowerCase()),
      limit(1),
    ),
  );
  const found = matches.docs[0];
  if (!found) return null;

  const data = found.data();
  return {
    uid: found.id,
    displayName: typeof data.displayName === "string" ? data.displayName : "",
    email: typeof data.email === "string" ? data.email : "",
    photoURL: typeof data.photoURL === "string" ? data.photoURL : null,
  };
};

export const addMemberByEmail = async (workspaceId: string, email: string) => {
  const profile = await findUserByEmail(email);
  if (!profile) {
    throw new Error("NO_ACCOUNT");
  }

  await updateDoc(workspaceRef(workspaceId), {
    memberIds: arrayUnion(profile.uid),
    [`members.${profile.uid}`]: {
      role: "member",
      displayName: profile.displayName,
      email: profile.email,
      photoURL: profile.photoURL,
    },
    updatedAt: serverTimestamp(),
  });
};

export const removeMember = (workspaceId: string, uid: string) =>
  updateDoc(workspaceRef(workspaceId), {
    memberIds: arrayRemove(uid),
    [`members.${uid}`]: deleteField(),
    updatedAt: serverTimestamp(),
  });

export const addLabel = (workspaceId: string, label: string) =>
  updateDoc(workspaceRef(workspaceId), {
    labels: arrayUnion(label.trim()),
    updatedAt: serverTimestamp(),
  });

export const removeLabel = (workspaceId: string, label: string) =>
  updateDoc(workspaceRef(workspaceId), {
    labels: arrayRemove(label),
    updatedAt: serverTimestamp(),
  });

export const updateStatuses = (workspaceId: string, statuses: TaskStatus[]) =>
  updateDoc(workspaceRef(workspaceId), {
    statuses: statusesToFirestore(statuses),
    updatedAt: serverTimestamp(),
  });

export const deleteWorkspace = (workspaceId: string) =>
  deleteDoc(workspaceRef(workspaceId));

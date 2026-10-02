"use client";

import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { useEffect, useState } from "react";

import { useAuth } from "@/features/auth/AuthProvider";
import { getFirebaseDb, toUserMessage } from "@/lib/firebase";

import { workspaceConverter } from "./workspaceConverter";
import type { Workspace } from "./types";

type ListState = {
  workspaces: Workspace[];
  loading: boolean;
  error: string;
};

export const useWorkspaces = () => {
  const { user, loading: authLoading } = useAuth();
  const [state, setState] = useState<ListState>({
    workspaces: [],
    loading: true,
    error: "",
  });

  useEffect(() => {
    if (authLoading || !user) return;

    return onSnapshot(
      query(
        collection(getFirebaseDb(), "workspaces").withConverter(
          workspaceConverter,
        ),
        where("memberIds", "array-contains", user.uid),
        orderBy("updatedAt", "desc"),
      ),
      (snapshot) =>
        setState({
          workspaces: snapshot.docs.map((entry) => entry.data()),
          loading: false,
          error: "",
        }),
      (error) =>
        setState({
          workspaces: [],
          loading: false,
          error: toUserMessage(error, "We couldn't load your workspaces."),
        }),
    );
  }, [user, authLoading]);

  if (!authLoading && !user) {
    return { workspaces: [], loading: false, error: "" };
  }

  return state;
};

type DetailState = {
  workspace: Workspace | null;
  loading: boolean;
  error: string;
  notFound: boolean;
};

export const useWorkspace = (workspaceId: string) => {
  const { user, loading: authLoading } = useAuth();
  const [state, setState] = useState<DetailState>({
    workspace: null,
    loading: true,
    error: "",
    notFound: false,
  });

  useEffect(() => {
    if (authLoading || !user) return;

    return onSnapshot(
      doc(getFirebaseDb(), "workspaces", workspaceId).withConverter(
        workspaceConverter,
      ),
      (snapshot) =>
        setState({
          workspace: snapshot.exists() ? snapshot.data() : null,
          loading: false,
          error: "",
          notFound: !snapshot.exists(),
        }),
      (error) =>
        setState({
          workspace: null,
          loading: false,
          error: toUserMessage(error, "We couldn't load this workspace."),
          notFound: false,
        }),
    );
  }, [workspaceId, user, authLoading]);

  return state;
};

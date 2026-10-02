"use client";

import { onAuthStateChanged, type User } from "firebase/auth";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import { getFirebaseAuth } from "@/lib/firebase";

type AuthState = {
  user: User | null;
  loading: boolean;
};

const AuthContext = createContext<AuthState>({ user: null, loading: true });

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<AuthState>({ user: null, loading: true });

  useEffect(
    () =>
      onAuthStateChanged(getFirebaseAuth(), (user) =>
        setState({ user, loading: false }),
      ),
    [],
  );

  return <AuthContext value={state}>{children}</AuthContext>;
};

export const useAuth = () => useContext(AuthContext);

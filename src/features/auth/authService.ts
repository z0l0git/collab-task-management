import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  updateProfile,
  type User,
} from "firebase/auth";
import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";

import { auth, db } from "@/lib/firebase";

const userRef = (uid: string) => doc(db, "users", uid);

const fallbackName = (user: User) =>
  user.displayName?.trim() || user.email?.split("@")[0] || "Member";

export const syncUserProfile = async (user: User, displayName?: string) => {
  const ref = userRef(user.uid);
  const email = user.email ?? "";
  const profile = {
    id: user.uid,
    displayName: displayName?.trim() || fallbackName(user),
    email,
    emailLower: email.toLowerCase(),
    photoURL: user.photoURL,
    updatedAt: serverTimestamp(),
  };

  const existing = await getDoc(ref);
  if (existing.exists()) {
    await updateDoc(ref, profile);
  } else {
    await setDoc(ref, { ...profile, createdAt: serverTimestamp() });
  }
};

export const signUpWithEmail = async (
  displayName: string,
  email: string,
  password: string,
) => {
  const { user } = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(user, { displayName: displayName.trim() });
  await syncUserProfile(user, displayName);
};

export const signInWithEmail = async (email: string, password: string) => {
  const { user } = await signInWithEmailAndPassword(auth, email, password);
  await syncUserProfile(user);
};

export const signInWithGoogle = async () => {
  const { user } = await signInWithPopup(auth, new GoogleAuthProvider());
  await syncUserProfile(user);
};

export const signOut = () => firebaseSignOut(auth);

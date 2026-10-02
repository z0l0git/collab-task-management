import { FirebaseError } from "firebase/app";

const FALLBACK_MESSAGE = "Something went wrong. Please try again.";

const MESSAGES: Record<string, string> = {
  "auth/email-already-in-use": "That email address is already registered.",
  "auth/invalid-email": "That email address doesn't look right.",
  "auth/weak-password": "Password must be at least 6 characters.",
  "auth/missing-password": "Please enter a password.",
  "auth/invalid-credential": "Incorrect email or password.",
  "auth/user-not-found": "Incorrect email or password.",
  "auth/wrong-password": "Incorrect email or password.",
  "auth/user-disabled": "This account has been disabled.",
  "auth/too-many-requests":
    "Too many attempts. Please wait a moment and try again.",
  "auth/popup-closed-by-user":
    "The sign-in window was closed before finishing.",
  "auth/cancelled-popup-request":
    "The sign-in window was closed before finishing.",
  "auth/popup-blocked":
    "Your browser blocked the sign-in window. Allow pop-ups and try again.",
  "auth/account-exists-with-different-credential":
    "An account with this email already exists. Sign in with your original method.",
  "auth/network-request-failed":
    "Can't reach the server. Check your connection and try again.",
  "auth/requires-recent-login": "Please sign in again to continue.",
  "auth/unauthorized-domain":
    "This domain isn't authorised for sign-in. Check the Firebase console.",

  "permission-denied": "You don't have permission to do that.",
  "not-found": "We couldn't find that item. It may have been deleted.",
  "already-exists": "That item already exists.",
  "failed-precondition":
    "That action isn't possible right now. Please refresh and try again.",
  "resource-exhausted": "The service is busy. Please try again shortly.",
  unauthenticated: "Please sign in to continue.",
  unavailable: "Can't reach the server. Check your connection and try again.",
  cancelled: "The request was cancelled.",
  "deadline-exceeded": "The request took too long. Please try again.",
  "invalid-argument": "Some of the information sent was invalid.",

  "storage/unauthorized": "You don't have permission to access this file.",
  "storage/object-not-found": "That file no longer exists.",
  "storage/canceled": "The upload was cancelled.",
  "storage/quota-exceeded": "Storage limit reached. Please contact the owner.",
  "storage/retry-limit-exceeded":
    "The upload timed out. Check your connection and try again.",
  "storage/invalid-checksum": "The file was corrupted in transit. Try again.",
  "storage/unauthenticated": "Please sign in to upload files.",
};

export function isFirebaseError(error: unknown): error is FirebaseError {
  return error instanceof FirebaseError;
}

export function isPermissionDenied(error: unknown): boolean {
  return (
    isFirebaseError(error) &&
    (error.code === "permission-denied" ||
      error.code === "storage/unauthorized")
  );
}

export function toUserMessage(
  error: unknown,
  fallback = FALLBACK_MESSAGE,
): string {
  if (isFirebaseError(error)) {
    return MESSAGES[error.code] ?? fallback;
  }

  return fallback;
}

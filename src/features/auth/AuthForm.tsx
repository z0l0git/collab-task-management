"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { Button, Input } from "@/components/ui";
import { toUserMessage } from "@/lib/firebase";
import {
  signInWithEmail,
  signInWithGoogle,
  signUpWithEmail,
} from "@/services/authService";

import { GoogleButton } from "./GoogleButton";

type Mode = "login" | "signup";

type FieldErrors = {
  displayName?: string;
  email?: string;
  password?: string;
};

const validate = (mode: Mode, values: Record<string, string>) => {
  const errors: FieldErrors = {};
  if (mode === "signup" && !values.displayName?.trim()) {
    errors.displayName = "Please enter your name.";
  }
  if (!values.email?.trim()) {
    errors.email = "Please enter your email.";
  }
  if (!values.password) {
    errors.password = "Please enter a password.";
  } else if (mode === "signup" && values.password.length < 6) {
    errors.password = "Password must be at least 6 characters.";
  }
  return errors;
};

export const AuthForm = ({ mode }: { mode: Mode }) => {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState("");
  const [pending, setPending] = useState(false);

  const run = async (action: () => Promise<void>) => {
    setFormError("");
    setPending(true);
    try {
      await action();
      router.replace("/workspaces");
    } catch (error) {
      setFormError(toUserMessage(error, "We couldn't sign you in."));
      setPending(false);
    }
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    const errors = validate(mode, { displayName, email, password });
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    void run(() =>
      mode === "signup"
        ? signUpWithEmail(displayName, email, password)
        : signInWithEmail(email, password),
    );
  };

  return (
    <div className="space-y-5">
      <GoogleButton
        disabled={pending}
        onClick={() => void run(signInWithGoogle)}
      />

      <div className="flex items-center gap-3">
        <span className="bg-hairline h-px flex-1" />
        <span className="text-caption text-ink-subtle">or</span>
        <span className="bg-hairline h-px flex-1" />
      </div>

      <form onSubmit={onSubmit} noValidate className="space-y-4">
        {mode === "signup" ? (
          <Input
            label="Name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            error={fieldErrors.displayName}
            autoComplete="name"
            required
          />
        ) : null}

        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={fieldErrors.email}
          autoComplete="email"
          required
        />

        <Input
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={fieldErrors.password}
          hint={mode === "signup" ? "At least 6 characters." : undefined}
          autoComplete={mode === "signup" ? "new-password" : "current-password"}
          required
        />

        {formError ? (
          <p
            role="alert"
            className="bg-danger/10 text-danger text-body-sm rounded-md px-3 py-2"
          >
            {formError}
          </p>
        ) : null}

        <Button type="submit" size="lg" fullWidth isLoading={pending}>
          {mode === "signup" ? "Create account" : "Sign in"}
        </Button>
      </form>

      <p className="text-body-sm text-ink-subtle pt-2 text-center">
        {mode === "signup" ? "Already have an account? " : "New here? "}
        <Link
          href={mode === "signup" ? "/login" : "/signup"}
          className="text-accent-soft hover:text-accent-soft-hover font-medium"
        >
          {mode === "signup" ? "Sign in" : "Create an account"}
        </Link>
      </p>
    </div>
  );
};

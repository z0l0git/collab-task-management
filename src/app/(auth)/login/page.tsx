import type { Metadata } from "next";

import { AuthForm } from "@/features/auth/AuthForm";

export const metadata: Metadata = { title: "Sign in" };

const LoginPage = () => (
  <>
    <div className="mb-6 text-center">
      <h1 className="text-card-title text-ink">Welcome back</h1>
      <p className="text-body-sm text-ink-subtle mt-1">
        Sign in to your workspaces.
      </p>
    </div>
    <AuthForm mode="login" />
  </>
);

export default LoginPage;

import type { Metadata } from "next";

import { AuthForm } from "@/features/auth/AuthForm";

export const metadata: Metadata = { title: "Sign in" };

const LoginPage = () => (
  <>
    <div className="mb-8 text-center">
      <h1 className="text-card-title text-ink">Sign in to Taskboard</h1>
    </div>
    <AuthForm mode="login" />
  </>
);

export default LoginPage;

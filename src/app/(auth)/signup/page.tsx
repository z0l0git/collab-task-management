import type { Metadata } from "next";

import { AuthForm } from "@/features/auth/AuthForm";

export const metadata: Metadata = { title: "Create account" };

const SignupPage = () => (
  <>
    <div className="mb-6 text-center">
      <h1 className="text-card-title text-ink">Create your account</h1>
      <p className="text-body-sm text-ink-subtle mt-1">
        Start organising work with your team.
      </p>
    </div>
    <AuthForm mode="signup" />
  </>
);

export default SignupPage;

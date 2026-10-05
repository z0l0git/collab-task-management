import type { Metadata } from "next";

import { AuthForm } from "@/features/auth/AuthForm";

export const metadata: Metadata = { title: "Create account" };

const SignupPage = () => (
  <>
    <div className="mb-8 text-center">
      <h1 className="text-card-title text-ink">Create your account</h1>
    </div>
    <AuthForm mode="signup" />
  </>
);

export default SignupPage;

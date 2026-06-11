import { Suspense } from "react";
import type { Metadata } from "next";
import AuthForm from "@/components/AuthForm";

export const metadata: Metadata = { title: "Sign In" };

export default function SignInPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-16">
      <Suspense>
        <AuthForm mode="signin" />
      </Suspense>
    </main>
  );
}

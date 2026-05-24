import { Suspense } from "react";
import { AuthCard } from "@/components/auth/auth-card";
import { noIndexRobots } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = {
  robots: noIndexRobots
};

export default function SignInPage() {
  return (
    <div className="grid min-h-screen place-items-center px-4 py-12">
      <Suspense>
        <AuthCard mode="sign-in" />
      </Suspense>
    </div>
  );
}

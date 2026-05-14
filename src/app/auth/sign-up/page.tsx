import { Suspense } from "react";
import { AuthCard } from "@/components/auth/auth-card";

export default function SignUpPage() {
  return (
    <div className="grid min-h-screen place-items-center px-4 py-12">
      <Suspense>
        <AuthCard mode="sign-up" />
      </Suspense>
    </div>
  );
}

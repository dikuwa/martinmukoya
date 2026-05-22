"use client";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const signInSchema = z.object({
  email: z.string().email("Enter a valid email."),
  password: z.string().min(8, "Password must be at least 8 characters.")
});

const signUpSchema = signInSchema.extend({
  name: z.string().min(2, "Enter your name.").max(120)
});

type AuthCardProps = {
  mode: "sign-in" | "sign-up";
};

type AuthFormValues = {
  name?: string;
  email: string;
  password: string;
};

export function AuthCard({ mode }: AuthCardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") ?? "/admin";
  const [isLoading, setIsLoading] = useState(false);
  const isSignUp = mode === "sign-up";
  const schema = isSignUp ? signUpSchema : signInSchema;
  const form = useForm<AuthFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", password: "" }
  });

  async function onSubmit(values: AuthFormValues) {
    setIsLoading(true);

    const result = isSignUp
      ? await authClient.signUp.email(values as z.infer<typeof signUpSchema>)
      : await authClient.signIn.email(values as z.infer<typeof signInSchema>);

    setIsLoading(false);

    if (result.error) {
      toast.error(result.error.message ?? "Authentication failed.");
      return;
    }

    router.push(redirectTo);
    router.refresh();
  }

  return (
    <div className="mx-auto w-full max-w-[400px] rounded-[16px] border border-[color:var(--border-subtle)] bg-[color:var(--surface)] p-6 shadow-[0_8px_22px_rgba(0,0,0,0.12)]">
      <div>
        <p className="text-sm font-semibold text-[color:var(--primary)]">Admin access</p>
        <h1 className="text-balance mt-2 font-display text-3xl font-black text-[color:var(--text-strong)]">
          {isSignUp ? "Create account" : "Welcome back"}
        </h1>
        <p className="mt-2 text-sm leading-6 text-[color:var(--text-muted)]">
          {isSignUp
            ? "Create the first admin account, then lock registration down through env and dashboard policy."
            : "Sign in to manage projects, leads, content, and analytics."}
        </p>
      </div>
      <form className="mt-6 grid gap-4" onSubmit={form.handleSubmit(onSubmit)}>
        {isSignUp ? (
          <label className="grid gap-2 text-sm font-semibold text-[color:var(--text-strong)]">
            Name
            <input
              className="h-11 rounded-[12px] border border-[color:var(--border-subtle)] bg-white/[0.04] px-3 text-[color:var(--text-strong)] outline-none transition focus:border-[color:var(--primary)]"
              {...form.register("name")}
            />
            {"name" in form.formState.errors ? (
              <span className="text-xs text-[color:var(--destructive)]">{form.formState.errors.name?.message}</span>
            ) : null}
          </label>
        ) : null}
        <label className="grid gap-2 text-sm font-semibold text-[color:var(--text-strong)]">
          Email
          <input
            className="h-11 rounded-[12px] border border-[color:var(--border-subtle)] bg-white/[0.04] px-3 text-[color:var(--text-strong)] outline-none transition focus:border-[color:var(--primary)]"
            type="email"
            autoComplete="email"
            {...form.register("email")}
          />
          <span className="text-xs text-[color:var(--destructive)]">{form.formState.errors.email?.message}</span>
        </label>
        <label className="grid gap-2 text-sm font-semibold text-[color:var(--text-strong)]">
          Password
          <input
            className="h-11 rounded-[12px] border border-[color:var(--border-subtle)] bg-white/[0.04] px-3 text-[color:var(--text-strong)] outline-none transition focus:border-[color:var(--primary)]"
            type="password"
            autoComplete={isSignUp ? "new-password" : "current-password"}
            {...form.register("password")}
          />
          <span className="text-xs text-[color:var(--destructive)]">{form.formState.errors.password?.message}</span>
        </label>
        <Button disabled={isLoading} type="submit">
          {isLoading ? <Loader2 className="animate-spin" size={16} /> : null}
          {isSignUp ? "Create Admin" : "Sign In"}
        </Button>
      </form>
      <p className="mt-5 text-center text-sm text-[color:var(--text-muted)]">
        {isSignUp ? "Already have an account?" : "Need first-time setup?"}{" "}
        <Link className="font-bold text-[color:var(--text-strong)]" href={isSignUp ? "/auth/sign-in" : "/auth/sign-up"}>
          {isSignUp ? "Sign in" : "Create account"}
        </Link>
      </p>
    </div>
  );
}

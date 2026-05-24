import { AdminShell } from "@/components/navigation/admin-shell";
import { auth } from "@/lib/auth";
import { noIndexRobots } from "@/lib/seo";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  robots: noIndexRobots
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/auth/sign-in?redirect=/admin");
  }

  const userRole = (session.user as { role?: string }).role;

  if (userRole !== "ADMIN") {
    redirect("/");
  }

  return <AdminShell>{children}</AdminShell>;
}

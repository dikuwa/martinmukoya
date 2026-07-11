import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { AdminDashboardFrame } from "@/components/navigation/admin-dashboard-frame";

export async function AdminShell({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() });

  return <AdminDashboardFrame user={{ name: session?.user.name ?? "Admin", email: session?.user.email ?? "" }}>{children}</AdminDashboardFrame>;
}

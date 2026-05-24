import { noIndexRobots } from "@/lib/seo";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  robots: noIndexRobots
};

export default function LoginPage() {
  redirect("/auth/sign-in");
}

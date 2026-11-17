import { redirect } from "next/navigation";
type Props = { params: Promise<{ token: string }> };
export default async function LegacySharedDocument({ params }: Props) {
  redirect(`/d/${encodeURIComponent((await params).token)}`);
}

export const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export function absoluteUrl(path = "/") {
  return new URL(path, siteUrl).toString();
}

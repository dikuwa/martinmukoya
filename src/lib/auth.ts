import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { getDb } from "@/lib/db";

const trustedOrigins = Array.from(
  new Set(
    [
      process.env.BETTER_AUTH_URL,
      process.env.NEXT_PUBLIC_APP_URL,
      process.env.SITE_URL,
      process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined,
      "http://localhost:3000",
      "https://martinmukoya.vercel.app",
      "https://martinmukoya.com",
      "https://www.martinmukoya.com",
      "https://flextech-media.vercel.app",
      "https://flextech-media.com",
      "https://www.flextech-media.com"
    ].filter((origin): origin is string => Boolean(origin))
  )
);

export const auth = betterAuth({
  trustedOrigins,
  database: prismaAdapter(getDb(), {
    provider: "postgresql"
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false
  },
  socialProviders:
    process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET
      ? {
          github: {
            clientId: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET
          }
        }
      : undefined,
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "VISITOR",
        input: false
      }
    }
  }
});

export type Session = typeof auth.$Infer.Session;

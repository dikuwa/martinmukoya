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
      "http://localhost:3001",
      "http://localhost:3002",
      "http://localhost:3003",
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

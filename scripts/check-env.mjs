import fs from "node:fs";

const envFile = ".env.local";
const content = fs.existsSync(envFile) ? fs.readFileSync(envFile, "utf8") : "";
const values = new Map();

for (const line of content.split(/\r?\n/)) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const match = trimmed.match(/^([A-Z0-9_]+)=(.*)$/);
  if (!match) continue;
  values.set(match[1], match[2].trim().replace(/^"|"$/g, ""));
}

const groups = [
  {
    title: "Required for local app",
    keys: ["DATABASE_URL", "UPSTASH_REDIS_URL", "UPSTASH_REDIS_TOKEN", "BETTER_AUTH_SECRET", "BETTER_AUTH_URL", "RESEND_API_KEY", "RESEND_FROM_EMAIL", "OPENAI_CHATBOT_API_KEY", "OPENAI_CHATBOT_MODEL", "OPENAI_DOCUMENTS_API_KEY", "OPENAI_DOCUMENTS_MODEL", "NEXT_PUBLIC_APP_URL", "ADMIN_EMAIL", "ADMIN_PASSWORD"]
  },
  {
    title: "Needed only for admin image uploads",
    keys: ["CLOUDFLARE_R2_ACCESS_KEY_ID", "CLOUDFLARE_R2_SECRET_ACCESS_KEY", "CLOUDFLARE_R2_ENDPOINT", "CLOUDFLARE_R2_BUCKET_NAME", "CLOUDFLARE_R2_PUBLIC_DEV_URL"]
  },
  {
    title: "Recommended analytics",
    keys: ["NEXT_PUBLIC_POSTHOG_KEY", "NEXT_PUBLIC_POSTHOG_HOST"]
  },
  {
    title: "Optional login/provider extras",
    keys: ["GITHUB_CLIENT_ID", "GITHUB_CLIENT_SECRET", "AI_GATEWAY_API_KEY", "OPENROUTER_API_KEY", "OPENROUTER_MODEL", "SITE_URL", "SITE_NAME", "UPLOADTHING_TOKEN"]
  }
];

let hasMissingRequired = false;

for (const group of groups) {
  console.log(`\n${group.title}`);
  for (const key of group.keys) {
    const isSet = Boolean(values.get(key));
    const isRequiredGroup = group.title === "Required for local app";
    if (!isSet && isRequiredGroup) hasMissingRequired = true;
    console.log(`${isSet ? "✓" : "•"} ${key}: ${isSet ? "set" : "missing"}`);
  }
}

console.log("");
if (hasMissingRequired) {
  console.log("Some required local values are missing. See docs/setup-api-keys.md for direct setup links.");
  process.exitCode = 1;
} else {
  console.log("Core environment looks ready. Optional missing values can be added later.");
}

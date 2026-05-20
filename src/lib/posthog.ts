import { PostHog } from "posthog-node";

let posthogClient: PostHog | null = null;

function getPostHogClient() {
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY ?? process.env.NEXT_PUBLIC_POSTHOG_TOKEN;
  if (!key) return null;

  posthogClient ??= new PostHog(key, {
    host: process.env.NEXT_PUBLIC_POSTHOG_HOST
  });

  return posthogClient;
}

export async function capturePostHogServerEvent(input: {
  eventType: string;
  distinctId?: string;
  properties?: Record<string, unknown>;
}) {
  const client = getPostHogClient();
  if (!client) return;

  try {
    client.capture({
      distinctId: input.distinctId ?? "anonymous-visitor",
      event: input.eventType,
      properties: input.properties
    });
    await client.flush();
  } catch {
    // Analytics should never block core form, chat, or admin flows.
  }
}

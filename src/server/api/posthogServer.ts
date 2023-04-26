import { env } from "@/env/client.mjs";
import { PostHog } from "posthog-node";

let posthog: PostHog | null = null;
if (env.NEXT_PUBLIC_POSTHOG_KEY) {
  posthog = new PostHog(env.NEXT_PUBLIC_POSTHOG_KEY, {
    host: "https://app.posthog.com",
  });
}

export default posthog;

import { env } from "@/env/client.mjs";
import posthogLib from "posthog-js";

const posthog = () => {
  if (typeof window !== "undefined" && env.NEXT_PUBLIC_POSTHOG_KEY) {
    posthogLib.init(env.NEXT_PUBLIC_POSTHOG_KEY, {
      api_host: "https://app.posthog.com",
      loaded: (posthogLib) => {
        if (process.env.NODE_ENV === "development")
          posthogLib.opt_out_capturing();
      },
    });

    return posthogLib;
  } else {
    return null;
  }
};

export default posthog;

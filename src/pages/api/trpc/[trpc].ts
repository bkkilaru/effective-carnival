import { createNextApiHandler } from "@trpc/server/adapters/next";

import { createTRPCContext } from "@/server/api/trpc";
import { appRouter } from "@/server/api/root";
import type { NextApiRequest, NextApiResponse } from "next";
import posthog from "@/server/api/posthogServer";

// export API handler
const nextApiHandler = createNextApiHandler({
  router: appRouter,
  createContext: createTRPCContext,
  onError:
    process.env.NODE_ENV === "development"
      ? ({ path, error }) => {
          console.error(
            `❌ tRPC failed on ${path ?? "<no-path>"}: ${error.message}`
          );
        }
      : undefined,
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const response = await nextApiHandler(req, res);

  // Wait for all posthog events to flush before ending the request
  await posthog?.shutdownAsync();
  return response;
}

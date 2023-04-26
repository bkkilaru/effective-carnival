import { env as clientEnv } from "@/env/client.mjs";

const getBaseUrl = () => {
  if (process.env.NODE_ENV === "development")
    return `http://localhost:${process.env.PORT ?? 3000}`;

  return clientEnv.NEXT_PUBLIC_HOST || process.env.VERCEL_URL;
};

export default getBaseUrl;

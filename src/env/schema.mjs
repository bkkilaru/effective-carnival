// @ts-check
import { z } from "zod";

export const DEFAULT_VALUE_DO_NOT_USE_IN_PRODUCTION = "__default__";

/**
 * Specify your server-side environment variables schema here.
 * This way you can ensure the app isn't built with invalid env vars.
 */
export const serverSchema = z.object({
  // App
  NODE_ENV: z.enum(["development", "test", "production"]),

  // Storage
  DATABASE_URL: z.string().url().optional(),

  // Auth
  NEXTAUTH_SECRET:
    process.env.NODE_ENV === "production"
      ? z.string().min(1).default(DEFAULT_VALUE_DO_NOT_USE_IN_PRODUCTION)
      : z
          .string()
          .min(1)
          .optional()
          .default(DEFAULT_VALUE_DO_NOT_USE_IN_PRODUCTION),
  NEXTAUTH_URL:
    process.env.NODE_ENV === "development"
      ? z.string().optional()
      : z
          .preprocess(
            // This makes Vercel deployments not fail if you don't set NEXTAUTH_URL
            // Since NextAuth.js automatically uses the VERCEL_URL if present.
            (str) => process.env.VERCEL_URL ?? str,
            // VERCEL_URL doesn't include `https` so it cant be validated as a URL
            process.env.VERCEL ? z.string() : z.string().url()
          )
          .optional()
          .default(""),
  GOOGLE_CLIENT_ID: z.string().optional().default(""),
  GOOGLE_CLIENT_SECRET: z.string().optional().default(""),

  STRIPE_SECRET_KEY: z.string().default(""),
  STRIPE_WEBHOOK_SECRET: z.string().optional().default(""),

  // Email
  EMAIL_SMTP_HOST: z.string().optional().default(""),
  EMAIL_SMTP_PORT: z.string().optional().default(""),
  EMAIL_SMTP_USER: z.string().optional().default(""),
  EMAIL_SMTP_PASSWORD: z.string().optional().default(""),
});

/**
 * You can't destruct `process.env` as a regular object in the Next.js
 * middleware, so you have to do it manually here.
 * @type {{ [k in keyof z.infer<typeof serverSchema>]: z.infer<typeof serverSchema>[k] | undefined }}
 */
export const serverEnv = {
  DATABASE_URL: process.env.DATABASE_URL,
  NODE_ENV: process.env.NODE_ENV,
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
  EMAIL_SMTP_HOST: process.env.EMAIL_SMTP_HOST,
  EMAIL_SMTP_PORT: process.env.EMAIL_SMTP_PORT,
  EMAIL_SMTP_USER: process.env.EMAIL_SMTP_USER,
  EMAIL_SMTP_PASSWORD: process.env.EMAIL_SMTP_PASSWORD,
};

/**
 * Specify your client-side environment variables schema here.
 * This way you can ensure the app isn't built with invalid env vars.
 * To expose them to the client, prefix them with `NEXT_PUBLIC_`.
 */
export const clientSchema = z.object({
  NEXT_PUBLIC_HOST: z.string().optional().default(""),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().optional().default(""),
  NEXT_PUBLIC_POSTHOG_KEY: z.string().optional().default(""),
});

/**
 * You can't destruct `process.env` as a regular object, so you have to do
 * it manually here. This is because Next.js evaluates this at build time,
 * and only used environment variables are included in the build.
 * @type {{ [k in keyof z.infer<typeof clientSchema>]: z.infer<typeof clientSchema>[k] | undefined }}
 */
export const clientEnv = {
  NEXT_PUBLIC_HOST: process.env.NEXT_PUBLIC_HOST,
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY:
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  NEXT_PUBLIC_POSTHOG_KEY: process.env.NEXT_PUBLIC_POSTHOG_KEY,
};

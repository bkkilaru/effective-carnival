import GoogleProvider from "next-auth/providers/google";
import EmailProvider from "next-auth/providers/email";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/server/db";
import { env } from "@/env/server.mjs";
import type { Provider } from "next-auth/providers";
import type { NextAuthOptions } from "next-auth";
import { send } from "@/server/api/email";
import posthog from "@/server/api/posthogServer";
import { LOG_IN_EVENT, LOG_OUT_EVENT, SIGN_UP_EVENT } from "./analyticsEvents";
import EMAIL_FROM from "./emailFrom";

/**
 * @see https://next-auth.js.org/providers
 */
const providers: Provider[] = [
  CredentialsProvider({
    name: "temp",
    credentials: {
      localstorageId: { label: "Local storage id", type: "password" },
    },
    async authorize(credentials) {
      const { localstorageId = "" } = credentials ?? {};

      const user = await prisma.user.findUnique({
        where: { anonymousId: localstorageId },
      });

      return user;
    },
  }),
];

if (env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    })
  );
}

if (env.EMAIL_SMTP_HOST) {
  providers.push(
    EmailProvider({
      server: env.EMAIL_SMTP_HOST,
      from: EMAIL_FROM,
      // See: https://next-auth.js.org/providers/email#configuration
      sendVerificationRequest: async ({ identifier, url }) => {
        return send({
          type: "sign-in-link",
          to: identifier,
          subject: `Sign in to Demorepo`,
          props: {
            url,
          },
        });
      },
    })
  );
}

const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/sign-in",
    error: "/auth/error",
  },
  adapter: PrismaAdapter(prisma),
  secret: env.NEXTAUTH_SECRET,
  providers,
  callbacks: {
    // Include user.id on session
    async session({ session, user, token }) {
      if (session.user) {
        // user.id is set for 3rd party providers
        // token.id is set for credentials provider
        session.user.id = user?.id ?? token.id;
      }

      return session;
    },
    async signIn({ user }) {
      return !!user;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
  },
  events: {
    async createUser({ user }) {
      posthog?.capture({
        distinctId: user.id,
        event: SIGN_UP_EVENT,
      });

      await posthog?.shutdownAsync();
    },
    async signIn({ user }) {
      posthog?.capture({
        distinctId: user.id,
        event: LOG_IN_EVENT,
      });

      await posthog?.shutdownAsync();
    },
    async signOut({ session }) {
      if (session.user?.id) {
        posthog?.capture({
          distinctId: session.user.id,
          event: LOG_OUT_EVENT,
        });
      }

      await posthog?.shutdownAsync();
    },
  },
};

export default authOptions;

import { type Session } from "next-auth";
import type { ServerSessionOptions } from "../auth";
import { getServerAuthSession } from "../auth";
import { prisma } from "../db";
import { z } from "zod";
import posthog from "./posthogServer";

type CreateContextOptions = {
  session: Session | null;
  team: Team | null;
  posthog: typeof posthog;
};

/**
 * This helper generates the "internals" for a tRPC context. If you need to use
 * it, you can export it from here
 *
 * Examples of things you may need it for:
 * - testing, so we dont have to mock Next.js' req/res
 * - trpc's `createSSGHelpers` where we don't have req/res
 * @see https://create.t3.gg/en/usage/trpc#-servertrpccontextts
 */
const createInnerTRPCContext = (opts: CreateContextOptions) => {
  return {
    session: opts.session,
    prisma,
    posthog,
  };
};

/**
 * This is the actual context you'll use in your router. It will be used to
 * process every request that goes through your tRPC endpoint
 * @link https://trpc.io/docs/context
 */
export const createTRPCContext = async (opts: ServerSessionOptions) => {
  const { req, res } = opts;

  // Get the session from the server using the unstable_getServerSession wrapper function
  const session = await getServerAuthSession({ req, res });

  return createInnerTRPCContext({
    session,
    posthog,
    team: null,
  });
};

/**
 * 2. INITIALIZATION
 *
 * This is where the trpc api is initialized, connecting the context and
 * transformer
 */
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import type { Team } from "@prisma/client";
import { ROLE_ADMIN } from "@/lib/roles";

type ServerContext = Awaited<ReturnType<typeof createTRPCContext>>;

const t = initTRPC.context<ServerContext>().create({
  transformer: superjson,
  errorFormatter({ shape }) {
    return shape;
  },
});

/**
 * 3. ROUTER & PROCEDURE
 *
 * These are the pieces you use to build your tRPC API. You should import these
 * a lot in the /src/server/api/routers folder
 */

/**
 * This is how you create new routers and subrouters in your tRPC API
 * @see https://trpc.io/docs/router
 */
export const createTRPCRouter = t.router;

/**
 * Public (unauthed) procedure
 *
 * This is the base piece you use to build new queries and mutations on your
 * tRPC API. It does not guarantee that a user querying is authorized, but you
 * can still access user session data if they are logged in
 */
export const publicProcedure = t.procedure;

/**
 * Reusable middleware that enforces users are logged in before running the
 * procedure
 */
const enforceUserIsAuthed = t.middleware(async ({ ctx, next }) => {
  if (!ctx.session || !ctx.session.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  // if using a temporary account, on the first session if the user has completed onboarding,
  // the session user should be fetched and set from the DB
  // without this the session user is stale on the first login
  // subsequent logins will not trigger this
  // without temporary accounts, you can safeley delete this if statement
  if (!ctx.session.user.name || !ctx.session.user.email) {
    const user = await prisma.user.findUnique({
      where: { id: ctx.session.user.id },
    });

    if (!user) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    ctx.session.user = user;
  }

  return next({
    ctx: {
      // infers the `session` as non-nullable
      session: { ...ctx.session, user: ctx.session.user },
    },
  });
});

/**
 * Protected (authed) procedure
 *
 * If you want a query or mutation to ONLY be accessible to logged in users, use
 * this. It verifies the session is valid and guarantees ctx.session.user is not
 * null
 *
 * @see https://trpc.io/docs/procedures
 */
export const protectedProcedure = t.procedure.use(enforceUserIsAuthed);

const TeamInput = z
  .object({
    teamId: z.string(),
    slug: z.string(),
  })
  .partial()
  .refine(({ teamId, slug }) => {
    if (!teamId && !slug) {
      throw new Error("You must provide either teamId or slug");
    }

    return true;
  });

/**
 * If you want a query or mutation to only be accessible to admins of a team,
 * use this.
 */
export const adminProcedure = protectedProcedure
  .input(TeamInput)
  .use(async ({ next, ctx, input, ...rest }) => {
    const idObj =
      "teamId" in input ? { id: input.teamId } : { slug: input.slug };

    const user = ctx.session.user;
    const team = await prisma.team.findFirst({
      where: {
        ...idObj,
        userRoles: { some: { userId: user.id, role: ROLE_ADMIN } },
      },
      include: {
        userRoles: true,
        subscription: { include: { price: { include: { product: true } } } },
      },
    });

    if (!team) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "You must be an admin to do this",
      });
    }

    return next({
      ...rest,
      ctx: { ...ctx, team },
    });
  });

/**
 * If you want a query or mutation to only be accessible to members of a team,
 * use this.
 */
export const memberProcedure = protectedProcedure
  .input(TeamInput)
  .use(async ({ next, ctx, input, ...rest }) => {
    const idObj =
      "teamId" in input ? { id: input.teamId } : { slug: input.slug };

    const user = ctx.session.user;
    const team = await prisma.team.findFirst({
      where: {
        ...idObj,
        userRoles: { some: { userId: user.id } },
      },
      include: {
        userRoles: true,
        subscription: { include: { price: { include: { product: true } } } },
      },
    });

    if (!team) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "You're not in this team",
      });
    }

    return next({
      ...rest,
      ctx: { ...ctx, team },
    });
  });

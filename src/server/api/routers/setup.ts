import { env } from "../../../env/server.mjs";
import _ from "lodash";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { DEFAULT_VALUE_DO_NOT_USE_IN_PRODUCTION } from "../../../env/schema.mjs";
import stripeRouter from "./stripe";

const setupRouter = createTRPCRouter({
  vars: publicProcedure.query(async () => {
    return _.mapValues(env, (value) =>
      !value || value.includes(DEFAULT_VALUE_DO_NOT_USE_IN_PRODUCTION)
        ? undefined
        : "Set"
    );
  }),
  hasUsers: protectedProcedure.query(async ({ ctx }) => {
    return (await ctx.prisma.user.count()) > 0;
  }),
  hasProducts: publicProcedure.query(async ({ ctx }) => {
    return (await ctx.prisma.product.count()) > 0;
  }),
  syncStripeProducts: publicProcedure.mutation(async ({ ctx }) => {
    const caller = stripeRouter.createCaller(ctx);

    await caller.syncAllProductsToDatabase();
    await caller.syncAllPricesToDatabase();
  }),
});

export default setupRouter;

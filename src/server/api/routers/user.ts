import { z } from "zod";
import teams from "./teams";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

const userRouter = createTRPCRouter({
  registerAnonymously: publicProcedure
    .input(
      z.object({
        id: z.string().min(10),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.user.create({
        data: { anonymousId: input.id },
      });
    }),
  get: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.prisma.user.findUnique({
      where: { id: ctx.session.user.id },
      include: {
        teamRoles: {
          select: {
            team: { select: { id: true, name: true, slug: true } },
            role: true,
          },
        },
      },
    });

    return user;
  }),
  update: protectedProcedure
    .input(
      z.object({
        name: z.string().optional(),
        hasOnboarded: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.user.update({
        data: input,
        where: { id: ctx.session.user.id },
      });
    }),
  finishOnboarding: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        teamName: z.string().min(1).max(24).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.user.update({
        where: { id: ctx.session.user.id },
        data: {
          name: input.name,
          hasOnboarded: true,
        },
      });

      if (input.teamName) {
        await teams.createCaller(ctx).create({ name: input.teamName });
      }
    }),
});

export default userRouter;

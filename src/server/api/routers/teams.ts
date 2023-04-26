import {
  CREATE_TEAM_EVENT,
  DELETE_TEAM_EVENT,
  LEAVE_TEAM_EVENT,
} from "@/lib/analyticsEvents";
import getTeamInviteUrl from "@/utils/getTeamInviteUrl";
import type { PrismaClient, Team, User } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime";
import { TRPCError } from "@trpc/server";
import { nanoid } from "nanoid";
import { z } from "zod";
import { ROLE_ADMIN, ROLE_MEMBER } from "../../../lib/roles";
import { send } from "../email";
import stripe from "../stripeServer";

import {
  adminProcedure,
  createTRPCRouter,
  memberProcedure,
  protectedProcedure,
} from "../trpc";

async function updateSubscriptionQuantity(
  subscriptionId: string,
  newQuantity: number
) {
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  if (!subscription) return;

  await stripe.subscriptions.update(subscription.id, {
    items: [
      {
        id: subscription.items.data[0]?.id,
        quantity: newQuantity,
      },
    ],
  });
}

async function updateTeamBillingSeatQuantity(
  prisma: PrismaClient,
  teamId: string
) {
  const subscription = await prisma.subscription.findUnique({
    where: { teamId: teamId },
  });
  if (!subscription) return;

  const newNumberOfMembers = await prisma.userTeamRole.count({
    where: { teamId: teamId },
  });

  await updateSubscriptionQuantity(subscription.id, newNumberOfMembers);
}

async function sendInviteEmail({
  inviter,
  email,
  code,
  team,
}: {
  email: string;
  code: string;
  inviter: Partial<Pick<User, "name" | "email">>;
  team: Team;
}) {
  const subject = inviter.name
    ? `${inviter.name} has invited you to join ${team.name} on Demorepo`
    : `You have been invited to join ${team.name} on Demorepo`;

  return send({
    to: email,
    subject,
    type: "invite-user",
    props: {
      team,
      from: {
        name: inviter.name || team.name,
        email: inviter.email || "",
      },
      toEmail: email,
      inviteUrl: getTeamInviteUrl({ code, email }),
    },
  });
}

const teamsRouter = createTRPCRouter({
  get: protectedProcedure.query(async ({ ctx }) => {
    const teams = await ctx.prisma.team.findMany({
      where: {
        userRoles: { some: { userId: ctx.session.user.id } },
      },
      include: {
        userRoles: true,
        subscription: { include: { price: { include: { product: true } } } },
      },
    });

    return teams;
  }),
  updateName: adminProcedure
    .input(z.object({ name: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.team.update({
        where: { id: ctx.team.id },
        data: {
          name: input.name,
        },
      });
    }),
  updateSlug: adminProcedure
    .input(
      z.object({
        slug: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.prisma.team.update({
          where: { id: ctx.team.id },
          data: {
            slug: input.slug,
          },
        });
      } catch (e) {
        if (e instanceof PrismaClientKnownRequestError) {
          if (e.code === "P2002") {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: `URL unavailable. Please try another.`,
              cause: e,
            });
          }
        }
      }
    }),
  delete: adminProcedure.mutation(async ({ ctx }) => {
    await ctx.prisma.team.deleteMany({ where: { id: ctx.team.id } });

    ctx.posthog?.capture({
      distinctId: ctx.session.user.id,
      event: DELETE_TEAM_EVENT,
    });
  }),
  leave: memberProcedure.mutation(async ({ ctx }) => {
    if (ctx.team.userRoles.length === 1) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: `You are the last member of this team. Please transfer ownership before leaving.`,
      });
    }

    await ctx.prisma.userTeamRole.deleteMany({
      where: {
        teamId: ctx.team.id,
        userId: ctx.session.user.id,
      },
    });

    await updateTeamBillingSeatQuantity(ctx.prisma, ctx.team.id);

    ctx.posthog?.capture({
      distinctId: ctx.session.user.id,
      event: LEAVE_TEAM_EVENT,
    });
  }),
  create: protectedProcedure
    .input(z.object({ name: z.string().min(1).max(24) }))
    .mutation(async ({ ctx, input }) => {
      let slug = input.name.replaceAll(" ", "-").toLowerCase();

      const slugExists = await ctx.prisma.team.findFirst({ where: { slug } });
      if (slugExists) {
        slug += "-" + Math.floor(Math.random() * 100000000);
      }

      const team = await ctx.prisma.team.create({
        data: {
          name: input.name,
          slug,
          userRoles: {
            create: { userId: ctx.session.user.id, role: ROLE_ADMIN },
          },
        },
      });

      ctx.posthog?.capture({
        distinctId: ctx.session.user.id,
        event: CREATE_TEAM_EVENT,
      });

      return team;
    }),
  getMembers: memberProcedure.query(async ({ ctx }) => {
    const members = await ctx.prisma.user.findMany({
      where: {
        teamRoles: { some: { teamId: ctx.team.id } },
      },
      include: {
        teamRoles: true,
      },
    });

    return members;
  }),
  inviteMembers: adminProcedure
    .input(
      z.object({
        invites: z.array(
          z.object({
            email: z.string().email(),
            role: z.enum([ROLE_ADMIN, ROLE_MEMBER]),
          })
        ),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const team = ctx.team;

      const existingInviteEmails = new Set(
        (
          await ctx.prisma.userInvite.findMany({
            where: {
              teamId: team.id,
              email: { in: input.invites.map((i) => i.email) },
            },
            select: { email: true },
          })
        ).map((i) => i.email)
      );

      const inviteData = input.invites
        .filter((i) => !existingInviteEmails.has(i.email))
        .map(({ email, role }) => ({
          email,
          role,
          teamId: team.id,
          code: nanoid(),
        }));

      await ctx.prisma.userInvite.createMany({
        data: inviteData,
        skipDuplicates: true,
      });

      await Promise.all(
        inviteData.map((invite) =>
          sendInviteEmail({
            inviter: ctx.session.user,
            team,
            email: invite.email,
            code: invite.code,
          })
        )
      );
    }),
  invites: memberProcedure.query(async ({ ctx }) => {
    const invites = await ctx.prisma.userInvite.findMany({
      where: {
        teamId: ctx.team.id,
      },
    });

    return invites;
  }),
  resendInviteEmail: adminProcedure
    .input(z.object({ inviteId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const invite = await ctx.prisma.userInvite.findFirst({
        where: { id: input.inviteId },
      });

      if (!invite) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Invite not found`,
        });
      }

      console.log("USER", ctx.session.user);
      await sendInviteEmail({
        inviter: ctx.session.user,
        team: ctx.team,
        email: invite.email,
        code: invite.code,
      });
    }),
  deleteInvite: adminProcedure
    .input(z.object({ inviteId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.userInvite.delete({
        where: { id: input.inviteId },
      });
    }),
  updateRole: adminProcedure
    .input(
      z.object({
        userId: z.string(),
        role: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.userTeamRole.update({
        where: {
          userId_teamId: { userId: input.userId, teamId: ctx.team.id },
        },
        data: { role: input.role },
      });
    }),
  removeUser: adminProcedure
    .input(
      z.object({
        userId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.userTeamRole.deleteMany({
        where: {
          teamId: ctx.team.id,
          userId: input.userId,
        },
      });

      await updateTeamBillingSeatQuantity(ctx.prisma, ctx.team.id);
    }),
  getOwnInvite: protectedProcedure
    .input(z.object({ code: z.string() }))
    .query(async ({ ctx, input }) => {
      if (!ctx.session.user.email) throw new Error("No email found for user");

      const invite = await ctx.prisma.userInvite.findFirst({
        where: { code: input.code, email: ctx.session.user.email },
        include: { team: true },
      });

      if (!invite) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Invite not found`,
        });
      }

      return invite;
    }),
  acceptInvite: protectedProcedure
    .input(z.object({ code: z.string(), email: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const invite = await ctx.prisma.userInvite.findFirst({
        where: { code: input.code, email: input.email },
        include: { team: true },
      });

      if (!invite) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Invite not found`,
        });
      }

      const team = await ctx.prisma.$transaction(async (tx) => {
        await tx.userInvite.delete({ where: { id: invite.id } });

        const team = await tx.team.update({
          data: {
            userRoles: {
              create: {
                role: invite.role,
                userId: ctx.session.user.id,
              },
            },
          },
          where: { id: invite.teamId },
          select: { id: true, name: true, slug: true },
        });
        return team;
      });

      await updateTeamBillingSeatQuantity(ctx.prisma, team.id);

      return team;
    }),
});

export default teamsRouter;

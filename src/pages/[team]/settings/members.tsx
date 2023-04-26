import type { GetServerSideProps } from "next";
import React, { useCallback, useState } from "react";
import { toast } from "react-hot-toast";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/design-system/Avatar";
import { Button } from "@/components/design-system/Button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/design-system/Dropdown";
import { Input } from "@/components/design-system/Input";
import type { Role } from "@/lib/roles";
import { ROLE_ADMIN } from "@/lib/roles";
import { ROLE_MEMBER, ROLES } from "@/lib/roles";
import { TeamRouteQueryType, useTeam } from "@/lib/useTeam";
import { api } from "@/utils/api";
import { createSSG } from "@/utils/ssg";
import SettingsLayout from "./layout";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/design-system/Select";
import getTeamInviteUrl from "@/utils/getTeamInviteUrl";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/design-system/Tabs";
import useUser from "@/lib/useUser";
import { Mail, MoreHorizontal, Plus } from "lucide-react";

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { req, res } = context;

  const ssg = await createSSG({ req, res });
  const slug = TeamRouteQueryType.parse(context.query).team;

  await Promise.allSettled([
    ssg.user.get.prefetch(),
    ssg.teams.get.prefetch(),
    ssg.teams.getMembers.prefetch({ slug }),
    ssg.teams.invites.prefetch({ slug }),
  ]);

  return {
    props: {
      trpcState: ssg.dehydrate(),
    },
  };
};

type Invite = { email: string; role: Role };

const InviteSection = () => {
  const { team, slug } = useTeam();
  const utils = api.useContext();
  const inviteMutation = api.teams.inviteMembers.useMutation({
    async onSuccess() {
      await utils.invalidate(undefined, {
        queryKey: api.teams.invites.getQueryKey({ slug: slug }),
      });
    },
  });
  const [invites, setInvites] = useState<Invite[]>([
    { email: "", role: ROLE_MEMBER },
    { email: "", role: ROLE_MEMBER },
  ]);

  const handleAddInvite = useCallback(() => {
    setInvites((invites) => [...invites, { email: "", role: ROLE_MEMBER }]);
  }, []);

  const handleChangeEmail = useCallback((i: number, value: string) => {
    setInvites((invites) => {
      const newInvites = [...invites];
      const row = newInvites[i];
      if (row) {
        row.email = value;
      }
      return newInvites;
    });
  }, []);

  const handleChangeRole = useCallback((i: number, value: Role) => {
    setInvites((invites) => {
      const newInvites = [...invites];
      const row = newInvites[i];
      if (row) {
        row.role = value;
      }
      return newInvites;
    });
  }, []);

  const handleSendInvites = useCallback(async () => {
    if (!team) return;

    const validInvites = invites.filter((invite) => invite.email);
    await inviteMutation.mutateAsync({
      teamId: team.id,
      invites: validInvites,
    });
    setInvites([
      { email: "", role: ROLE_MEMBER },
      { email: "", role: ROLE_MEMBER },
    ]);
    toast.success("Invites sent!");
  }, [inviteMutation, invites, team]);

  return (
    <div className="rounded-lg border bg-white">
      <div className="px-6 py-4">
        <h3 className="text-lg font-medium">Invite</h3>
      </div>
      <div className="mt-1 flex flex-col gap-y-2 px-6">
        {invites.map(({ email, role }, i) => {
          return (
            <div key={i} className="grid grid-cols-3 gap-x-3">
              <div className="col-span-2">
                <Input
                  value={email}
                  id={`invite-email-${i}`}
                  type="text"
                  // autoComplete="new" prevents the browser from autofilling the field with the same email
                  autoComplete="new"
                  iconLeft={<Mail className="w-4 text-gray-400" />}
                  placeholder="Email"
                  className="w-full"
                  onChange={(e) => handleChangeEmail(i, e.target.value)}
                />
              </div>
              <div className="col-span-1">
                <Select
                  onValueChange={(v) => handleChangeRole(i, v as Role)}
                  defaultValue={role}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Admin" />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLES.map((role) => (
                      <SelectItem key={role} value={role}>
                        {role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          );
        })}
      </div>
      <div className="my-5 flex items-center justify-between px-6">
        <Button
          variant="link"
          size="flush"
          className="flex items-center gap-x-2 text-gray-500"
          onClick={handleAddInvite}
        >
          <Plus className="w-4" /> Add another
        </Button>
      </div>
      <div className="flex w-full justify-end rounded-b-lg border-t bg-gray-50 px-6 py-3">
        <Button loading={inviteMutation.isLoading} onClick={handleSendInvites}>
          {inviteMutation.isLoading ? "Sending invites" : "Send invites"}
        </Button>
      </div>
    </div>
  );
};

const MembersSection = () => {
  const { team, slug } = useTeam();
  const { user } = useUser();
  const utils = api.useContext();
  const { data: members } = api.teams.getMembers.useQuery(
    {
      slug,
    },
    { enabled: !!slug }
  );
  const updateRoleMutation = api.teams.updateRole.useMutation({
    async onSuccess() {
      await utils.invalidate(undefined, {
        queryKey: api.teams.getMembers.getQueryKey({ slug }),
      });
    },
  });
  const removeUserMutation = api.teams.removeUser.useMutation({
    async onSuccess() {
      await utils.invalidate(undefined, {
        queryKey: api.teams.getMembers.getQueryKey({ slug }),
      });
    },
  });

  if (!user || !team || !members) return null;

  const isAdmin =
    user?.teamRoles.find((r) => r.team.id === team.id)?.role === ROLE_ADMIN;

  return (
    <>
      {members.map((m) => {
        const role = m.teamRoles[0]?.role ?? "Member";
        return (
          <div
            className="flex justify-between border-b border-gray-100 py-3 px-4 last-of-type:border-none"
            key={m.id}
          >
            <div className="flex items-center gap-x-2">
              <Avatar>
                <AvatarFallback>{(m.name ?? m.email ?? "")[0]}</AvatarFallback>
                <AvatarImage src={m.image ?? undefined} />
              </Avatar>
              <div className="flex flex-col">
                <p className="font-medium">{m.name ?? m.email ?? "Unknown"}</p>
                <p className="text-gray-500">{m.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-x-6">
              <div className="">
                {user.id === m.id || !isAdmin ? (
                  <span className="text-gray-500">{role}</span>
                ) : (
                  <Select
                    onValueChange={async (r) => {
                      await updateRoleMutation.mutateAsync({
                        teamId: team.id,
                        userId: m.id,
                        role: r,
                      });

                      toast.success(`${m.name || m.email} set to ${r}`);
                    }}
                    defaultValue={role}
                  >
                    <SelectTrigger
                      className="bg-white"
                      loading={updateRoleMutation.isLoading}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ROLES.map((r) => {
                        return (
                          <SelectItem value={r} key={r}>
                            {r}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                )}
              </div>
              {user.id !== m.id && (
                <DropdownMenu>
                  <DropdownMenuTrigger>
                    <MoreHorizontal className="w-4 text-gray-500" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem
                      onClick={async () => {
                        await removeUserMutation.mutateAsync({
                          teamId: team.id,
                          userId: m.id,
                        });

                        toast.success(`${m.name} removed from ${team.name}`);
                      }}
                      className="text-red-500"
                    >
                      Remove user
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        );
      })}
    </>
  );
};

const InvitedSection = () => {
  const { slug, team } = useTeam();
  const utils = api.useContext();
  const { data: invites } = api.teams.invites.useQuery(
    { slug },
    { enabled: !!slug }
  );

  const resendInviteEmailMutation = api.teams.resendInviteEmail.useMutation();
  const deleteInviteMutation = api.teams.deleteInvite.useMutation({
    async onSuccess() {
      await utils.invalidate(undefined, {
        queryKey: api.teams.invites.getQueryKey({ slug }),
      });
    },
  });

  if (!team || !invites) return null;

  return (
    <div className="flex w-full flex-col">
      {invites?.length === 0 && (
        <p className="py-4 text-center text-gray-500">No pending invites</p>
      )}
      {invites?.map((i) => {
        return (
          <div
            className="flex justify-between border-b py-3 px-6 last-of-type:border-none"
            key={i.id}
          >
            <div className="flex items-center gap-x-2">
              <div className="flex flex-col gap-y-1">
                <p className="">{i.email}</p>
                <p className="font-medium text-gray-500">{i.role}</p>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger>
                <MoreHorizontal className="h-8 w-8 px-2 text-gray-500" />
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem
                  onClick={async () => {
                    await resendInviteEmailMutation.mutateAsync({
                      teamId: team.id,
                      inviteId: i.id,
                    });
                    toast.success(`Invite resent to ${i.email}`);
                  }}
                >
                  Resend invite
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={async () => {
                    await navigator.clipboard.writeText(
                      getTeamInviteUrl({ code: i.code, email: i.email })
                    );
                  }}
                >
                  Copy invite link
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-red-500"
                  onClick={async () => {
                    await deleteInviteMutation.mutateAsync({
                      slug,
                      inviteId: i.id,
                    });
                    toast.success(`Invite to ${i.email} deleted`);
                  }}
                >
                  Delete invite
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      })}
    </div>
  );
};

export default function MembersPage() {
  return (
    <SettingsLayout
      title="Members"
      description={`Manage and invite team members`}
    >
      <div className="flex flex-col gap-y-8">
        <InviteSection />
        <div className="flex flex-col rounded-lg border bg-white">
          <h3 className="ml-6 mt-4 text-lg font-medium">People</h3>
          <Tabs defaultValue="members" className="pb-2">
            <TabsList className="ml-4 mt-3 mb-1">
              <TabsTrigger value="members">Members</TabsTrigger>
              <TabsTrigger value="invited">Invited</TabsTrigger>
            </TabsList>
            <TabsContent value="members">
              <MembersSection />
            </TabsContent>
            <TabsContent value="invited">
              <InvitedSection />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </SettingsLayout>
  );
}

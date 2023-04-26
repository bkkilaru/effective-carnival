import { useCallback } from "react";
import { TRPCClientError } from "@trpc/client";
import type { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Input } from "@/components/design-system/Input";
import { useTeam } from "@/lib/useTeam";
import { api } from "@/utils/api";
import { createSSG } from "@/utils/ssg";
import SettingsLayout from "./layout";
import SettingsCard from "@/components/app/SettingsCard";
import ConfirmSettingsCard from "@/components/app/ConfirmSettingsCard";

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const ssg = await createSSG(ctx);

  await ssg.teams.get.prefetch();

  return {
    props: {
      trpcState: ssg.dehydrate(),
    },
  };
};

export default function General() {
  const router = useRouter();
  const utils = api.useContext();
  const { team } = useTeam();
  const updateNameMutation = api.teams.updateName.useMutation({
    async onSuccess() {
      toast.success("Saved");
      await utils.invalidate(undefined, {
        queryKey: api.teams.get.getQueryKey(),
      });
    },
  });

  const updateSlugMutation = api.teams.updateSlug.useMutation({
    async onSuccess() {
      toast.success("Saved");
      await utils.invalidate(undefined, {
        queryKey: api.teams.get.getQueryKey(),
      });
    },
  });

  const [name, setName] = useState(team?.name ?? "");
  const [slug, setSlug] = useState(team?.slug ?? "");

  useEffect(() => {
    if (team && !name && !slug) {
      setName(team.name);
      setSlug(team.slug);
    }
  }, [name, slug, team]);

  const deleteMutation = api.teams.delete.useMutation();
  const leaveMutation = api.teams.leave.useMutation();
  const handleDeleteOrLeave = useCallback(
    async (action: "delete" | "leave") => {
      if (!team) return;

      const mutation = action === "delete" ? deleteMutation : leaveMutation;

      try {
        await mutation.mutateAsync({ teamId: team.id });
        await Promise.all([
          utils.invalidate(undefined, { queryKey: api.user.getQueryKey() }),
          utils.invalidate(undefined, {
            queryKey: api.teams.get.getQueryKey(),
          }),
        ]);
        await router.push("/");
      } catch (e) {
        if (e instanceof TRPCClientError) {
          toast.error(e.message);
        }
      }
    },
    [deleteMutation, leaveMutation, router, team, utils]
  );

  const handleDelete = () => handleDeleteOrLeave("delete");
  const handleLeave = () => handleDeleteOrLeave("leave");

  return (
    <SettingsLayout title="General" description="Your team settings">
      {team && (
        <div className="flex flex-col space-y-4">
          <SettingsCard
            title="Team name"
            description="This is your team's visible name within Demorepo. For example, the name of your company or department."
            button={{
              name: "Save",
              onClick: () => {
                void updateNameMutation.mutateAsync({
                  teamId: team.id,
                  name,
                });
              },
              loading: updateNameMutation.isLoading,
            }}
          >
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="max-w-sm"
              placeholder="Team name"
            />
          </SettingsCard>
          <SettingsCard
            title="URL Slug"
            description={`This is your team's URL slug. It will be used to access your team's dashboard.`}
            button={{
              name: "Save",
              onClick: async () => {
                try {
                  await updateSlugMutation.mutateAsync({
                    teamId: team.id,
                    slug,
                  });

                  await router.push(`/${slug}/settings/general`);
                } catch (e) {
                  if (e instanceof TRPCClientError) {
                    toast.error(e.message);
                  }
                }
              },
              loading: updateSlugMutation.isLoading,
            }}
          >
            <div className="flex items-center">
              <p className="flex h-10 items-center rounded-l-md border-y border-l border-gray-300 bg-gray-50 px-3 text-gray-500">
                https://demorepo.com/
              </p>
              <Input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="max-w-sm rounded-l-none"
              />
            </div>
          </SettingsCard>
          <ConfirmSettingsCard
            title="Leave team"
            description="Revoke your access to this team. Any resources you have added to this team will remain"
            button={{
              name: "Leave team",
              onClick: handleLeave,
              loading: leaveMutation.isLoading,
            }}
            alert={{
              title: "Are you sure?",
              description:
                "If you leave your team, you will have to be invited back in.",
            }}
          />
          <ConfirmSettingsCard
            title="Delete team"
            description="Permanently delete your team and all of its contents from the platform. This action is not reversible, so please continue with caution."
            button={{
              name: "Delete team",
              variant: "destructive",
              onClick: handleDelete,
              loading: deleteMutation.isLoading,
            }}
            alert={{
              title: "Are you absolutely sure?",
              description: `This action cannot be undone. This will permanently delete your team and remove your data from our servers.`,
            }}
          />
        </div>
      )}
    </SettingsLayout>
  );
}

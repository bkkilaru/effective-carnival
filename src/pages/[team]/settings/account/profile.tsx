import { useState } from "react";
import { toast } from "react-hot-toast";
import { Input } from "@/components/design-system/Input";
import { api } from "@/utils/api";
import SettingsLayout from "../layout";
import { createSSG } from "@/utils/ssg";
import type { GetServerSideProps } from "next";
import SettingsCard from "@/components/app/SettingsCard";
import useUser from "@/lib/useUser";

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { req, res } = context;

  const ssg = await createSSG({ req, res });

  await ssg.user.get.prefetch();

  return {
    props: {
      trpcState: ssg.dehydrate(),
    },
  };
};

export default function Profile() {
  const { user } = useUser();
  const utils = api.useContext();
  const updateUserMutation = api.user.update.useMutation({
    async onSuccess() {
      await utils.invalidate(undefined, {
        queryKey: api.user.get.getQueryKey(),
      });
      toast.success("Profile updated");
    },
  });
  const [name, setName] = useState(user?.name ?? "");

  if (!user) return null;

  return (
    <SettingsLayout title="Profile" description="Manage your personal info">
      <SettingsCard
        title="Full name"
        description="Your full name will be displayed on your profile and in your team."
        button={{
          name: "Save",
          onClick: () => updateUserMutation.mutateAsync({ name }),
          loading: updateUserMutation.isLoading,
        }}
      >
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="max-w-sm"
          placeholder="Your name"
        />
      </SettingsCard>
    </SettingsLayout>
  );
}

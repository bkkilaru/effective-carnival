import { useRouter } from "next/router";
import { api } from "@/utils/api";
import { Button } from "@/components/design-system/Button";
import Spinner from "@/components/design-system/Spinner";
import { useEffect } from "react";
import { useSession } from "next-auth/react";
import useUser from "@/lib/useUser";
import { LogIn } from "lucide-react";

export default function AcceptInvitePage() {
  const router = useRouter();
  const { status } = useSession();
  const { user } = useUser();
  const {
    data: invite,
    error,
    isLoading,
  } = api.teams.getOwnInvite.useQuery(
    { code: router.query.code as string },
    { enabled: !!router.query.code, retry: false }
  );
  const acceptInviteMutation = api.teams.acceptInvite.useMutation();

  useEffect(() => {
    if (status === "unauthenticated") {
      void router.push({ pathname: "/auth/sign-in", query: router.query });
    }
  }, [router, status]);

  return (
    <div className="flex h-full w-full flex-col items-center justify-center">
      {isLoading && <Spinner className="" />}
      {invite && (
        <div className="flex flex-col items-center space-y-6 rounded-lg">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gray-100">
            <LogIn className="h-8 w-8 text-gray-600" />
          </div>
          <h1 className="text-3xl font-semibold">
            Join {invite.team.name} on Demorepo
          </h1>
          <Button
            onClick={async () => {
              const { slug } = await acceptInviteMutation.mutateAsync({
                code: invite.code,
                email: invite.email,
              });
              if (!user?.hasOnboarded) {
                // hasn't gone through onboarding
                await router.push(`/`);
              } else {
                await router.push(`/${slug}`);
              }
            }}
            loading={acceptInviteMutation.isLoading}
          >
            Accept invite
          </Button>
        </div>
      )}
      {error && status === "authenticated" && (
        <div>
          {error.message}. Try refreshing the page or asking for another invite.
        </div>
      )}
    </div>
  );
}

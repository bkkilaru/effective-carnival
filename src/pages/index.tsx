import { useSession } from "next-auth/react";
import Onboarding from "@/components/app/Onboarding";
import posthog from "@/lib/posthogClient";
import useUser from "@/lib/useUser";
import UnauthenticatedHome from "@/components/home/landing-page/UnauthenticatedHome";
import Layout from "./layout";
import Spinner from "@/components/design-system/Spinner";

export default function Home() {
  const { data: session, status } = useSession();
  const { user } = useUser();

  if (user) {
    posthog()?.identify(user.id);
  }

  if (status === "unauthenticated") {
    return <UnauthenticatedHome />;
  }

  if (!session || !user) {
    return null;
  }

  if (!user.hasOnboarded) {
    return <Onboarding />;
  }

  return (
    <Layout
      pageName="Home"
      subtitle="Your page for critical information and summaries"
    >
      <div className="flex h-full w-full items-center justify-center">
        <Spinner className="" />
      </div>
    </Layout>
  );
}

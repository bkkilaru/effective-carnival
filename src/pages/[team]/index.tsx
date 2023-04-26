import type { GetServerSideProps } from "next/types";
import { useTeam } from "@/lib/useTeam";
import { createSSG } from "@/utils/ssg";
import Link from "next/link";
import { Button } from "@/components/design-system/Button";
import Layout from "../layout";
import { ArrowRight, Home } from "lucide-react";
import IconCircle from "@/components/app/IconCircle";
import FreePlanUpgradeBanner from "@/components/app/FreePlanUpgradeBanner";
import { DOCS_LINK } from "@/lib/links";

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { req, res } = context;

  const ssg = await createSSG({ req, res });

  await ssg.teams.get.prefetch();
  await ssg.user.get.prefetch();

  return {
    props: {
      trpcState: ssg.dehydrate(),
    },
  };
};

export default function TeamHome() {
  const { team } = useTeam();

  return (
    <Layout
      pageName="Home"
      subtitle="Your page for critical information and summaries"
    >
      <div className="flex h-full w-full justify-center md:items-center">
        <div className="flex flex-col items-center space-y-8 p-8 text-center">
          <IconCircle>
            <Home />
          </IconCircle>
          <div className="flex flex-col items-center space-y-2">
            <h1 className="text-xl font-medium">Welcome! Let's get started.</h1>
            <p className="w-3/4 text-gray-600">
              Explore the app from the sidebar or learn about all of the
              features in the docs.
            </p>
          </div>
          <Link href={DOCS_LINK} target="_blank" rel="noopener noreferrer">
            <Button>
              <ArrowRight className="mr-2 w-4" /> Go to Docs
            </Button>
          </Link>
        </div>
      </div>
      {team && !team.subscription && (
        <div className="absolute inset-x-0 bottom-32 mx-auto w-full md:bottom-12">
          <FreePlanUpgradeBanner />
        </div>
      )}
    </Layout>
  );
}

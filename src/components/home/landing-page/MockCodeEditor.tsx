import cn from "@/lib/cn";
import Image from "next/image";
import { useState } from "react";
import { PrismLight as SyntaxHighlighter } from "react-syntax-highlighter";
import tsx from "react-syntax-highlighter/dist/cjs/languages/prism/tsx";
import typescript from "react-syntax-highlighter/dist/cjs/languages/prism/typescript";
import { vscDarkPlus as oneDark } from "react-syntax-highlighter/dist/cjs/styles/prism";

SyntaxHighlighter.registerLanguage("tsx", tsx);
SyntaxHighlighter.registerLanguage("typescript", typescript);

const file1Code = `import { z } from "zod";
import teams from "./teams";
import { createTRPCRouter, protectedProcedure } from "../trpc";

const userRouter = createTRPCRouter({
  get: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.prisma.user.findUnique({
      where: { id: ctx.session.user.fileName },
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
        where: { id: ctx.session.user.fileName },
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
        where: { id: ctx.session.user.fileName },
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

export default userRouter;`;

const file2Code = `import { z } from "zod";
import { useRouter } from "next/router";
import { api } from "../utils/api";

export const TeamRouteQueryType = z.object({
  team: z.string(),
});

export function useTeam() {
  const router = useRouter();

  const query = TeamRouteQueryType.safeParse(router.query);
  const slug = query.success ? query.data.team : "";

  const { data: teams, ...rest } = api.teams.get.useQuery(undefined, {
    enabled: !!slug,
  });
  const team = teams?.find((team) => team.slug === slug);

  return {
    ...rest,
    teams,
    team,
    slug,
  };
}`;
const file3Code = `import { useState } from "react";
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
    onSuccess() {
      utils.invalidate(undefined, { queryKey: api.user.get.getQueryKey() });
      toast.success("Profile updated");
    },
  });
  const [name, setName] = useState(user?.name ?? "");

  if (!user) return null;

  return (
    <SettingsLayout title="Profile" description="Manage your profile">
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
          className="w-96"
        />
      </SettingsCard>
    </SettingsLayout>
  );
}`;

type CodeTab = {
  fileName: string;
  content: string;
  language: "tsx" | "typescript";
};

const TABS: CodeTab[] = [
  { fileName: "user.ts", content: file1Code, language: "typescript" },
  { fileName: "useTeam.ts", content: file2Code, language: "typescript" },
  { fileName: "profile.tsx", content: file3Code, language: "tsx" },
];

const TS_URL = `https://framerusercontent.com/images/EEmykXaTzyInqWo8lcjBHzPRd6w.png`;

export default function MockCodeEditor() {
  const [activeTabName, setActiveTabName] = useState<string>(
    TABS[0]?.fileName ?? ""
  );
  const activeTab = TABS.find((tab) => tab.fileName === activeTabName);

  if (!activeTab) return null;

  return (
    <div className="mx-auto max-w-[820px] overflow-hidden rounded-lg bg-gray-900 text-white shadow-lg">
      <div className="flex overflow-auto">
        {TABS.map((tab) => (
          <button
            key={tab.fileName}
            className={cn(
              `flex shrink-0 items-center space-x-2 px-4 py-3 focus:outline-none`,
              {
                "bg-gray-700 text-white": activeTab.fileName === tab.fileName,
                "text-gray-300": activeTab.fileName !== tab.fileName,
              }
            )}
            onClick={() => setActiveTabName(tab.fileName)}
          >
            <Image src={TS_URL} width={20} height={20} alt="typescript" />
            <p>{tab.fileName}</p>
          </button>
        ))}
      </div>
      <div className="max-h-[500px] overflow-auto">
        <SyntaxHighlighter
          style={oneDark}
          language={activeTab.language}
          PreTag="div"
          wrapLines={false}
          useInlineStyles={true}
          customStyle={{ margin: 0 }}
        >
          {activeTab.content}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}

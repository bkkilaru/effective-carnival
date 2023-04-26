import { z } from "zod";
import { useRouter } from "next/router";
import { api } from "../utils/api";
import { useEffect } from "react";
import { useSession } from "next-auth/react";

export const TeamRouteQueryType = z.object({
  team: z.string(),
});

export function useTeam({
  redirectToTeamPage = true,
}: {
  redirectToTeamPage?: boolean;
} = {}) {
  const router = useRouter();
  const { status } = useSession();

  const query = TeamRouteQueryType.safeParse(router.query);
  const slug = query.success ? query.data.team : "";

  const { data: teams, ...rest } = api.teams.get.useQuery(undefined, {
    enabled: status === "authenticated",
  });
  const team = slug ? teams?.find((team) => team.slug === slug) : teams?.[0];

  useEffect(() => {
    // if you're on '/' and donare logged in, select a team
    if (router.pathname !== "/" || !redirectToTeamPage) return;

    const fn = async () => {
      if (team && !slug) {
        await router.push(`/${team.slug}`);
      }
    };

    void fn();
  }, [team, teams, slug, router, redirectToTeamPage]);

  return {
    ...rest,
    teams,
    product: team?.subscription?.price.product ?? null,
    team,
    slug,
  };
}

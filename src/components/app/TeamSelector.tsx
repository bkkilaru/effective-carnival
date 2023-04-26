import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "../design-system/Dropdown";
import { useRouter } from "next/router";
import React, { useCallback, useState } from "react";
import { useTeam } from "@/lib/useTeam";
import { Avatar, AvatarFallback } from "../design-system/Avatar";
import Spinner from "../design-system/Spinner";
import CreateTeamModal from "./CreateTeamModal";
import type { Team } from "@prisma/client";
import { Check, ChevronDown, Plus } from "lucide-react";

export default function TeamSelector() {
  const router = useRouter();
  const { team, teams, slug, isLoading } = useTeam();

  const handleSelectTeam = useCallback(
    async (team: Team) => {
      await router.push(`/${team.slug}`);
    },
    [router]
  );

  const [createModalOpen, setCreateModalOpen] = useState(false);

  const loading = isLoading;

  return (
    <>
      <CreateTeamModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
      />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex select-none items-center justify-between rounded-lg bg-white p-2 shadow-outline transition hover:shadow-md-outline">
            <div className="flex items-center space-x-2">
              <Avatar>
                <AvatarFallback>
                  {loading ? (
                    <Spinner size="small" className="py-3" />
                  ) : (
                    team?.name[0] ?? ""
                  )}
                </AvatarFallback>
              </Avatar>
              <p className="font-medium">{team?.name ?? "Loading"}</p>
            </div>
            <ChevronDown className="w-4 text-gray-500" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="animate-slideDownAndFadeIn rounded-md bg-white text-gray-900 transition"
          align="start"
          sideOffset={4}
        >
          {teams && teams.length > 0 && (
            <div className="flex flex-col">
              {teams.map((t) => {
                const selected = t.slug === slug;
                return (
                  <DropdownMenuItem
                    key={t.id}
                    className="flex w-full items-center gap-x-2 px-3 py-2"
                    onClick={async () => {
                      if (!t.id || t.slug === slug) return;

                      await handleSelectTeam(t);
                    }}
                  >
                    <Avatar>
                      <AvatarFallback>{t.name[0]}</AvatarFallback>
                    </Avatar>
                    <p className="">{t.name}</p>
                    {selected && <Check className="w-4" />}
                  </DropdownMenuItem>
                );
              })}
            </div>
          )}
          <DropdownMenuItem
            className="flex gap-x-2 rounded-b px-3 text-gray-600"
            onClick={() => {
              setCreateModalOpen(true);
            }}
          >
            <Plus className="mx-3 w-4" />
            Create team
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}

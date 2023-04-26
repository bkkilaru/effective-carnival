import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "../design-system/Dropdown";
import { signOut } from "next-auth/react";
import { useRouter } from "next/router";
import React, { useCallback } from "react";
import { useTeam } from "@/lib/useTeam";
import { Avatar, AvatarFallback, AvatarImage } from "../design-system/Avatar";
import cn from "@/lib/cn";
import useUser from "@/lib/useUser";
import { Book, ChevronUp, LogOut, UserIcon } from "lucide-react";
import { DOCS_LINK } from "@/lib/links";

function MenuItem({
  children,
  onClick,
  className,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <DropdownMenuItem
      onClick={onClick}
      className={cn(
        "flex w-full cursor-pointer items-center gap-x-2 px-4 py-2",
        className
      )}
    >
      {children}
    </DropdownMenuItem>
  );
}

export default function UserProfileButton() {
  const router = useRouter();
  const { user } = useUser();
  const { team } = useTeam();

  const handleSignOut = useCallback(() => {
    void signOut({ callbackUrl: "/" });
  }, []);

  if (!user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex w-full select-none items-center justify-between">
          <div className="flex items-center space-x-2 text-left">
            <Avatar className="rounded-full">
              <AvatarFallback>
                {user.name?.[0] ?? user.email?.[0] ?? ""}
              </AvatarFallback>
              <AvatarImage src={user.image ?? undefined} />
            </Avatar>
            <div className="flex flex-col">
              <p className="font-medium">{user.name}</p>
              <p>{user.email}</p>
            </div>
          </div>
          <ChevronUp className="w-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="ml-12 mb-4 animate-slideDownAndFadeIn rounded-md bg-white shadow-lg transition"
        align="start"
        sideOffset={4}
      >
        {team && (
          <MenuItem
            onClick={() =>
              router.push(`/${team.slug}/settings/account/profile`)
            }
          >
            <UserIcon className="w-4" />
            Profile
          </MenuItem>
        )}
        <MenuItem onClick={() => router.push("/docs")}>
          <Book className="w-4" />
          Documentation
        </MenuItem>
        <MenuItem onClick={handleSignOut} className="text-gray-500">
          <LogOut className="w-4" />
          Sign out
        </MenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

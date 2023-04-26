import Logo from "@/components/design-system/Logo";
import TeamSelector from "./TeamSelector";
import UserProfileButton from "./UserProfileDropdown";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/design-system/Collapsible";
import type { LucideIcon } from "lucide-react";
import { ChevronDown } from "lucide-react";
import { Home, ListChecks, Settings } from "lucide-react";
import { useRouter } from "next/router";
import { useTeam } from "@/lib/useTeam";
import { Button } from "../design-system/Button";
import cn from "@/lib/cn";
import Link from "next/link";
import type { UrlObject } from "url";
import Separator from "../design-system/Separator";
import { useState } from "react";
import { SETUP_STEPS } from "./Setup";

interface Step {
  id: string;
  name: string;
  href: UrlObject;
}

interface StepsProps {
  steps: Step[];
  activeStepId: string;
}

const Steps: React.FC<StepsProps> = ({ steps, activeStepId }) => {
  return (
    <div className="relative flex w-full flex-col py-2">
      <div className="absolute left-[15px] top-[28px] bottom-[25px] border-l border-gray-200 py-2" />
      <div className="flex flex-col space-y-1">
        {steps.map((step) => (
          <div key={step.id} className={cn(`ml-4 flex items-center`)}>
            <div
              className={cn(`z-10 -ml-[3.5px] mr-2 h-1.5 w-1.5 rounded-full`, {
                "bg-black font-semibold": step.id === activeStepId,
                "bg-gray-200 font-normal": step.id !== activeStepId,
              })}
            />
            <Link href={step.href} className="w-full">
              <Button
                size="sm"
                variant={"subtle"}
                className={cn("block w-full py-1 text-left", {
                  "font-semibold text-black": step.id === activeStepId,
                  "font-normal text-gray-500": step.id !== activeStepId,
                })}
              >
                {step.name}
              </Button>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

const Option = ({
  icon: Icon,
  title,
  pathname,
  expansion = { allowed: false, expanded: false },
}: {
  icon: LucideIcon;
  title: string;
  pathname: string;
  expansion?: {
    allowed: boolean;
    expanded: boolean;
  };
}) => {
  const router = useRouter();
  return (
    <div className="flex w-full items-center justify-between rounded-md p-2 font-medium transition hover:bg-gray-200">
      <div
        className={cn("flex items-center text-gray-700", {
          "font-semibold text-gray-900": router.pathname === pathname,
        })}
      >
        <Icon className="mr-2 w-4" />
        <span>{title}</span>
      </div>
      {expansion.allowed && (
        <ChevronDown
          className={cn("w-4 text-gray-500 transition", {
            "rotate-180 transform": expansion.expanded,
          })}
        />
      )}
    </div>
  );
};

export default function Sidebar() {
  const router = useRouter();
  const { team } = useTeam();
  const [settingsExpanded, setSettingsExpanded] = useState(
    router.pathname.includes("/settings")
  );
  const [setupExpanded, setSetupExpanded] = useState(
    router.pathname.includes("/setup")
  );

  return (
    <nav className="flex h-full w-full flex-col border-r border-gray-200 bg-gray-100 py-4">
      <div className="flex h-full flex-col space-y-6 px-4">
        <Logo variant="wordmark" className="my-12" />
        <TeamSelector />
        <div className="flex cursor-pointer flex-col">
          <Link href={{ pathname: "/[team]/", query: { team: team?.slug } }}>
            <Option title="Home" icon={Home} pathname="/[team]" />
          </Link>
          <Collapsible
            open={settingsExpanded}
            onOpenChange={setSettingsExpanded}
          >
            <CollapsibleTrigger className="flex w-full items-center justify-between">
              <Option
                title="Settings"
                icon={Settings}
                pathname="/[team]/settings"
                expansion={{
                  allowed: true,
                  expanded: settingsExpanded,
                }}
              />
            </CollapsibleTrigger>
            <CollapsibleContent className="flex flex-col items-start pl-2">
              <Steps
                activeStepId={router.pathname.replaceAll(
                  `/[team]/settings/`,
                  ""
                )}
                steps={["General", "Members", "Billing"].map((pageName) => {
                  return {
                    id: pageName.toLowerCase(),
                    name: pageName,
                    href: {
                      pathname: `/[team]/settings/${pageName.toLowerCase()}`,
                      query: { team: team?.slug },
                    },
                  };
                })}
              />
            </CollapsibleContent>
          </Collapsible>
        </div>
      </div>
      <Separator className="m-4" />
      <div className="py-2 px-4">
        <UserProfileButton />
      </div>
    </nav>
  );
}

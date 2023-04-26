import cn from "@/lib/cn";
import { useTeam } from "@/lib/useTeam";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "../design-system/Button";

const LS_KEY = "free-plan-upgrade-banner-dismissed";

export default function FreePlanUpgradeBanner() {
  const { team } = useTeam();
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    if (localStorage.getItem(LS_KEY) !== "true") {
      setDismissed(false);
    } else {
      setDismissed(true);
    }
  }, []);

  if (dismissed) return null;

  return (
    <div
      className={cn(
        "mx-auto flex w-[90%] flex-col items-center justify-between gap-2 rounded-md bg-gray-100 py-4 px-6 shadow-lg-outline md:flex-row"
      )}
    >
      <span>You're currently on the Free plan</span>
      <div className="flex items-center space-x-2">
        <Button
          variant="link"
          onClick={() => {
            localStorage.setItem(LS_KEY, "true");
            setDismissed(true);
          }}
        >
          Dismiss
        </Button>
        <Link href={`/${team?.slug}/settings/billing`}>
          <Button>Upgrade</Button>
        </Link>
      </div>
    </div>
  );
}

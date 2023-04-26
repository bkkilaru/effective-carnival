import { useRouter } from "next/router";
import { z } from "zod";
import { Button } from "@/components/design-system/Button";
import Link from "next/link";
import { AlertTriangle, ArrowLeft } from "lucide-react";

const ERROR_DESCRIPTION: Record<string, string> = {
  Verification: "Your sign in link has expired. Please try to sign in again.",
  Default: "Please try again.",
  AccessDenied: "You do not have access to this page.",
  Configuration:
    "Authentication has not been configured properly. Please contact the administrator.",
};

const ERROR_TITLES: Record<string, string> = {
  Verification: "Email link expired",
  Default: "Something went wrong",
  AccessDenied: "Access denied",
  Configuration: "Configuration error",
};

const QueryParams = z.object({
  error: z.string(),
});

export default function ErrorPage() {
  const router = useRouter();
  const params = QueryParams.safeParse(router.query);

  const errorKey =
    params.success && params.data.error in ERROR_TITLES
      ? params.data.error
      : "Default";

  const title = ERROR_TITLES[errorKey];
  const description = ERROR_DESCRIPTION[errorKey];

  return (
    <div className="flex h-full w-full flex-col items-center justify-center">
      {params.success && (
        <div className="flex flex-col items-center space-y-6 ">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gray-100">
            <AlertTriangle className="h-8 w-8 text-gray-600" />
          </div>
          <h1 className="text-3xl font-semibold">{title}</h1>
          <p className="text-center text-lg">
            <span className="text-gray-500">{description}</span>
          </p>
          <Link href="/auth/sign-in">
            <Button variant="link">
              <ArrowLeft className="mr-2 w-4" />
              <span>Back to login</span>
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}

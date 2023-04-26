import { useRouter } from "next/router";
import { z } from "zod";
import { Button } from "@/components/design-system/Button";
import Link from "next/link";
import { useSession } from "next-auth/react";
import IconCircle from "@/components/app/IconCircle";
import { ArrowLeft, Mail } from "lucide-react";

const QueryParams = z.object({
  email: z.string(),
});

export default function CheckEmailPage() {
  const router = useRouter();
  const params = QueryParams.safeParse(router.query);
  const { status } = useSession();

  return (
    <div className="flex h-full w-full flex-col items-center justify-center">
      {params.success && (
        <div className="flex flex-col items-center space-y-6 ">
          <IconCircle>
            <Mail className="h-6 w-6 text-gray-600" />
          </IconCircle>
          <h1 className="text-3xl font-semibold">Check your email</h1>
          <p className="text-center text-lg">
            <span className="text-gray-500">We emailed a sign-in link to</span>
            <br />
            <span className="font-semibold">{params.data.email}</span>
          </p>
          <Link href={status === "authenticated" ? "/" : "/auth/sign-in"}>
            <Button variant="link">
              <ArrowLeft className="mr-2 w-4" />
              <span>
                Back to {status === "authenticated" ? "home" : "login"}
              </span>
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}

import Image from "next/image";
import googleLogo from "@/public/logos/google.svg";
import type { FormEvent } from "react";
import { useEffect } from "react";
import { useCallback, useState } from "react";
import { useRouter } from "next/router";
import { Input } from "@/components/design-system/Input";
import { Button } from "@/components/design-system/Button";
import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { getProviders, signIn } from "next-auth/react";
import { z } from "zod";
import getTeamInviteUrl from "@/utils/getTeamInviteUrl";
import Logo from "@/components/design-system/Logo";
import { useLocalStorage } from "usehooks-ts";
import { nanoid } from "nanoid";
import { api } from "@/utils/api";
import { toast } from "react-hot-toast";

type Providers = Awaited<ReturnType<typeof getProviders>>;

const AcceptInviteParams = z.object({
  code: z.string(),
  email: z.string(),
});

export const getServerSideProps: GetServerSideProps<{
  providers: Providers;
}> = async () => {
  const providers = await getProviders();
  return {
    props: { providers },
  };
};

export default function SignInPage({
  providers,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const acceptInviteParams = AcceptInviteParams.safeParse(router.query);
  const redirectToAcceptInvitePage = acceptInviteParams.success;
  const callbackUrl = redirectToAcceptInvitePage
    ? getTeamInviteUrl({
        code: acceptInviteParams.data.code,
        email: acceptInviteParams.data.email,
      })
    : "/";

  useEffect(() => {
    if (!email && acceptInviteParams.success) {
      setEmail(decodeURIComponent(acceptInviteParams.data.email));
    }
  }, [acceptInviteParams, email]);

  const handleSignInWithEmail = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();

      if (!email) return;

      setIsLoading(true);
      try {
        const signInResp = await signIn(providers?.email.id, {
          email,
          redirect: false,
          callbackUrl,
        });

        if (signInResp?.ok) {
          await router.push(
            `/auth/check-email?email=${encodeURIComponent(email)}`
          );
        }
      } catch {}

      setIsLoading(false);
    },
    [email, providers, router, callbackUrl]
  );

  const registerAnonymouslyMutation =
    api.user.registerAnonymously.useMutation();
  const [anonymousId, setAnomyousId] = useLocalStorage("anonymousId", "");
  const handleAnonymousSignIn = useCallback(async () => {
    setIsLoading(true);

    let loginId = anonymousId;
    // if you don't have an id, create one
    if (!loginId) {
      loginId = nanoid();
      try {
        await registerAnonymouslyMutation.mutateAsync({ id: loginId });
        setAnomyousId(loginId);
      } catch {
        toast.error("Something went wrong. Please try again later.");
      }
    }

    try {
      await signIn(providers?.credentials.id, {
        localstorageId: loginId,
        callbackUrl,
      });
    } catch {}
    setIsLoading(false);
  }, [
    anonymousId,
    registerAnonymouslyMutation,
    providers,
    setAnomyousId,
    callbackUrl,
  ]);

  return (
    <div className="flex h-full flex-col items-center justify-center">
      <div className="mx-auto flex w-full max-w-sm flex-col items-center space-y-4 px-4">
        <Logo className="" variant="logo" />
        <h1 className="text-3xl font-semibold">Log in or sign up</h1>
        <p className="text-lg text-gray-500">Welcome to Demorepo</p>
        <form
          className="flex w-full flex-col space-y-4"
          onSubmit={handleSignInWithEmail}
        >
          <div className="flex flex-col">
            <label className="mb-2 font-medium" htmlFor="email">
              Email
            </label>
            <Input
              className=""
              type="email"
              name="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <Button className="w-full" loading={isLoading}>
            Email sign-in link
          </Button>
        </form>
        {providers?.google && (
          <Button
            variant="outline"
            className="flex w-full items-center justify-center gap-x-2 rounded-lg bg-white py-2"
            onClick={() => {
              void signIn(providers.google.id, {
                redirect: false,
                callbackUrl,
              });
            }}
            disabled={isLoading}
          >
            <Image priority src={googleLogo} alt={"google icon"} />
            <span>Continue with Google</span>
          </Button>
        )}
        {providers?.credentials && (
          <Button
            variant="outline"
            className="flex w-full items-center justify-center gap-x-2 rounded-lg bg-white py-2"
            onClick={handleAnonymousSignIn}
            loading={registerAnonymouslyMutation.isLoading || isLoading}
          >
            <span>Continue with temporary account</span>
          </Button>
        )}
      </div>
    </div>
  );
}

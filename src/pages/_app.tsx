import Head from "next/head";
import { Toaster } from "react-hot-toast";
import { Inter, JetBrains_Mono } from "@next/font/google";
import type { AppType } from "next/app";
import "@/styles/globals.css";
import { api } from "@/utils/api";
import { SessionProvider } from "next-auth/react";
import type { Session } from "next-auth";
import { useEffect } from "react";
import { useRouter } from "next/router";
import posthog from "@/lib/posthogClient";

const inter = Inter({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
  variable: "--inter-font",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800"],
  variable: "--jetbrains-mono-font",
  display: "swap",
});

const App: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  const router = useRouter();
  useEffect(() => {
    // Track page views
    const handleRouteChange = () => posthog()?.capture("$pageview");
    router.events.on("routeChangeComplete", handleRouteChange);

    return () => {
      router.events.off("routeChangeComplete", handleRouteChange);
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <style jsx global>
        {`
          :root {
            --inter-font: ${inter.style.fontFamily};
            --jetbrains-mono-font: ${jetbrainsMono.style.fontFamily};
          }
        `}
      </style>
      <SessionProvider session={session}>
        <Head>
          <title>Demorepo</title>
          <meta name="description" content="The best product ever built." />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <main className={"h-full"}>
          <Component {...pageProps} className={""} />
          <Toaster />
        </main>
      </SessionProvider>
    </>
  );
};

export default api.withTRPC(App);

import cn from "@/lib/cn";
import NextLink from "next/link";
import { useCallback, useState } from "react";
import {
  clientEnv,
  DEFAULT_VALUE_DO_NOT_USE_IN_PRODUCTION,
} from "@/env/schema.mjs";
import { api } from "@/utils/api";
import _ from "lodash";
import { Button } from "@/components/design-system/Button";
import { Tabs } from "@/components/design-system/Tabs";
import {
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../design-system/TabSelector";
import toast from "react-hot-toast";
import type { LucideIcon } from "lucide-react";
import { Globe, Lock, Mail, Rocket, Table } from "lucide-react";
import { ArrowLeft, ArrowRight, BarChart, DollarSign } from "lucide-react";

const isValidValue = (value: string | undefined) => {
  return !!value && !value.includes(DEFAULT_VALUE_DO_NOT_USE_IN_PRODUCTION);
};

const MultilineCode = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex w-full flex-col rounded border bg-gray-100 px-4 py-3 font-mono">
      {children}
    </div>
  );
};

const InlineCode = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <code
    className={cn(
      "whitespace-pre-line rounded bg-gray-100 py-[2px] px-[5px] text-gray-900",
      className
    )}
  >
    {children}
  </code>
);

const Var = ({
  envKey,
  value,
  description,
}: {
  envKey: string;
  value: string | undefined;
  description?: React.ReactNode;
}) => {
  const isValid = isValidValue(value);
  let displayValue = value ?? "";
  if (!value || !isValid) {
    displayValue = "Not set";
  }
  displayValue =
    displayValue.length > 30 ? `${displayValue.slice(0, 30)}...` : displayValue;

  return (
    <div className="my-1 flex flex-col rounded-md border bg-white px-4 py-2">
      <div className="flex items-center justify-between">
        <span className="font-mono font-medium">{envKey}</span>
        <div
          className={cn(
            "flex items-center rounded-full px-2 py-[1px] text-[0.75rem] font-medium",
            {
              "bg-green-200 text-green-900": isValid,
              "bg-red-200 text-red-900": !isValid,
            }
          )}
        >
          <span className="">{displayValue}</span>
        </div>
      </div>
      {description}
    </div>
  );
};

const Link = ({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) => (
  <NextLink
    className="text-blue-500 underline hover:text-blue-400"
    href={href}
    target="_blank"
    rel="noopener noreferrer"
  >
    {children}
  </NextLink>
);

const StepCard = ({
  stepNum,
  name,
  icon: Icon,
  onGoToStep,
  currentStep,
}: {
  name: SetupStep;
  stepNum: number;
  icon: LucideIcon;
  currentStep: SetupStep;
  onGoToStep: (stepName: SetupStep) => void;
}) => {
  const selected = name === currentStep;
  return (
    <div
      className={cn(
        "relative w-36 cursor-pointer rounded border bg-white py-2 px-4 shadow-sm transition hover:shadow",
        {
          "border-primary-500 bg-primary-50": selected,
        }
      )}
      onClick={() => onGoToStep(name)}
    >
      <div className="z-10">
        <p
          className={cn("font-base mb-4 text-xl", {
            "text-gray-500 ": !selected,
            "text-primary-900 ": selected,
          })}
        >
          {stepNum}
        </p>
        <p
          className={cn("font-mono text-lg font-medium", {
            "text-gray-500": !selected,
            "text-primary-900": selected,
          })}
        >
          {name}
        </p>
      </div>
      <div
        className={cn("absolute top-2.5 right-2.5", {
          "text-gray-500 ": !selected,
          "text-primary-900 ": selected,
        })}
      >
        <Icon className="h-6 w-6" />
      </div>
    </div>
  );
};

export const SETUP_STEPS: {
  path: string;
  name: SetupStep;
  icon: LucideIcon;
  content: React.ComponentType<{ env: Record<string, string | undefined> }>;
}[] = [
  {
    path: "hosting",
    name: "Hosting",
    icon: Globe,
    content: HostingContent,
  },
  {
    path: "database",
    name: "Database",
    icon: Table,
    content: DatabaseContent,
  },
  {
    path: "auth",
    name: "Auth",
    icon: Lock,
    content: AuthContent,
  },
  {
    path: "billing",
    name: "Billing",
    icon: DollarSign,
    content: BillingContent,
  },
  {
    path: "email",
    name: "Email",
    icon: Mail,
    content: EmailContent,
  },
  {
    path: "analytics",
    name: "Analytics",
    icon: BarChart,
    content: AnalyticsContent,
  },
  {
    path: "wrap-up",
    name: "Wrap up",
    icon: Rocket,
    content: WrapUpContent,
  },
];

export type SetupStep =
  | "Hosting"
  | "Database"
  | "Auth"
  | "Billing"
  | "Email"
  | "Analytics"
  | "Wrap up";

export default function Setup() {
  const backendVars = api.setup.vars.useQuery();

  const env = {
    ...backendVars.data,
    ..._.mapValues(clientEnv, (x) =>
      x === "" || x === DEFAULT_VALUE_DO_NOT_USE_IN_PRODUCTION || !x
        ? undefined
        : "Set"
    ),
  };

  const handleSelectCard = useCallback((name: string) => {
    const step = SETUP_STEPS.find((s) => s.name === name);
    if (!step) return;
    setSetupStep(step.name);
  }, []);

  const [setupStep, setSetupStep] = useState("Hosting");
  const stepIdx = SETUP_STEPS.findIndex((s) => s.name === setupStep);
  const step = SETUP_STEPS[stepIdx];

  if (!step) return null;

  return (
    <div className="flex w-full gap-8 px-4">
      <div className="flex flex-col flex-wrap gap-4">
        {SETUP_STEPS.map(({ name, icon }, i) => (
          <StepCard
            key={i}
            stepNum={i + 1}
            currentStep={step.name}
            name={name}
            icon={icon}
            onGoToStep={handleSelectCard}
          />
        ))}
      </div>
      <div className="flex max-w-3xl flex-col">
        {/* <p className="mb-4 font-mono text-xl font-medium">{step.name}</p> */}
        <div className="mb-8 max-w-2xl leading-relaxed">
          <step.content env={env} />
        </div>
        <div className="flex items-center justify-between">
          {stepIdx > 1 ? (
            <Button
              onClick={() => handleSelectCard(SETUP_STEPS[stepIdx - 1]!.name)}
              className="self-start"
            >
              <ArrowLeft className="mr-1 w-4" />
              Previous
            </Button>
          ) : (
            <div />
          )}
          {stepIdx < SETUP_STEPS.length - 1 && (
            <Button
              onClick={() => handleSelectCard(SETUP_STEPS[stepIdx + 1]!.name)}
              className="self-start"
            >
              Next
              <ArrowRight className="ml-1 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function ContentBlock({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col space-y-2", className)}>{children}</div>
  );
}

function HostingContent({ env }: { env: Record<string, string | undefined> }) {
  return (
    <ContentBlock>
      <p>
        We'll use Vercel to host your app. If you're not familiar with Vercel,
        check out their <Link href="todo">tutorial</Link> on how to setup a
        project.
      </p>
      <MultilineCode>
        cd ~/your-repo
        <br />
        yarn global add vercel
        <br />
        yarn install
        <br />
        vercel login
        <br />
        vercel link
        <br />
        yarn dev
      </MultilineCode>
      <p>
        Over the next steps, we'll be adding multiple environment variables to
        Vercel and then pulling them down into our local environment. For the
        purposes of this tutorial, we'll assume everything is "production."
      </p>
      <p>
        The first environment variable is{" "}
        <InlineCode>NEXT_PUBLIC_HOST</InlineCode>. Many features such as email
        sign in links and team email invite links need this URL to function. Set
        this var to the URL of the domain you're going to be deploying in (ex:
        https://yourproject.com). If this var is not set, Scalerepo will default
        to using <InlineCode>VERCEL_URL</InlineCode>. See{" "}
        <InlineCode>src/utils/getBaseUrl.ts</InlineCode> for this logic.
      </p>
      <p>
        If you're not sure on how to add environment variables to Vercel, check
        out their{" "}
        <Link href="https://vercel.com/guides/how-to-add-vercel-environment-variables">
          documentation
        </Link>{" "}
        here. For the purposes of this onboarding, just check all three
        environments (Production, Preview, and Development).
      </p>
      <p>
        Once you've added the env var, pull your variable down to your local dev
        environment by running <InlineCode>yarn pull-secrets</InlineCode>. If
        you've set your env var correctly, you should see your connection string
        in your <InlineCode>.env.local</InlineCode> file and the display below
        will show the value.
      </p>
      <Var envKey="NEXT_PUBLIC_HOST" value={env.NEXT_PUBLIC_HOST} />
    </ContentBlock>
  );
}

function DatabaseContent({ env }: { env: Record<string, string | undefined> }) {
  return (
    <ContentBlock>
      <p>
        Scalerepo supports any Prisma compatible SQL database. You'll most
        likely want to use MySQL or Postgres. We want to set the{" "}
        <InlineCode>DATABASE_URL</InlineCode> environment to a connection string
        that Prisma can use.
      </p>
      <Tabs defaultValue="planetscale" id="db-host">
        <TabsList>
          <TabsTrigger value="planetscale">Planetscale</TabsTrigger>
          <TabsTrigger value="supabase">Supabase</TabsTrigger>
          <TabsTrigger value="railway">Railway</TabsTrigger>
        </TabsList>
        <TabsContent value="planetscale" className="bg-white">
          <ContentBlock>
            <p>
              Create a Planetscale account and follow their very quick{" "}
              <Link href="https://planetscale.com/docs/tutorials/planetscale-quick-start-guide#create-a-database">
                instructions
              </Link>{" "}
              to create a database. You can just follow the "Create a database"
              section and skip the rest, since we'll be pushing a schema from
              our local env.
            </p>
            <p>
              Once you create a database, go to your Planetscale dashboard and
              click on "Connect". Choose Prisma as your connector go through the
              steps to get a connection string.
            </p>
            <p>Your connection string should look something like this:</p>
            <InlineCode>
              mysql://some_random_string:pscale_pw_some_random_string@us-east.connect.psdb.cloud/my-planetscale-db?sslaccept=strict
            </InlineCode>
          </ContentBlock>
        </TabsContent>
        <TabsContent value="supabase" className="bg-white">
          <ContentBlock>
            <p>
              You just need a Postgres connection string from Supabase. You can
              use an existing database or create a new one in the Supabase{" "}
              <Link href="https://app.supabase.com/">dashboard</Link>.
            </p>
            <p>
              Next, open <InlineCode>schema.prisma</InlineCode> in your code
              editor and change <InlineCode>provider = "mysql"</InlineCode> to{" "}
              <InlineCode>provider = "postgresql"</InlineCode>
            </p>
          </ContentBlock>
        </TabsContent>
        <TabsContent value="railway" className="bg-white">
          <ContentBlock>
            <p>
              You just need a Postgres connection string from Railway. You can
              use an existing database or create a new one from the{" "}
              <Link href="https://railway.app/new">dashboard</Link>.
            </p>
            <p>
              If you chose a Postgres instead of a MySQL database, open{" "}
              <InlineCode>schema.prisma</InlineCode> in your code editor and
              change <InlineCode>provider = "mysql"</InlineCode> to{" "}
              <InlineCode>provider = "postgresql"</InlineCode>
            </p>
          </ContentBlock>
        </TabsContent>
      </Tabs>
      <p>
        Now, add your connection string to Vercel. Once you've added the env
        var, pull your variable down to your local dev environment using{" "}
        <InlineCode>yarn pull-secrets</InlineCode>. If you've set your env var
        correctly, you should see your connection string in your{" "}
        <InlineCode>.env.local</InlineCode> file and the display below will say
        "Set".
      </p>
      <Var envKey="DATABASE_URL" value={env.DATABASE_URL} />
      <p>
        Now, push the schema to the database with{" "}
        <InlineCode>yarn prisma db push</InlineCode>.
      </p>
    </ContentBlock>
  );
}

function AuthContent({ env }: { env: Record<string, string | undefined> }) {
  return (
    <ContentBlock>
      <p>
        Scalerepo uses <Link href="https://authjs.dev">Auth.js</Link> (fka
        NextAuth) to easily support multiple auth providers. To avoid confusion
        with the env var names, we'll continue to refer to this as NextAuth in
        the rest of the setup.
      </p>
      <p>
        We need to configure two variables for NextAuth to work:{" "}
        <InlineCode>NEXTAUTH_URL</InlineCode> and{" "}
        <InlineCode>NEXTAUTH_SECRET</InlineCode>. We've already set up{" "}
        <InlineCode>NEXTAUTH_URL</InlineCode> for you (see{" "}
        <InlineCode>package.json</InlineCode>), but you'll need to set up{" "}
        <InlineCode>NEXTAUTH_SECRET</InlineCode> yourself.
      </p>
      <p>
        To generate a <InlineCode>NEXTAUTH_SECRET</InlineCode>, you can run{" "}
        <InlineCode>openssl rand -base64 32</InlineCode> in your terminal or use
        this <Link href="https://generate-secret.vercel.app">website</Link> to
        generate a value. Add the <InlineCode>NEXTAUTH_SECRET</InlineCode>{" "}
        variable to Vercel and run <InlineCode>yarn pull-secrets</InlineCode>.
        If you've done these steps correctly, you should see "Set" below.
      </p>
      <Var envKey="NEXTAUTH_SECRET" value={env.NEXTAUTH_SECRET} />
      <p>
        Now, we need to set up at least one auth provider to create user
        accounts. If you want to get spun up ASAP, Email magic link is probably
        your best choice. Scalerepo comes with Google and Email magic link
        configured out of the box. If you want to use another provider like
        Github or Discord, check out the NextAuth provider{" "}
        <Link href="https://next-auth.js.org/providers/">docs</Link>.
      </p>
      <Tabs defaultValue="email">
        <TabsList>
          <TabsTrigger value="email">Email magic link</TabsTrigger>
          <TabsTrigger value="google">Google</TabsTrigger>
        </TabsList>
        <TabsContent value="email" className="bg-white">
          <ContentBlock>
            <p className="">
              To set up email based auth, you'll need some SMTP info from your
              mail provider (eg. Mailgun, Sendgrid, Postmark, etc.). You'll need
              an SMTP host, port, user and password. Add these values into the
              respective env vars in vercel.
            </p>
            <Var envKey="EMAIL_SMTP_HOST" value={env.EMAIL_SMTP_HOST} />
            <Var envKey="EMAIL_SMTP_PORT" value={env.EMAIL_SMTP_PORT} />
            <Var envKey="EMAIL_SMTP_USER" value={env.EMAIL_SMTP_USER} />
            <Var envKey="EMAIL_SMTP_PASSWORD" value={env.EMAIL_SMTP_PASSWORD} />
          </ContentBlock>
        </TabsContent>
        <TabsContent value="discord" className="bg-white">
          discord
        </TabsContent>
        <TabsContent value="github" className="bg-white">
          github
        </TabsContent>
        <TabsContent value="google" className="bg-white">
          <ContentBlock>
            <p className="">
              To set up Google auth, you'll need to set the following
              environment variables. Check out Google's{" "}
              <Link href="https://developers.google.com/identity/protocols/oauth2">
                documentation
              </Link>{" "}
              on how to get these values. Once you've added them, you should see
              a "Continue with Google" automatically pop up on the{" "}
              <Link href="/auth/sign-in">sign in</Link> page.
            </p>
            <Var envKey="GOOGLE_CLIENT_ID" value={env.GOOGLE_CLIENT_ID} />
            <Var
              envKey="GOOGLE_CLIENT_SECRET"
              value={env.GOOGLE_CLIENT_SECRET}
            />
          </ContentBlock>
        </TabsContent>
      </Tabs>
      <p>
        You can add, edit, or remove any auth provider config in{" "}
        <InlineCode>src/lib/authOptions.ts</InlineCode>
      </p>
    </ContentBlock>
  );
}

function BillingContent({ env }: { env: Record<string, string | undefined> }) {
  const syncStripeProductsMutation = api.setup.syncStripeProducts.useMutation();

  return (
    <ContentBlock>
      <h2 className="text-lg font-medium">Setup environment variables</h2>
      <p>
        Scalerepo uses Stripe to handle billing. Once you've connected Stripe,
        customers can manage their payments from the Stripe billing portal on
        the <InlineCode>/billing</InlineCode> page.
      </p>
      <Var envKey="STRIPE_SECRET_KEY" value={env.STRIPE_SECRET_KEY} />
      <Var envKey="STRIPE_WEBHOOK_SECRET" value={env.STRIPE_WEBHOOK_SECRET} />
      <Var
        envKey="NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"
        value={env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY}
      />
      <h2 className="mt-4 text-lg font-medium">Sync products</h2>
      <p>
        To sync new products, prices, customers, and subscriptions, we need to
        configure a webhook for Stripe to call. In production, Stripe will call
        the webhook deployed in Vercel. For local development, you can download
        the Stripe CLI and use a{" "}
        <Link href="https://stripe.com/docs/development/dashboard/local-listener">
          local listener
        </Link>
        .
      </p>
      <ol className="list-decimal pl-4">
        <li>
          Click the &quot;Add Endpoint&quot; button on the test{" "}
          <Link href="https://dashboard.stripe.com/test/webhooks">
            webhooks
          </Link>{" "}
          page in Stripe.
        </li>
        <li>
          Set the endpoint URL to
          <InlineCode>
            https://your-deployment-url.vercel.app/api/webhooks/stripe
          </InlineCode>
        </li>
        <li>
          Click "Select events" under the "Select events to listen to" heading.
        </li>
        <li>Click the "Select all events" button</li>
        <li>Click "Add endpoint" to finish creating the endpoint</li>
      </ol>
      <ContentBlock className="rounded border bg-white p-4">
        <p>
          As a one off run, once you've set up all the Stripe environment
          variables, you can click on this button to sync all your existing
          products and prices from Stripe to the database.
        </p>
        <Button
          className="my-2 mx-auto"
          disabled={!isValidValue(env.STRIPE_SECRET_KEY)}
          loading={syncStripeProductsMutation.isLoading}
          onClick={async () => {
            await syncStripeProductsMutation.mutateAsync();
            toast.success(
              "Products synced successfully! Go to Billing to see them."
            );
          }}
        >
          Sync Stripe Products and Prices to DB
        </Button>
      </ContentBlock>
      <h2 className="mt-4 text-lg font-medium">Gating feature access</h2>
      <p>
        Once your products are synced, you probably want to gate certain
        features behind certain products. We've provided a function{" "}
        <InlineCode>hasAccess</InlineCode> that can take in a team's product and
        a feature and return whether or not a team has access to that feature.
        To configure this, check out the{" "}
        <InlineCode>src/lib/hasAccess.ts</InlineCode> file. Add a feature to the{" "}
        <InlineCode>Feature</InlineCode> type and which product unlocks it in{" "}
        <InlineCode>FEATURE_UNLOCKS_BY_PRODUCT</InlineCode>.
      </p>
    </ContentBlock>
  );
}

function EmailContent({ env }: { env: Record<string, string | undefined> }) {
  return (
    <ContentBlock>
      <p>
        Scalerepo uses <Link href="https://react.email">react.email</Link> and
        nodemailer to write and send emails respectively. If you've already set
        up email based authentication, you can skip this step as they both rely
        on the same SMTP environment variables.
      </p>
      <p className="">
        To set up emails, you'll need some SMTP info from your mail provider
        (eg. Mailgun, Sendgrid, Postmark, etc.). You'll need an SMTP host, port,
        user and password. Add these values into the respective env vars in
        vercel.
      </p>
      <Var envKey="EMAIL_SMTP_HOST" value={env.EMAIL_SMTP_HOST} />
      <Var envKey="EMAIL_SMTP_PORT" value={env.EMAIL_SMTP_PORT} />
      <Var envKey="EMAIL_SMTP_USER" value={env.EMAIL_SMTP_USER} />
      <Var envKey="EMAIL_SMTP_PASSWORD" value={env.EMAIL_SMTP_PASSWORD} />
      <p>
        Follow the code in <InlineCode>/src/server/api/email.tsx</InlineCode> to
        see how emails are loaded and sent.
      </p>
      <p>
        To configure the email your app sends from, edit the constant in{" "}
        <InlineCode>src/lib/emailFrom.ts</InlineCode>
      </p>
    </ContentBlock>
  );
}

function AnalyticsContent({
  env,
}: {
  env: Record<string, string | undefined>;
}) {
  return (
    <ContentBlock>
      <p>
        Scalerepo uses Posthog to track analytics. Posthog has a very generous
        free tier and it's very easy to connect. Sign up for an account and put
        in their provided API key into the{" "}
        <InlineCode>NEXT_PUBLIC_POSTHOG_KEY</InlineCode>
      </p>
      <Var
        envKey="NEXT_PUBLIC_POSTHOG_KEY"
        value={env.NEXT_PUBLIC_POSTHOG_KEY}
      />
      <p>
        If you want to use a different analytics provider, it's straightforward
        to search for instances of <InlineCode>posthog?.capture</InlineCode> or{" "}
        <InlineCode>posthog()?.identify</InlineCode>
        and replace it with another call.
      </p>
    </ContentBlock>
  );
}

function WrapUpContent({ env }: { env: Record<string, string | undefined> }) {
  return (
    <ContentBlock>
      <p>
        You're all set with all the features Scalerepo comes out of the box.
      </p>
      <p>
        Here are some steps we recommend to make your app more robust for
        production.
      </p>
      <ol className="flex list-decimal flex-col space-y-2 pl-4">
        <li>
          Go through all the env vars in{" "}
          <InlineCode>/src/env/schema.mjs</InlineCode> and delete the ones you
          don't need. Also remove the <InlineCode>.optional()</InlineCode> call
          for all of them so that the build fails if they're not present.
        </li>
        <li>
          Remove all of the{" "}
          <InlineCode>
            .default(DEFAULT_VALUE_DO_NOT_USE_IN_PRODUCTION)
          </InlineCode>{" "}
          calls from <InlineCode>schema.mjs</InlineCode>
        </li>
        <li>
          Delete the code for any files or functionality you don't need. For
          example, if you won't have a docs page, you can delete the link to it
          from <InlineCode>UserProfileDropdown.tsx</InlineCode>
        </li>
      </ol>
    </ContentBlock>
  );
}

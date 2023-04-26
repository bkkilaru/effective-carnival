import type { FormEvent } from "react";
import { useCallback, useState } from "react";
import { Button } from "../design-system/Button";
import { Input } from "../design-system/Input";
import { api } from "../../utils/api";
import { useRouter } from "next/router";
import Logo from "../design-system/Logo";
import Testimonial from "./Testimonial";
import useUser from "@/lib/useUser";
import IconCircle from "./IconCircle";
import { Home, User } from "lucide-react";

type StepProps = {
  title: string;
  fieldType: "text";
  placeholder: string;
  onSubmit?: (value: string) => Promise<void>;
  loading: boolean;
  icon: React.ReactNode;
};

const Step = ({
  title,
  icon,
  fieldType,
  placeholder,
  onSubmit,
  loading,
}: StepProps) => {
  const [input, setInput] = useState("");
  const step = { title, fieldType, placeholder };
  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      await onSubmit?.(input);
      setInput("");
    },
    [onSubmit, input]
  );

  return (
    <div className="w-full max-w-lg">
      <IconCircle>{icon}</IconCircle>
      <h2 className="mt-4 mb-8 text-xl font-semibold lg:text-3xl">
        {step.title}
      </h2>
      <form
        className="flex max-w-[360px] flex-col items-start gap-y-6"
        onSubmit={handleSubmit}
      >
        {step.fieldType === "text" && (
          <Input
            key={title}
            autoFocus
            placeholder={step.placeholder}
            className="w-full"
            onChange={(e) => setInput(e.target.value)}
          />
        )}
        <Button className="w-full" loading={loading} disabled={!input}>
          Next
        </Button>
      </form>
    </div>
  );
};

export default function Onboarding() {
  const router = useRouter();
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const updateUserMutation = api.user.update.useMutation();
  const createTeamMutation = api.teams.create.useMutation();

  const utils = api.useContext();

  const NAME_STEP: Omit<StepProps, "loading"> = {
    title: "How should we greet you?",
    icon: <User className="h-6 w-6 text-gray-600" />,
    fieldType: "text",
    placeholder: "Jane Doe",
    onSubmit: async (value: string) => {
      const firstTeam = user?.teamRoles[0]?.team;
      setLoading(true);
      await updateUserMutation.mutateAsync({
        name: value,
        hasOnboarded: !!firstTeam,
      });

      if (!!firstTeam) {
        // if user already in a team, finish onboarding now
        await router.push(`/${firstTeam.slug}`);
        await utils.invalidate(undefined, {
          queryKey: api.user.get.getQueryKey(),
        });
      } else {
        setCurrentStepId("CREATE_TEAM_STEP");
        setLoading(false);
      }
    },
  };

  const CREATE_TEAM_STEP: Omit<StepProps, "loading"> = {
    title: "What do you want to name your workspace?",
    icon: <Home className="h-6 w-6 text-gray-600" />,
    fieldType: "text",
    placeholder: "ex: Personal or Acme Corp",
    onSubmit: async (value: string) => {
      if (!value) return;

      setLoading(true);
      const [team] = await Promise.all([
        createTeamMutation.mutateAsync({ name: value }),
        updateUserMutation.mutateAsync({ hasOnboarded: true }),
      ]);

      await router.push(`/${team.slug}`);
      await utils.invalidate(undefined, {
        queryKey: api.user.get.getQueryKey(),
      });
    },
  };

  const STEPS = {
    NAME_STEP,
    CREATE_TEAM_STEP,
  };

  const [currentStepId, setCurrentStepId] =
    useState<keyof typeof STEPS>("NAME_STEP");
  const currentStep = STEPS[currentStepId];

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-auto overflow-y-auto">
        <div className="flex flex-1 flex-col overflow-y-auto px-8 lg:px-16">
          <div className="mt-8">
            <Logo variant="wordmark" />
          </div>
          <div className="my-auto">
            <div className="mb-32">
              <Step {...currentStep} loading={loading} />
            </div>
          </div>
        </div>
        <div className="hidden flex-1 items-center justify-center border-l bg-gray-50 lg:flex">
          <div className="mx-8">
            <Testimonial />
          </div>
        </div>
      </div>
    </div>
  );
}

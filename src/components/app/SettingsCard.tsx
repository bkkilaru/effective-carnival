import type { ButtonVariant } from "@/components/design-system/Button";
import { Button } from "@/components/design-system/Button";

export default function SettingsCard({
  title,
  description,
  button,
  children,
}: {
  title: string;
  description: string;
  button: {
    name: string;
    variant?: ButtonVariant;
    onClick: () => void;
    loading: boolean;
  };
  children?: React.ReactNode;
}) {
  return (
    <form
      className="flex flex-col items-start justify-end gap-y-2 rounded-md border bg-white"
      onSubmit={(e) => {
        e.preventDefault();

        button.onClick();
      }}
    >
      <div className="p-4 md:px-6">
        <div className="mb-3 text-lg font-medium">{title}</div>
        <p className="mb-3">{description}</p>
        {children}
      </div>
      <div className="flex w-full justify-end rounded-b-md border-t bg-gray-50 px-6 py-3">
        <Button
          className="self-end"
          variant={button.variant}
          loading={button.loading}
        >
          {button.name}
        </Button>
      </div>
    </form>
  );
}

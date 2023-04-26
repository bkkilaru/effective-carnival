import Setup from "@/components/app/Setup";
import Logo from "@/components/design-system/Logo";
import Link from "next/link";

export default function SetupPage() {
  return (
    <div className="pb-12">
      <div className="mx-auto max-w-7xl">
        <Link href="/" className="flex items-center space-x-2 px-4 py-8">
          <Logo variant="wordmark" className="" />
          <h1 className="text-xl font-medium text-gray-500">Setup</h1>
        </Link>
        <Setup />
      </div>
    </div>
  );
}

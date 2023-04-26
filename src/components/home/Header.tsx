import cn from "@/lib/cn";
import { DISCORD_LINK, DOCS_LINK } from "@/lib/links";
import { Menu } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import { Button } from "../design-system/Button";
import Logo from "../design-system/Logo";
import { CTAButton } from "./CTAButton";

type HeaderProps = {
  className?: string;
  logoHref: string;
};

export default function Header({ className }: { className?: string }) {
  const { pathname } = useRouter();
  const isInBlog = pathname.startsWith("/blog");
  let logoHref = "/";
  if (isInBlog && pathname !== "/blog") {
    logoHref = "/blog";
  }

  return (
    <>
      <Mobile className={className} logoHref={logoHref} />
      <Desktop className={className} logoHref={logoHref} />
    </>
  );
}

export function BlogHeader() {
  return (
    <Header className="fixed top-0 w-full border-b border-gray-200 bg-white" />
  );
}

function Mobile({ className, logoHref }: HeaderProps) {
  const [open, setOpen] = useState(false);

  return (
    <nav className={cn("md:hidden", className)}>
      <div className="mx-auto flex max-w-7xl items-center justify-between p-4 text-base">
        <Link href={logoHref}>
          <Logo variant="wordmark" />
        </Link>
        <Button variant="ghost" onClick={() => setOpen((x) => !x)}>
          <Menu className="h-6 w-6" />
        </Button>
      </div>
      {open && (
        <div className="absolute z-10 flex w-full flex-col space-y-4 bg-white p-4 shadow-lg">
          <BlogLink />
          <DiscordLink />
          <DocsLink />
          <CTAButton size="small" />
        </div>
      )}
    </nav>
  );
}

function Desktop({ className, logoHref }: HeaderProps) {
  return (
    <nav className={cn("hidden md:block", className)}>
      <div className="mx-auto flex max-w-7xl items-center justify-between p-4 text-base">
        <Link href={logoHref}>
          <Logo variant="wordmark" />
        </Link>
        <div className="flex items-center space-x-8">
          <BlogLink />
          <DiscordLink />
          <DocsLink />
          <CTAButton size="small" />
        </div>
      </div>
    </nav>
  );
}

function BlogLink() {
  return (
    <Link href={"/blog"}>
      <Button variant="link" className="text-base font-normal">
        Blog
      </Button>
    </Link>
  );
}

function DiscordLink() {
  return (
    <Link href={DISCORD_LINK} target="_blank" rel="noopener noreferrer">
      <Button variant="link" className="text-base font-normal">
        Discord
      </Button>
    </Link>
  );
}

function DocsLink() {
  return (
    <Link href={DOCS_LINK} target="_blank" rel="noopener noreferrer">
      <Button variant="link" className="text-base font-normal">
        Docs
      </Button>
    </Link>
  );
}

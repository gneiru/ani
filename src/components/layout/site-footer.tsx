import Link from "next/link";

import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import { ThemeToggle } from "@/components/layout/theme-toggle";

export function SiteFooter() {
  return (
    <footer className="w-full border-t bg-background">
      <div className="container flex flex-row justify-between py-4">
        <div className="break-normal text-base text-muted-foreground">
          Made by{" "}
          <Link
            href={siteConfig.links.site + "?ref=anirohi"}
            target="_blank"
            className="underline text-primary underline-offset-[5px]"
          >
            Rohi
          </Link>
          . Powered by{" "}
          <Link
            href="https://anilist.co/graphiql"
            target="_blank"
            rel="noreferrer"
            className="underline text-primary underline-offset-[5px]"
          >
            Anilist
          </Link>{" "}
          and{" "}
          <Link
            href="https://docs.consumet.org"
            target="_blank"
            rel="noreferrer"
            className="underline text-primary underline-offset-[5px]"
          >
            Consumet
          </Link>
        </div>
        <div className="flex space-x-1">
          <Link
            href={siteConfig.links.github}
            target="_blank"
            rel="noreferrer"
            className={buttonVariants({ size: "icon", variant: "ghost" })}
          >
            <Icons.gitHub className="size-4" aria-hidden="true" />
            <span className="sr-only">GitHub</span>
          </Link>
          <ThemeToggle />
        </div>
      </div>
    </footer>
  );
}

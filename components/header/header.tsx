"use client";

import { FC } from "react";
import { StorybookLogo } from "../logos/storybook";
import * as NavigationMenu from "@radix-ui/react-navigation-menu";
import { cn } from "../../lib/tailwind";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Search } from "./search";
import { MobileMenu } from "./mobile-menu";
import { Submenu } from "./submenu";

export const Header: FC<HeaderProps> = ({
  variant = "home",
  tree,
  activeVersion,
}) => {
  const pathname = usePathname();

  return (
    <header
      className={cn(
        "w-full relative z-50",
        variant === "home" && "lg:border-b lg:border-white/10",
        variant === "system" &&
          "sticky top-0 z-40 backdrop-blur bg-white/80 dark:bg-zinc-900/80 lg:border-b lg:border-zinc-200 dark:border-zinc-700"
      )}
    >
      <div className="max-w-8xl mx-auto">
        <div
          className={cn(
            "h-18 py-4 px-4 sm:px-8 md:px-8 lg:border-0 flex items-center justify-between",
            variant === "home" && "border-b border-zinc-700",
            variant === "system" &&
              "border-b border-zinc-200 dark:border-zinc-700"
          )}
        >
          <div className="flex gap-6 items-center">
            <Link href="/" className="pl-2 md:pl-0">
              <StorybookLogo color={variant === "home" ? "white" : "system"} />
            </Link>
            <NavigationMenu.Root className="max-[920px]:hidden">
              <NavigationMenu.List className="flex gap-2">
                <Button
                  active={pathname === "/docs"}
                  variant={variant}
                  href="/docs"
                >
                  Docs
                </Button>
                <Button variant={variant} href="#">
                  Showcase
                </Button>
                <Button variant={variant} href="#">
                  Blog
                </Button>
                <Button
                  variant={variant}
                  href="https://www.chromatic.com/?utm_source=storybook_website&utm_medium=link&utm_campaign=storybook"
                  external
                >
                  Visual Test
                </Button>
                <Button
                  variant={variant}
                  href="https://www.chromatic.com/sales?utm_source=storybook_website&utm_medium=link&utm_campaign=storybook"
                  external
                >
                  Enterprise
                </Button>
              </NavigationMenu.List>
            </NavigationMenu.Root>
          </div>
          <Search variant={variant} />
          <MobileMenu variant={variant} />
        </div>
        {pathname.startsWith("/docs") && (
          <Submenu
            variant={variant}
            tree={tree}
            activeVersion={activeVersion}
          />
        )}
      </div>
    </header>
  );
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant: "home" | "system";
  active?: boolean;
  external?: boolean;
  href: string;
  children: string;
}

const Button: FC<ButtonProps> = ({
  variant,
  external = false,
  active = false,
  href,
  children,
}) => {
  const Comp = external ? "a" : Link;

  return (
    <NavigationMenu.Item>
      <NavigationMenu.Link asChild>
        <Comp
          className={cn(
            "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:ring-offset-slate-950 dark:focus-visible:ring-slate-300 duration-300 h-8 px-2",
            variant === "home" &&
              "group flex items-center justify-center gap-2 text-sm text-white font-bold hover:bg-white/10 hover:text-white",
            variant === "system" &&
              "group flex items-center justify-center gap-2 text-sm text-zinc-500 font-bold hover:bg-blue-100 hover:text-blue-500  dark:text-white dark:hover:bg-blue-500/10",
            active &&
              "bg-blue-100 text-blue-500 dark:bg-blue-500/10 dark:text-blue-500"
          )}
          href={href}
          target={external ? "_blank" : undefined}
        >
          {children}
          {external && (
            <div className="h-full flex items-start py-1.5">
              <svg
                width="8"
                height="8"
                viewBox="0 0 8 8"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M2.63695 1.23752C2.63695 1.07155 2.77149 0.937012 2.93746 0.937012L6.76232 0.937012C6.92829 0.937012 7.06283 1.07155 7.06283 1.23752V5.06239C7.06283 5.22835 6.92829 5.36289 6.76232 5.3629C6.59636 5.36289 6.46181 5.22835 6.46181 5.06239L6.46181 1.96302L1.45001 6.97482C1.33266 7.09217 1.14239 7.09217 1.02503 6.97482C0.907673 6.85746 0.907673 6.66719 1.02503 6.54983L6.03683 1.53803L2.93746 1.53803C2.77149 1.53803 2.63695 1.40349 2.63695 1.23752Z"
                  fill="currentColor"
                />
              </svg>
            </div>
          )}
        </Comp>
      </NavigationMenu.Link>
    </NavigationMenu.Item>
  );
};

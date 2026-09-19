"use client";

import { useEffect, useState } from "react";
import {
  LogoutIcon,
  UserCircleIcon,
} from "@/components/common/header/icons";
import { Avatar, AvatarFallback } from "@/components/tailgrids/core/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuHeader,
  DropdownMenuItem,
  DropdownMenuSection,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/tailgrids/core/dropdown";
import { AltArrowDownIcon } from "@/utils/icon";
import { getCurrentUserAction, logoutAction } from "@/server/actions/auth";
import type { SessionUser } from "@/lib/auth";
import Link from "next/link";

interface UserProfileMenuItem {
  href: string;
  icon: React.ReactNode;
  label: string;
}

export function UserProfileButton() {
  const [currentUser, setCurrentUser] = useState<SessionUser | null>(null);

  useEffect(() => {
    getCurrentUserAction().then((u) => {
      if (u) setCurrentUser(u);
    });
  }, []);

  const name = currentUser?.name || "Budi Santoso";
  const roleText = currentUser?.role ? `Role: ${currentUser.role}` : "Role: ADMIN";
  const usernameText = currentUser?.username ? `@${currentUser.username} (${roleText})` : roleText;

  const menuItems: UserProfileMenuItem[] = [
    {
      href: "/users",
      icon: <UserCircleIcon />,
      label: "User Account",
    },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="group flex items-center gap-2.5 rounded-lg border-0 p-0 transition-all outline-none focus-visible:ring-4 focus-visible:ring-input-primary-focus-border/20 focus-visible:ring-offset-1">
        <Avatar>
          <AvatarFallback className="rounded-lg border border-border-secondary-alt bg-background-gray-secondary_alt font-bold text-emerald-600">
            {name.charAt(0)}
          </AvatarFallback>
        </Avatar>

        <span className="text-sm leading-5 font-medium text-text-primary">{name}</span>

        <AltArrowDownIcon className="text-icon-tertiary transition-transform duration-200 group-aria-expanded:-rotate-180" />
      </DropdownMenuTrigger>

      <DropdownMenuContent placement="bottom end" className="w-70 overflow-hidden p-0 shadow-3xl">
        <DropdownMenuHeader className="flex w-full items-center justify-start gap-2 border-b border-border-secondary-alt px-4 py-3">
          <Avatar size="md">
            <AvatarFallback className="border border-border-secondary-alt bg-background-gray-secondary_alt font-bold text-emerald-600">
              {name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <span className="flex flex-col">
            <span className="text-sm font-medium text-text-primary">{name}</span>
            <span className="truncate text-xs text-gray-500">{usernameText}</span>
          </span>
        </DropdownMenuHeader>

        <DropdownMenuSection className="p-1.5">
          {menuItems.map((item) => (
            <DropdownMenuItem
              key={item.label}
              href={item.href}
              className="cursor-pointer px-3 py-2.5"
              render={(domProps) =>
                "href" in domProps ? <Link {...domProps} /> : <div {...domProps} />
              }
            >
              <span className="shrink-0 text-icon-secondary group-hover:text-text-primary">
                {item.icon}
              </span>
              <span className="leading-5 font-medium">{item.label}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuSection>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onAction={async () => {
            await logoutAction();
          }}
          className="m-1.5 w-auto cursor-pointer px-3 py-2.5 text-red-600 hover:text-red-700"
        >
          <span className="text-icon-secondary group-hover:text-red-600">
            <LogoutIcon />
          </span>
          <span className="leading-5 font-medium">Keluar / Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}


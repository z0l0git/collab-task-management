"use client";

import { ChevronsUpDown, LogOut, SunMoon } from "lucide-react";

import { toggleTheme } from "@/components/theme/toggleTheme";
import {
  Avatar,
  Menu,
  MenuDivider,
  MenuItem,
  MenuLabel,
} from "@/components/ui";
import { useAuth } from "@/features/auth/AuthProvider";
import { signOut } from "@/services/authService";

export const UserMenu = () => {
  const { user } = useAuth();
  if (!user) return null;

  const name = user.displayName || user.email || "Account";

  return (
    <Menu
      label={`Account: ${name}`}
      side="top"
      triggerClassName="hover:bg-surface-2 flex h-9 w-full items-center gap-2 rounded-md px-2 text-left transition-colors"
      trigger={
        <>
          <Avatar name={name} photoURL={user.photoURL} size={20} />
          <span className="text-eyebrow text-ink min-w-0 flex-1 truncate font-medium">
            {name}
          </span>
          <ChevronsUpDown
            className="text-ink-subtle size-3.5 shrink-0"
            aria-hidden="true"
          />
        </>
      }
    >
      {user.email ? <MenuLabel>{user.email}</MenuLabel> : null}
      {user.email ? <MenuDivider /> : null}
      <MenuItem icon={SunMoon} onSelect={toggleTheme}>
        Toggle theme
      </MenuItem>
      <MenuItem icon={LogOut} onSelect={() => void signOut()}>
        Sign out
      </MenuItem>
    </Menu>
  );
};

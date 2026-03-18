"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  IdCard,
  HeartPulse,
  FolderLock,
  GraduationCap,
  Palette,
  TrendingUp,
  Calculator,
  Wallet,
  Baby,
  ClipboardList,
  Settings,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SIDEBAR_NAVIGATION } from "@/lib/constants";

export const ICON_MAP: Record<string, LucideIcon> = {
  LayoutDashboard,
  IdCard,
  HeartPulse,
  FolderLock,
  GraduationCap,
  Palette,
  TrendingUp,
  Calculator,
  Wallet,
  Baby,
  ClipboardList,
  Settings,
};

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 bg-sidebar">
      <div className="flex h-16 items-center px-6 border-b border-white/10">
        <Link href="/dashboard" className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-warm-orange text-white font-bold text-sm">
            MP
          </div>
          <span className="text-lg font-serif text-white">
            Ma Vie Parentale
          </span>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {SIDEBAR_NAVIGATION.map((group) => (
          <div key={group.group}>
            <p className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-sidebar-muted">
              {group.group}
            </p>
            <ul className="space-y-1">
              {group.items.map((item) => {
                const Icon = ICON_MAP[item.icon] || LayoutDashboard;
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/dashboard" &&
                    pathname.startsWith(item.href));

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                        isActive
                          ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                          : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-white"
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-white/10 p-3">
        <Link
          href="/parametres"
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
            pathname === "/parametres"
              ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
              : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-white"
          )}
        >
          <Settings className="h-4 w-4" />
          Paramètres
        </Link>
      </div>
    </aside>
  );
}

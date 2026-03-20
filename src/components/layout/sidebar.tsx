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
  Stethoscope,
  Settings,
  UsersRound,
  Split,
  Gift,
  BarChart3,
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
  Stethoscope,
  Settings,
  UsersRound,
  Split,
  Gift,
  BarChart3,
};

interface SidebarProps {
  badges?: Record<string, number>;
}

export function Sidebar({ badges = {} }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 bg-sidebar" role="navigation" aria-label="Navigation principale">
      <div className="flex h-16 items-center px-6 border-b border-white/10">
        <Link href="/dashboard" className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-warm-orange text-white font-bold text-sm">
            D
          </div>
          <span className="text-lg font-serif text-white">
            Darons
          </span>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6" aria-label="Modules">
        {SIDEBAR_NAVIGATION.map((group) => (
          <div key={group.group}>
            <p className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-sidebar-muted" id={`nav-group-${group.group.replace(/\s+/g, "-").toLowerCase()}`}>
              {group.group}
            </p>
            <ul className="space-y-1" role="list" aria-labelledby={`nav-group-${group.group.replace(/\s+/g, "-").toLowerCase()}`}>
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
                      aria-current={isActive ? "page" : undefined}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                        isActive
                          ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                          : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-white"
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                      <span className="flex-1">{item.label}</span>
                      {badges[item.href] != null && badges[item.href] > 0 && (
                        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-warm-orange text-[10px] font-medium text-white px-1">
                          {badges[item.href] > 99 ? "99+" : badges[item.href]}
                        </span>
                      )}
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
          aria-current={pathname === "/parametres" ? "page" : undefined}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
            pathname === "/parametres"
              ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
              : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-white"
          )}
        >
          <Settings className="h-4 w-4" aria-hidden="true" />
          Paramètres
        </Link>
      </div>
    </aside>
  );
}

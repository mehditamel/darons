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
  ChevronDown,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { useState } from "react";
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
  userInitials?: string;
  userEmail?: string;
}

export function Sidebar({ badges = {}, userInitials = "?", userEmail = "" }: SidebarProps) {
  const pathname = usePathname();
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

  function toggleGroup(group: string) {
    setCollapsedGroups((prev) => ({ ...prev, [group]: !prev[group] }));
  }

  const totalBadges = Object.values(badges).reduce((sum, count) => sum + count, 0);

  return (
    <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 bg-sidebar" role="navigation" aria-label="Navigation principale">
      {/* Logo */}
      <div className="flex h-16 items-center px-6 border-b border-white/10">
        <Link href="/dashboard" className="flex items-center space-x-3 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-warm-orange to-warm-orange/80 text-white font-bold text-sm shadow-lg shadow-warm-orange/20 transition-transform group-hover:scale-105">
            D
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-serif text-white leading-tight">
              Darons
            </span>
            <span className="text-[10px] text-sidebar-muted leading-tight">
              La vie de famille, simplifiée
            </span>
          </div>
        </Link>
      </div>

      {/* AI assistant teaser */}
      <div className="mx-3 mt-4 mb-2 rounded-xl bg-gradient-to-r from-warm-purple/20 to-warm-blue/20 p-3 border border-white/5">
        <div className="flex items-center gap-2 text-sidebar-foreground">
          <Sparkles className="h-4 w-4 text-warm-purple shrink-0" />
          <span className="text-xs font-medium">IA active</span>
          {totalBadges > 0 && (
            <span className="ml-auto text-[10px] text-warm-orange font-semibold">
              {totalBadges} alerte{totalBadges > 1 ? "s" : ""}
            </span>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-1 custom-scrollbar" aria-label="Modules">
        {SIDEBAR_NAVIGATION.map((group) => {
          const isCollapsed = collapsedGroups[group.group] ?? false;
          const groupBadgeCount = group.items.reduce(
            (sum, item) => sum + (badges[item.href] ?? 0),
            0
          );

          return (
            <div key={group.group}>
              <button
                onClick={() => toggleGroup(group.group)}
                className="flex w-full items-center justify-between px-3 py-2 text-xs font-semibold uppercase tracking-wider text-sidebar-muted hover:text-sidebar-foreground transition-colors"
                aria-expanded={!isCollapsed}
                id={`nav-group-${group.group.replace(/\s+/g, "-").toLowerCase()}`}
              >
                <span>{group.group}</span>
                <div className="flex items-center gap-1.5">
                  {groupBadgeCount > 0 && isCollapsed && (
                    <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-warm-orange text-[9px] font-medium text-white px-1">
                      {groupBadgeCount}
                    </span>
                  )}
                  <ChevronDown
                    className={cn(
                      "h-3 w-3 transition-transform duration-200",
                      isCollapsed && "-rotate-90"
                    )}
                  />
                </div>
              </button>
              {!isCollapsed && (
                <ul className="space-y-0.5 mb-3" role="list" aria-labelledby={`nav-group-${group.group.replace(/\s+/g, "-").toLowerCase()}`}>
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
                            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all duration-200",
                            isActive
                              ? "bg-gradient-to-r from-warm-orange/20 to-warm-orange/10 text-white font-medium border-l-2 border-warm-orange"
                              : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-white hover:translate-x-0.5"
                          )}
                        >
                          <Icon className={cn("h-4 w-4 shrink-0 transition-colors", isActive && "text-warm-orange")} aria-hidden="true" />
                          <span className="flex-1">{item.label}</span>
                          {badges[item.href] != null && badges[item.href] > 0 && (
                            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-warm-orange text-[10px] font-medium text-white px-1 animate-pulse-glow">
                              {badges[item.href] > 99 ? "99+" : badges[item.href]}
                            </span>
                          )}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          );
        })}
      </nav>

      {/* Bottom section: settings + user */}
      <div className="border-t border-white/10 p-3 space-y-2">
        <Link
          href="/parametres"
          aria-current={pathname === "/parametres" ? "page" : undefined}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all duration-200",
            pathname === "/parametres"
              ? "bg-gradient-to-r from-warm-orange/20 to-warm-orange/10 text-white font-medium"
              : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-white"
          )}
        >
          <Settings className="h-4 w-4" aria-hidden="true" />
          Paramètres
        </Link>

        {/* User avatar */}
        <div className="flex items-center gap-3 rounded-lg px-3 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-warm-teal/20 text-warm-teal text-xs font-semibold">
            {userInitials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-sidebar-foreground font-medium truncate">
              {userEmail || "Mon compte"}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}

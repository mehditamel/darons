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
  Bell,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { SIDEBAR_NAVIGATION } from "@/lib/constants";
import { MiniProgressRing } from "@/components/shared/progress-ring";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
  Bell,
};

interface SidebarProps {
  badges?: Record<string, number>;
  userInitials?: string;
  userEmail?: string;
  moduleProgress?: Record<string, number>;
}

export function Sidebar({
  badges = {},
  userInitials = "?",
  userEmail = "",
  moduleProgress = {},
}: SidebarProps) {
  const pathname = usePathname();
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});
  const [isCompact, setIsCompact] = useState(false);

  function toggleGroup(group: string) {
    setCollapsedGroups((prev) => ({ ...prev, [group]: !prev[group] }));
  }

  const totalBadges = Object.values(badges).reduce((sum, count) => sum + count, 0);

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 bg-sidebar transition-all duration-300",
          isCompact ? "lg:w-16" : "lg:w-64"
        )}
        role="navigation"
        aria-label="Navigation principale"
      >
        {/* Logo */}
        <div className="flex h-16 items-center px-4 border-b border-white/10">
          <Link href="/dashboard" className="flex items-center space-x-3 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-warm-orange to-warm-orange/80 text-white font-bold text-sm shadow-lg shadow-warm-orange/20 transition-transform group-hover:scale-105 shrink-0">
              D
            </div>
            {!isCompact && (
              <div className="flex flex-col">
                <span className="text-lg font-serif text-white leading-tight">
                  Darons
                </span>
                <span className="text-[10px] text-sidebar-muted leading-tight">
                  La vie de famille, simplifiée
                </span>
              </div>
            )}
          </Link>
        </div>

        {/* AI assistant teaser */}
        {!isCompact && (
          <div className="mx-3 mt-4 mb-2 rounded-xl bg-gradient-to-r from-warm-purple/20 to-warm-blue/20 p-3 border border-white/5">
            <div className="flex items-center gap-2 text-sidebar-foreground">
              <Sparkles className="h-4 w-4 text-warm-purple shrink-0 animate-pulse" />
              <span className="text-xs font-medium">IA active</span>
              {totalBadges > 0 && (
                <span className="ml-auto text-[10px] text-warm-orange font-semibold">
                  {totalBadges} alerte{totalBadges > 1 ? "s" : ""}
                </span>
              )}
            </div>
          </div>
        )}

        {isCompact && (
          <div className="flex justify-center mt-4 mb-2">
            <Sparkles className="h-4 w-4 text-warm-purple animate-pulse" />
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-1 custom-scrollbar" aria-label="Modules">
          {SIDEBAR_NAVIGATION.map((group) => {
            const isCollapsed = collapsedGroups[group.group] ?? false;
            const groupBadgeCount = group.items.reduce(
              (sum, item) => sum + (badges[item.href] ?? 0),
              0
            );

            return (
              <div key={group.group}>
                {!isCompact && (
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
                )}
                {(isCompact || !isCollapsed) && (
                  <ul
                    className={cn("space-y-0.5", !isCompact && "mb-3")}
                    role="list"
                    aria-labelledby={isCompact ? undefined : `nav-group-${group.group.replace(/\s+/g, "-").toLowerCase()}`}
                  >
                    {group.items.map((item) => {
                      const Icon = ICON_MAP[item.icon] || LayoutDashboard;
                      const isActive =
                        pathname === item.href ||
                        (item.href !== "/dashboard" &&
                          pathname.startsWith(item.href));
                      const badgeCount = badges[item.href] ?? 0;
                      const progress = moduleProgress[item.href];

                      const linkContent = (
                        <Link
                          href={item.href}
                          aria-current={isActive ? "page" : undefined}
                          className={cn(
                            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all duration-200",
                            isCompact && "justify-center px-2",
                            isActive
                              ? "bg-gradient-to-r from-warm-orange/20 to-warm-orange/10 text-white font-medium border-l-2 border-warm-orange"
                              : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-white hover:translate-x-0.5"
                          )}
                        >
                          <div className="relative shrink-0">
                            <Icon className={cn("h-4 w-4 transition-colors", isActive && "text-warm-orange")} aria-hidden="true" />
                            {/* Mini progress ring behind icon */}
                            {progress !== undefined && progress < 100 && !isCompact && (
                              <div className="absolute -top-1 -right-1.5">
                                <MiniProgressRing
                                  value={progress}
                                  size={12}
                                  color={isActive ? "text-warm-orange" : "text-warm-teal"}
                                />
                              </div>
                            )}
                          </div>
                          {!isCompact && (
                            <>
                              <span className="flex-1">{item.label}</span>
                              {progress !== undefined && progress < 100 && (
                                <span className="text-[9px] text-sidebar-muted tabular-nums">
                                  {progress}%
                                </span>
                              )}
                              {badgeCount > 0 && (
                                <span
                                  className={cn(
                                    "flex h-5 min-w-5 items-center justify-center rounded-full bg-warm-orange text-[10px] font-medium text-white px-1",
                                    badgeCount > 5 ? "animate-bounce-gentle" : "animate-pulse-glow"
                                  )}
                                >
                                  {badgeCount > 99 ? "99+" : badgeCount}
                                </span>
                              )}
                            </>
                          )}
                          {isCompact && badgeCount > 0 && (
                            <span className="absolute -top-1 -right-1 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-warm-orange text-[8px] font-medium text-white px-0.5">
                              {badgeCount > 9 ? "9+" : badgeCount}
                            </span>
                          )}
                        </Link>
                      );

                      return (
                        <li key={item.href} className="relative">
                          {isCompact ? (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                {linkContent}
                              </TooltipTrigger>
                              <TooltipContent side="right" className="text-xs">
                                {item.label}
                                {badgeCount > 0 && (
                                  <span className="ml-1.5 text-warm-orange">({badgeCount})</span>
                                )}
                              </TooltipContent>
                            </Tooltip>
                          ) : (
                            linkContent
                          )}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            );
          })}
        </nav>

        {/* Bottom section: compact toggle + settings + user */}
        <div className="border-t border-white/10 p-2 space-y-1">
          {/* Compact mode toggle */}
          <button
            onClick={() => setIsCompact(!isCompact)}
            className="flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-accent/50 transition-all"
            aria-label={isCompact ? "Agrandir la sidebar" : "Réduire la sidebar"}
          >
            {isCompact ? (
              <ChevronRight className="h-3.5 w-3.5" />
            ) : (
              <>
                <ChevronLeft className="h-3.5 w-3.5" />
                <span>Réduire</span>
              </>
            )}
          </button>

          {/* Settings */}
          {isCompact ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href="/parametres"
                  aria-current={pathname === "/parametres" ? "page" : undefined}
                  className={cn(
                    "flex items-center justify-center rounded-lg px-2 py-2 text-sm transition-all duration-200",
                    pathname === "/parametres"
                      ? "bg-gradient-to-r from-warm-orange/20 to-warm-orange/10 text-white font-medium"
                      : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-white"
                  )}
                >
                  <Settings className="h-4 w-4" aria-hidden="true" />
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-xs">Paramètres</TooltipContent>
            </Tooltip>
          ) : (
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
          )}

          {/* User avatar */}
          <div className={cn("flex items-center gap-3 rounded-lg px-3 py-2", isCompact && "justify-center px-2")}>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-warm-teal/20 text-warm-teal text-xs font-semibold shrink-0">
              {userInitials}
            </div>
            {!isCompact && (
              <div className="flex-1 min-w-0">
                <p className="text-xs text-sidebar-foreground font-medium truncate">
                  {userEmail || "Mon compte"}
                </p>
              </div>
            )}
          </div>
        </div>
      </aside>
    </TooltipProvider>
  );
}

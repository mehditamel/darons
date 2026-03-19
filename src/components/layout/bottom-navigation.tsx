"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  HeartPulse,
  Wallet,
  Users,
  MoreHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";

const BOTTOM_TABS = [
  { label: "Accueil", href: "/dashboard", icon: LayoutDashboard },
  { label: "Santé", href: "/sante", icon: HeartPulse },
  { label: "Budget", href: "/budget", icon: Wallet },
  { label: "Famille", href: "/identite", icon: Users },
  { label: "Plus", href: "/parametres", icon: MoreHorizontal },
] as const;

export function BottomNavigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background lg:hidden">
      <div className="flex items-center justify-around">
        {BOTTOM_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive =
            pathname === tab.href ||
            (tab.href !== "/dashboard" && pathname.startsWith(tab.href));

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 py-2 text-xs transition-colors",
                isActive
                  ? "text-warm-orange"
                  : "text-muted-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </div>
      {/* Safe area for iOS */}
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  );
}

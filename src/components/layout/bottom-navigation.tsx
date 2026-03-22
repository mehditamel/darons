"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  HeartPulse,
  Wallet,
  Users,
  Menu,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { MobileNav } from "./mobile-nav";

const BOTTOM_TABS = [
  { label: "Accueil", href: "/dashboard", icon: LayoutDashboard },
  { label: "Santé", href: "/sante", icon: HeartPulse },
  { label: "Budget", href: "/budget", icon: Wallet },
  { label: "Famille", href: "/identite", icon: Users },
] as const;

export function BottomNavigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur-md lg:hidden" role="navigation" aria-label="Navigation mobile">
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
                "relative flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium transition-colors",
                isActive
                  ? "text-warm-orange"
                  : "text-muted-foreground"
              )}
            >
              {isActive && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 h-0.5 w-8 rounded-full bg-warm-orange" />
              )}
              <Icon className={cn("h-5 w-5 transition-transform", isActive && "scale-110")} />
              <span>{tab.label}</span>
            </Link>
          );
        })}

        {/* More button with sheet menu */}
        <Sheet>
          <SheetTrigger asChild>
            <button
              className="relative flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium text-muted-foreground transition-colors"
              aria-label="Plus de modules"
            >
              <Menu className="h-5 w-5" />
              <span>Plus</span>
            </button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[70vh] rounded-t-2xl bg-sidebar p-0">
            <SheetHeader className="sr-only">
              <SheetTitle>Navigation</SheetTitle>
            </SheetHeader>
            <div className="mx-auto mt-2 mb-4 h-1 w-12 rounded-full bg-white/20" />
            <MobileNav />
          </SheetContent>
        </Sheet>
      </div>
      {/* Safe area for iOS */}
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  );
}

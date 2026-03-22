"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { SheetClose } from "@/components/ui/sheet";
import { SIDEBAR_NAVIGATION } from "@/lib/constants";
import { ICON_MAP } from "@/components/layout/sidebar";

export function MobileNav() {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-14 items-center px-6 border-b border-white/10">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-warm-orange to-warm-orange/80 text-white font-bold text-sm shadow-lg shadow-warm-orange/20">
          D
        </div>
        <div className="ml-3 flex flex-col">
          <span className="text-base font-serif text-white leading-tight">
            Darons
          </span>
          <span className="text-[10px] text-sidebar-muted leading-tight">
            Navigation
          </span>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5 custom-scrollbar">
        {SIDEBAR_NAVIGATION.map((group) => (
          <div key={group.group}>
            <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest text-sidebar-muted">
              {group.group}
            </p>
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = ICON_MAP[item.icon] || LayoutDashboard;
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/dashboard" && pathname.startsWith(item.href));

                return (
                  <li key={item.href}>
                    <SheetClose asChild>
                      <Link
                        href={item.href}
                        className={cn(
                          "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all duration-200",
                          isActive
                            ? "bg-gradient-to-r from-warm-orange/20 to-warm-orange/10 text-white font-medium"
                            : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-white active:scale-[0.98]"
                        )}
                      >
                        <Icon className={cn("h-4 w-4", isActive && "text-warm-orange")} />
                        {item.label}
                      </Link>
                    </SheetClose>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-white/10 p-3">
        <SheetClose asChild>
          <Link
            href="/parametres"
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all duration-200",
              pathname === "/parametres"
                ? "bg-gradient-to-r from-warm-orange/20 to-warm-orange/10 text-white font-medium"
                : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-white"
            )}
          >
            <Settings className="h-4 w-4" />
            Paramètres
          </Link>
        </SheetClose>
      </div>
    </div>
  );
}

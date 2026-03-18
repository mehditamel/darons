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
import { SheetClose } from "@/components/ui/sheet";

const ICON_MAP: Record<string, LucideIcon> = {
  LayoutDashboard, IdCard, HeartPulse, FolderLock, GraduationCap,
  Palette, TrendingUp, Calculator, Wallet, Baby, ClipboardList, Settings,
};

const NAVIGATION = [
  {
    group: "Vue d'ensemble",
    items: [{ label: "Tableau de bord", href: "/dashboard", icon: "LayoutDashboard" }],
  },
  {
    group: "Administratif",
    items: [
      { label: "Identit\u00e9", href: "/identite", icon: "IdCard" },
      { label: "Sant\u00e9", href: "/sante", icon: "HeartPulse" },
      { label: "Coffre-fort", href: "/documents", icon: "FolderLock" },
    ],
  },
  {
    group: "\u00c9ducatif",
    items: [
      { label: "Scolarit\u00e9", href: "/scolarite", icon: "GraduationCap" },
      { label: "Activit\u00e9s", href: "/activites", icon: "Palette" },
      { label: "D\u00e9veloppement", href: "/developpement", icon: "TrendingUp" },
    ],
  },
  {
    group: "Finances",
    items: [
      { label: "Fiscal", href: "/fiscal", icon: "Calculator" },
      { label: "Budget", href: "/budget", icon: "Wallet" },
    ],
  },
  {
    group: "Services",
    items: [
      { label: "Garde", href: "/garde", icon: "Baby" },
      { label: "D\u00e9marches", href: "/demarches", icon: "ClipboardList" },
    ],
  },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center px-6 border-b border-white/10">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-warm-orange text-white font-bold text-sm">
          MP
        </div>
        <span className="ml-2 text-lg font-serif text-white">
          Ma Vie Parentale
        </span>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {NAVIGATION.map((group) => (
          <div key={group.group}>
            <p className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-sidebar-muted">
              {group.group}
            </p>
            <ul className="space-y-1">
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
                          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                          isActive
                            ? "bg-sidebar-accent text-white font-medium"
                            : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                        )}
                      >
                        <Icon className="h-4 w-4" />
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
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-sidebar-foreground hover:bg-sidebar-accent/50"
          >
            <Settings className="h-4 w-4" />
            Param\u00e8tres
          </Link>
        </SheetClose>
      </div>
    </div>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { Bell, LogOut, Settings, User, Search, Sparkles } from "lucide-react";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { createClient } from "@/lib/supabase/client";

interface TopbarProps {
  userEmail?: string;
  userInitials?: string;
  alertCount?: number;
}

export function Topbar({ userEmail, userInitials, alertCount = 0 }: TopbarProps) {
  const router = useRouter();
  const initials = userInitials || "?";
  const email = userEmail || "";

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-background/80 backdrop-blur-md px-4 lg:px-6" role="banner">
      {/* Spacer for mobile (hamburger removed - using bottom nav "Plus") */}
      <div className="lg:hidden w-1" />

      {/* Page context area - flexible space */}
      <div className="flex-1" />

      {/* Search trigger */}
      <Button
        variant="ghost"
        size="sm"
        className="hidden sm:inline-flex relative h-8 w-auto px-3 text-xs text-muted-foreground gap-2 rounded-full bg-muted/50 hover:bg-muted"
        onClick={() => {
          document.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true }));
        }}
      >
        <Search className="h-3.5 w-3.5" />
        <span>Rechercher...</span>
        <kbd className="pointer-events-none hidden h-5 select-none items-center gap-0.5 rounded border bg-background px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">&#x2318;</span>K
        </kbd>
      </Button>

      {/* Mobile search */}
      <Button
        variant="ghost"
        size="icon"
        className="sm:hidden h-8 w-8"
        onClick={() => {
          document.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true }));
        }}
        aria-label="Rechercher"
      >
        <Search className="h-4 w-4" />
      </Button>

      <ThemeToggle />

      {/* Notifications */}
      <Button
        variant="ghost"
        size="icon"
        className="relative h-8 w-8"
        aria-label={`Notifications${alertCount > 0 ? ` (${alertCount} en attente)` : ""}`}
        onClick={() => router.push("/dashboard")}
      >
        <Bell className="h-4 w-4" />
        {alertCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-warm-orange text-[9px] font-bold text-white px-1 animate-pulse-glow">
            {alertCount > 9 ? "9+" : alertCount}
          </span>
        )}
      </Button>

      {/* User menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full p-0" aria-label="Menu utilisateur">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-gradient-to-br from-warm-teal to-warm-teal/80 text-white text-xs font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium">Mon compte</p>
              {email && (
                <p className="text-xs text-muted-foreground truncate">{email}</p>
              )}
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => router.push("/parametres")}>
            <User className="mr-2 h-4 w-4" />
            Profil
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push("/parametres")}>
            <Settings className="mr-2 h-4 w-4" />
            Paramètres
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive">
            <LogOut className="mr-2 h-4 w-4" />
            Déconnexion
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}

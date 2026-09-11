"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

const links = [
  { href: "/outils", label: "Outils gratuits" },
  { href: "/demo", label: "Démo" },
  { href: "/blog", label: "Blog" },
  { href: "/#fonctionnalites", label: "Fonctionnalités" },
  { href: "/#pricing", label: "Tarifs" },
];

export function PublicHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  function isActive(href: string) {
    return pathname === href || (!href.includes("#") && pathname.startsWith(`${href}/`));
  }

  return (
    <>
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:rounded-lg focus:bg-primary focus:px-4 focus:py-3 focus:text-primary-foreground">Aller au contenu principal</a>
      <header className="sticky top-0 z-50 glass-topbar">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-2 px-4">
          <Link href="/" aria-label="Darons, accueil" className="flex shrink-0 items-center gap-2 font-serif text-lg font-bold">
            <span aria-hidden="true" className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary font-sans text-sm text-primary-foreground">D</span>Darons
          </Link>
          <nav aria-label="Navigation principale" className="hidden lg:flex items-center gap-5">
            {links.map((link) => <Link key={link.href} href={link.href} aria-current={isActive(link.href) ? "page" : undefined}
              className="text-sm text-muted-foreground hover:text-foreground aria-[current=page]:text-primary">{link.label}</Link>)}
          </nav>
          <div className="flex items-center gap-1 sm:gap-2">
            <Button asChild variant="ghost" size="sm"><Link href="/login">Connexion</Link></Button>
            <Button asChild size="sm" className="hidden sm:inline-flex"><Link href="/register">Créer mon compte</Link></Button>
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild><Button variant="ghost" size="icon" className="lg:hidden" aria-label="Ouvrir le menu"><Menu className="h-5 w-5" aria-hidden="true" /></Button></SheetTrigger>
              <SheetContent side="right" className="w-[min(20rem,100vw)]">
                <SheetHeader><SheetTitle>Explorer Darons</SheetTitle><SheetDescription>Les outils et ton espace familial, à portée de main.</SheetDescription></SheetHeader>
                <nav aria-label="Navigation mobile" className="mt-6 flex flex-col gap-2">
                  {links.map((link) => <Link key={link.href} href={link.href} onClick={() => setOpen(false)} aria-current={isActive(link.href) ? "page" : undefined}
                    className="rounded-lg px-3 py-3 text-sm font-medium hover:bg-muted aria-[current=page]:bg-muted">{link.label}</Link>)}
                  <Button asChild className="mt-4"><Link href="/register" onClick={() => setOpen(false)}>Créer mon compte gratuit</Link></Button>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
    </>
  );
}

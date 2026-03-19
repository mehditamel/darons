import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <header className="border-b bg-background">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-4">
          <Link href="/" className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-warm-orange text-white font-bold text-sm">
              D
            </div>
            <span className="text-lg font-serif font-bold">
              Darons
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/outils" className="hidden sm:block">
              <Button variant="ghost" size="sm">
                Tous les outils
              </Button>
            </Link>
            <Link href="/">
              <Button variant="ghost" size="sm">
                Accueil
              </Button>
            </Link>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-4 py-12">{children}</main>
      <footer className="border-t py-8">
        <div className="mx-auto max-w-4xl px-4">
          <div className="flex flex-wrap gap-4 justify-center text-xs text-muted-foreground">
            <Link href="/outils" className="hover:text-foreground">Outils gratuits</Link>
            <Link href="/mentions-legales" className="hover:text-foreground">Mentions légales</Link>
            <Link href="/cgu" className="hover:text-foreground">CGU</Link>
            <Link href="/politique-confidentialite" className="hover:text-foreground">Confidentialité</Link>
          </div>
          <p className="text-center text-xs text-muted-foreground mt-4">
            &copy; {new Date().getFullYear()} Darons. Tous droits réservés.
          </p>
        </div>
      </footer>
    </div>
  );
}

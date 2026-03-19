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
          <Link href="/">
            <Button variant="ghost" size="sm">
              Retour à l&apos;accueil
            </Button>
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-4 py-12">{children}</main>
      <footer className="border-t py-8 text-center text-xs text-muted-foreground">
        &copy; {new Date().getFullYear()} Darons. Tous droits réservés.
      </footer>
    </div>
  );
}

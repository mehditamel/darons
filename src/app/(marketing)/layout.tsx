import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/layout/footer";

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
            <Link href="/blog" className="hidden sm:block">
              <Button variant="ghost" size="sm">
                Blog
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
      <Footer variant="compact" />
    </div>
  );
}

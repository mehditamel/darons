import Link from "next/link";
import { Home, Wrench, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function MarketingNotFound() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <p className="text-8xl font-bold text-muted-foreground/20">404</p>
        <div>
          <h1 className="text-2xl font-serif font-bold">
            Cette page s&apos;est fait la malle
          </h1>
          <p className="mt-3 text-muted-foreground">
            On a retourné toute la baraque, impossible de la trouver.
            Essaie un de ces liens, c&apos;est plus fiable.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row justify-center gap-3">
          <Button asChild>
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Accueil
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/outils">
              <Wrench className="mr-2 h-4 w-4" />
              Outils gratuits
            </Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/blog">
              <BookOpen className="mr-2 h-4 w-4" />
              Blog
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

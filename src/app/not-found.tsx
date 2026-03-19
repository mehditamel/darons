import Link from "next/link";
import { Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <p className="text-8xl font-bold text-muted-foreground/20">404</p>
        <div>
          <h1 className="text-2xl font-bold">Page introuvable</h1>
          <p className="mt-2 text-muted-foreground">
            La page que vous cherchez n&apos;existe pas ou a été déplacée.
          </p>
        </div>
        <div className="flex justify-center gap-3">
          <Button asChild>
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Accueil
            </Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="javascript:history.back()">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

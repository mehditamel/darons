import Link from "next/link";
import { Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BackButton } from "@/components/shared/back-button";

export default function DashboardNotFound() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardContent className="pt-6 text-center space-y-4">
          <p className="text-6xl font-bold text-muted-foreground/30">404</p>
          <div>
            <h2 className="text-lg font-serif font-semibold">
              Cette page n&apos;existe pas (encore)
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              On a cherché partout, rien trouvé. Retourne au tableau de bord, c&apos;est plus sûr là-bas.
            </p>
          </div>
          <div className="flex justify-center gap-2">
            <Button asChild>
              <Link href="/dashboard">
                <Home className="mr-2 h-4 w-4" />
                Tableau de bord
              </Link>
            </Button>
            <BackButton />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

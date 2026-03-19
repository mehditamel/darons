import Link from "next/link";
import { Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function DashboardNotFound() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardContent className="pt-6 text-center space-y-4">
          <p className="text-6xl font-bold text-muted-foreground/30">404</p>
          <div>
            <h2 className="text-lg font-semibold">Page introuvable</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Cette page n&apos;existe pas ou a été déplacée.
            </p>
          </div>
          <div className="flex justify-center gap-2">
            <Button variant="outline" asChild>
              <Link href="/dashboard">
                <Home className="mr-2 h-4 w-4" />
                Tableau de bord
              </Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="javascript:history.back()">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

import Link from "next/link";

export default function TrustCardPublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-warm-cream via-background to-warm-teal/5">
      <header className="border-b bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-warm-teal text-white font-bold text-xs">
              D
            </div>
            <span className="text-base font-serif font-bold">
              Carnet de Confiance
            </span>
          </div>
          <span className="text-xs text-muted-foreground">
            Propulsé par{" "}
            <Link href="/" className="text-warm-orange hover:underline font-medium">
              Darons
            </Link>
          </span>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-8">{children}</main>
      <footer className="mx-auto max-w-3xl px-4 py-6 text-center text-xs text-muted-foreground">
        Ce lien est privé et expire automatiquement.{" "}
        <Link href="/" className="underline hover:text-foreground">
          C'est quoi Darons ?
        </Link>
      </footer>
    </div>
  );
}

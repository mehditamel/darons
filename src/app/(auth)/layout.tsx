import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="mb-8 text-center">
        <Link href="/" className="inline-block">
          <h1 className="text-3xl font-serif text-foreground">
            Darons
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            L&apos;app des parents qui gèrent
          </p>
        </Link>
      </div>
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}

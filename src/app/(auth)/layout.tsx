import Link from "next/link";
import {
  HeartPulse,
  Wallet,
  Calculator,
  Shield,
  Sparkles,
} from "lucide-react";

const FEATURES = [
  { icon: HeartPulse, text: "Vaccins et santé de tes enfants" },
  { icon: Wallet, text: "Budget familial intelligent" },
  { icon: Calculator, text: "Simulation fiscale gratuite" },
  { icon: Shield, text: "Données chiffrées et protégées" },
  { icon: Sparkles, text: "IA qui anticipe pour toi" },
];

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* Left panel - Branding (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-[45%] lg:flex-col lg:justify-between bg-gradient-to-br from-sidebar via-sidebar to-sidebar/95 p-10 text-white relative overflow-hidden">
        {/* Decorative shapes */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -right-20 h-80 w-80 rounded-full bg-warm-orange/10 blur-3xl" />
          <div className="absolute bottom-10 -left-10 h-64 w-64 rounded-full bg-warm-teal/10 blur-3xl" />
          <div className="absolute top-1/2 right-1/4 h-48 w-48 rounded-full bg-warm-blue/5 blur-2xl" />
        </div>

        <div className="relative">
          <Link href="/" className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-warm-orange to-warm-orange/80 text-white font-bold shadow-lg shadow-warm-orange/20">
              D
            </div>
            <span className="text-2xl font-serif font-bold">Darons</span>
          </Link>
        </div>

        <div className="relative space-y-8">
          <div>
            <h2 className="text-3xl font-serif font-bold leading-tight">
              Toute ta vie de daron.
              <br />
              <span className="text-warm-orange">Une seule app.</span>
            </h2>
            <p className="mt-4 text-sm text-white/60 max-w-sm leading-relaxed">
              Vaccins, budget, impôts, papiers. 100% gratuit, sans piège.
              Rejoins les parents qui galèrent moins.
            </p>
          </div>

          <div className="space-y-4">
            {FEATURES.map((feature) => (
              <div key={feature.text} className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10">
                  <feature.icon className="h-4 w-4 text-warm-orange" />
                </div>
                <span className="text-sm text-white/80">{feature.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          <p className="text-xs text-white/40">
            &copy; {new Date().getFullYear()} Darons. 100% gratuit, pour de vrai.
          </p>
        </div>
      </div>

      {/* Right panel - Form */}
      <div className="flex flex-1 flex-col items-center justify-center bg-background px-4 py-8">
        {/* Mobile logo */}
        <div className="mb-8 text-center lg:hidden">
          <Link href="/" className="inline-flex flex-col items-center gap-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-warm-orange to-warm-orange/80 text-white font-bold text-lg shadow-lg shadow-warm-orange/20">
              D
            </div>
            <h1 className="text-2xl font-serif font-bold text-foreground">
              Darons
            </h1>
            <p className="text-sm text-muted-foreground">
              L&apos;app des parents qui gèrent
            </p>
          </Link>
        </div>
        <div className="w-full max-w-md animate-fade-in-up">{children}</div>
      </div>
    </div>
  );
}

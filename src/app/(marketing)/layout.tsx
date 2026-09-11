import { PublicHeader } from "@/components/layout/public-header";
import { Footer } from "@/components/layout/footer";
import { RouteProgress } from "@/components/shared/route-progress";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <RouteProgress />
      <PublicHeader />
      <main id="main-content" tabIndex={-1} className="mx-auto max-w-4xl px-4 py-12">{children}</main>
      <Footer variant="compact" />
    </div>
  );
}

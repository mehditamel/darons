import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getTrustCardById } from "@/lib/actions/trust-card";
import { TrustCardDetail } from "@/components/confiance/trust-card-detail";
import { generateQrDataUrl } from "@/lib/trust-card/qr";

export const metadata: Metadata = {
  title: "Détail du carnet",
};

interface PageProps {
  params: { id: string };
}

export default async function TrustCardDetailPage({ params }: PageProps) {
  const result = await getTrustCardById(params.id);
  if (!result.success || !result.data) notFound();

  const card = result.data;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://darons.app";
  const shareUrl = `${baseUrl}/c/${card.token}`;
  const qrDataUrl = await generateQrDataUrl(shareUrl);

  return (
    <div className="section-stack">
      <Button variant="ghost" asChild className="-ml-3">
        <Link href="/confiance">
          <ArrowLeft className="h-4 w-4 mr-2" /> Tous mes carnets
        </Link>
      </Button>

      <TrustCardDetail card={card} shareUrl={shareUrl} qrDataUrl={qrDataUrl} />
    </div>
  );
}

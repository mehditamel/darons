import type { Metadata } from "next";
import { PublicPinForm } from "@/components/confiance/public-pin-form";

export const metadata: Metadata = {
  title: "Carnet de Confiance",
  description: "Accède aux infos confiées par un parent. Code PIN requis.",
  robots: { index: false, follow: false },
};

interface PageProps {
  params: Promise<{ token: string }>;
}

export default async function TrustCardPublicPage(props: PageProps) {
  const params = await props.params;
  return (
    <div className="max-w-md mx-auto pt-8">
      <PublicPinForm token={params.token} />
    </div>
  );
}

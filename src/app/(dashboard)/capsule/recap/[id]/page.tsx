import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getRecapById } from "@/lib/actions/capsule";
import { RecapViewer } from "@/components/capsule/recap-viewer";

export const metadata: Metadata = {
  title: "Récap Capsule",
};

interface PageProps {
  params: { id: string };
}

export default async function RecapPage({ params }: PageProps) {
  const result = await getRecapById(params.id);
  if (!result.success || !result.data) notFound();

  const recap = result.data;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <Button variant="ghost" asChild className="-ml-3">
          <Link href={`/capsule/${recap.memberId}`}>
            <ArrowLeft className="h-4 w-4 mr-2" /> La Capsule de {recap.memberFirstName}
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <a href={`/api/capsule/${recap.id}/pdf`} target="_blank" rel="noopener noreferrer">
            <Download className="h-4 w-4 mr-2" /> Télécharger en PDF
          </a>
        </Button>
      </div>

      <RecapViewer content={recap.content} />
    </div>
  );
}

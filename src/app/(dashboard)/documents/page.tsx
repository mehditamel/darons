import type { Metadata } from "next";
import { FileText, FolderLock, HardDrive } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { DocumentList } from "@/components/documents/document-list";
import { getDocuments } from "@/lib/actions/documents";
import { getFamilyMembers } from "@/lib/actions/family";

export const metadata: Metadata = {
  title: "Coffre-fort numérique",
};

function formatStorageUsed(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

export default async function DocumentsPage() {
  const [docsResult, membersResult] = await Promise.all([
    getDocuments(),
    getFamilyMembers(),
  ]);

  const documents = docsResult.data ?? [];
  const members = membersResult.data ?? [];

  const totalSize = documents.reduce((acc, d) => acc + (d.fileSize ?? 0), 0);
  const categories = new Set(documents.map((d) => d.category));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Coffre-fort numérique"
        description="Stockez et organisez tous les documents importants de votre famille"
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Documents"
          value={String(documents.length)}
          icon={FileText}
          color="bg-warm-blue/10 text-warm-blue"
        />
        <StatCard
          label="Catégories"
          value={String(categories.size)}
          icon={FolderLock}
          color="bg-warm-purple/10 text-warm-purple"
        />
        <StatCard
          label="Espace utilisé"
          value={formatStorageUsed(totalSize)}
          icon={HardDrive}
          color="bg-warm-teal/10 text-warm-teal"
        />
      </div>

      <DocumentList documents={documents} members={members} />
    </div>
  );
}

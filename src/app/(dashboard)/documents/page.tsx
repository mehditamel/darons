import type { Metadata } from "next";
import { FileText, FolderLock, HardDrive, Clock, Upload } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { AlertCard } from "@/components/shared/alert-card";
import { DocumentList } from "@/components/documents/document-list";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getDocuments } from "@/lib/actions/documents";
import { getFamilyMembers } from "@/lib/actions/family";
import { formatRelativeDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Coffre-fort numérique",
  description: "Stockez et organisez les documents importants de votre famille en toute sécurité",
};

const CATEGORY_LABELS: Record<string, string> = {
  identite: "Identité",
  sante: "Santé",
  fiscal: "Fiscal",
  scolaire: "Scolaire",
  caf: "CAF",
  assurance: "Assurance",
  logement: "Logement",
  autre: "Autre",
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

  // Sort by upload date for recent docs
  const recentDocs = [...documents]
    .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())
    .slice(0, 5);

  const latestUpload = recentDocs[0];

  // Count by category
  const categoryCounts: Record<string, number> = {};
  for (const doc of documents) {
    categoryCounts[doc.category] = (categoryCounts[doc.category] ?? 0) + 1;
  }

  return (
    <div className="space-y-6 page-enter">
      <PageHeader
        title="Coffre-fort numérique"
        description="Tes documents importants, bien rangés et en sécurité"
        icon={<FolderLock className="h-5 w-5" />}
      />

      {/* Stat cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Documents"
          value={String(documents.length)}
          icon={FileText}
          color="bg-warm-blue/10 text-warm-blue"
          gradientClass="card-gradient-blue"
        />
        <StatCard
          label="Catégories"
          value={String(categories.size)}
          icon={FolderLock}
          color="bg-warm-purple/10 text-warm-purple"
          gradientClass="card-gradient-purple"
        />
        <StatCard
          label="Espace utilisé"
          value={formatStorageUsed(totalSize)}
          icon={HardDrive}
          color="bg-warm-teal/10 text-warm-teal"
          gradientClass="card-gradient-teal"
        />
        <StatCard
          label="Dernier ajout"
          value={latestUpload ? formatRelativeDate(latestUpload.uploadedAt) : "—"}
          icon={Clock}
          color="bg-warm-orange/10 text-warm-orange"
          gradientClass="card-gradient-orange"
        />
      </div>

      {/* Empty state */}
      {documents.length === 0 && (
        <AlertCard
          title="Ton coffre-fort est vide"
          message="Ajoute ton premier document : CNI, livret de famille, ordonnance, attestation CAF... Tout est chiffré et sécurisé."
          priority="low"
          category="Documents"
        />
      )}

      {/* Recent documents */}
      {recentDocs.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5 text-warm-blue" />
              Documents récents
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {recentDocs.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between py-2 border-b last:border-0">
                <div className="flex items-center gap-2 min-w-0">
                  <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                  <p className="text-sm font-medium truncate">{doc.title}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-2">
                  <Badge variant="outline" className="text-[10px]">
                    {CATEGORY_LABELS[doc.category] ?? doc.category}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {formatRelativeDate(doc.uploadedAt)}
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <DocumentList documents={documents} members={members} />
    </div>
  );
}

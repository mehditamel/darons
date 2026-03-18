import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { AlertCard } from "@/components/shared/alert-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IdentityDocumentList } from "@/components/identite/identity-document-list";
import { getIdentityDocuments, getExpiringDocuments } from "@/lib/actions/identity";
import { getFamilyMembers } from "@/lib/actions/family";
import { CheckCircle, AlertTriangle, XCircle, IdCard } from "lucide-react";
import { DOCUMENT_TYPE_LABELS } from "@/types/family";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Identité & documents",
};

export default async function IdentitePage() {
  const [docsResult, membersResult, expiringResult] = await Promise.all([
    getIdentityDocuments(),
    getFamilyMembers(),
    getExpiringDocuments(),
  ]);

  const documents = docsResult.data ?? [];
  const members = membersResult.data ?? [];
  const expiring = expiringResult.data ?? [];

  const validCount = documents.filter((d) => d.status === "valid").length;
  const expiringSoonCount = documents.filter((d) => d.status === "expiring_soon").length;
  const expiredCount = documents.filter((d) => d.status === "expired").length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Identité & documents"
        description="Gérez les pièces d'identité de votre famille et recevez des alertes d'expiration"
      />

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total documents"
          value={String(documents.length)}
          icon={IdCard}
          color="bg-warm-blue/10 text-warm-blue"
        />
        <StatCard
          label="Valides"
          value={String(validCount)}
          icon={CheckCircle}
          color="bg-green-100 text-green-600"
        />
        <StatCard
          label="À renouveler"
          value={String(expiringSoonCount)}
          icon={AlertTriangle}
          color="bg-yellow-100 text-yellow-600"
        />
        <StatCard
          label="Expirés"
          value={String(expiredCount)}
          icon={XCircle}
          color="bg-red-100 text-red-600"
        />
      </div>

      {/* Expiry alerts */}
      {expiring.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Alertes d&apos;expiration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {expiring.map((doc) => (
              <AlertCard
                key={doc.id}
                title={`${DOCUMENT_TYPE_LABELS[doc.documentType]} — ${doc.memberFirstName}`}
                message={
                  doc.status === "expired"
                    ? `Expiré le ${formatDate(doc.expiryDate!)}`
                    : `Expire le ${formatDate(doc.expiryDate!)}`
                }
                priority={doc.status === "expired" ? "high" : "medium"}
                category="Identité"
                dueDate={formatDate(doc.expiryDate!)}
              />
            ))}
          </CardContent>
        </Card>
      )}

      {/* Document list */}
      <IdentityDocumentList documents={documents} members={members} />
    </div>
  );
}

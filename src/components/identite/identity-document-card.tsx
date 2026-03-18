import { Pencil, Trash2, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { differenceInDays } from "date-fns";
import {
  DOCUMENT_TYPE_LABELS,
  DOCUMENT_STATUS_LABELS,
  type DocumentStatus,
} from "@/types/family";
import type { IdentityDocumentWithMember } from "@/lib/actions/identity";

interface IdentityDocumentCardProps {
  document: IdentityDocumentWithMember;
  onEdit: (doc: IdentityDocumentWithMember) => void;
  onDelete: (doc: IdentityDocumentWithMember) => void;
}

const STATUS_CONFIG: Record<DocumentStatus, { variant: "default" | "secondary" | "destructive"; icon: typeof CheckCircle }> = {
  valid: { variant: "default", icon: CheckCircle },
  expiring_soon: { variant: "secondary", icon: AlertTriangle },
  expired: { variant: "destructive", icon: XCircle },
};

export function IdentityDocumentCard({ document, onEdit, onDelete }: IdentityDocumentCardProps) {
  const config = STATUS_CONFIG[document.status];
  const StatusIcon = config.icon;

  const daysUntilExpiry = document.expiryDate
    ? differenceInDays(new Date(document.expiryDate), new Date())
    : null;

  return (
    <Card className={document.status === "expired" ? "border-destructive/50" : document.status === "expiring_soon" ? "border-yellow-500/50" : ""}>
      <CardContent className="flex items-center gap-4 p-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted shrink-0">
          <StatusIcon className={`h-5 w-5 ${
            document.status === "valid" ? "text-green-600" :
            document.status === "expiring_soon" ? "text-yellow-600" :
            "text-destructive"
          }`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold">{DOCUMENT_TYPE_LABELS[document.documentType]}</p>
            <Badge variant={config.variant}>
              {DOCUMENT_STATUS_LABELS[document.status]}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {document.memberFirstName} {document.memberLastName}
          </p>
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-muted-foreground">
            {document.documentNumber && (
              <span>N° {document.documentNumber}</span>
            )}
            {document.issueDate && (
              <span>Délivré le {formatDate(document.issueDate)}</span>
            )}
            {document.expiryDate && (
              <span>
                Expire le {formatDate(document.expiryDate)}
                {daysUntilExpiry !== null && daysUntilExpiry > 0 && (
                  <> ({daysUntilExpiry} jour{daysUntilExpiry > 1 ? "s" : ""})</>
                )}
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-1 shrink-0">
          <Button variant="ghost" size="icon" onClick={() => onEdit(document)} aria-label="Modifier">
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onDelete(document)} aria-label="Supprimer">
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

"use client";

import { useState } from "react";
import { Plus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { MemberCard } from "@/components/famille/member-card";
import { MemberForm } from "@/components/famille/member-form";
import { DeleteMemberDialog } from "@/components/famille/delete-member-dialog";
import type { FamilyMember } from "@/types/family";

interface MemberListProps {
  members: FamilyMember[];
}

export function MemberList({ members }: MemberListProps) {
  const [formOpen, setFormOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<FamilyMember | undefined>();
  const [deletingMember, setDeletingMember] = useState<FamilyMember | null>(null);

  const handleEdit = (member: FamilyMember) => {
    setEditingMember(member);
    setFormOpen(true);
  };

  const handleCloseForm = (open: boolean) => {
    setFormOpen(open);
    if (!open) setEditingMember(undefined);
  };

  if (members.length === 0) {
    return (
      <>
        <EmptyState
          icon={Users}
          title="Aucun membre dans le foyer"
          description="Commencez par ajouter les membres de votre famille."
          actionLabel="Ajouter un membre"
          onAction={() => setFormOpen(true)}
        />
        <MemberForm open={formOpen} onOpenChange={handleCloseForm} />
      </>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground">
          {members.length} membre{members.length > 1 ? "s" : ""} dans le foyer
        </p>
        <Button size="sm" onClick={() => setFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Ajouter
        </Button>
      </div>
      <div className="space-y-3">
        {members.map((member) => (
          <MemberCard
            key={member.id}
            member={member}
            onEdit={handleEdit}
            onDelete={(m) => setDeletingMember(m)}
          />
        ))}
      </div>

      <MemberForm
        key={editingMember?.id ?? "new"}
        open={formOpen}
        onOpenChange={handleCloseForm}
        member={editingMember}
      />
      <DeleteMemberDialog
        open={!!deletingMember}
        onOpenChange={(open) => { if (!open) setDeletingMember(null); }}
        member={deletingMember}
      />
    </>
  );
}

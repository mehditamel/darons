"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { addGroupMember } from "@/lib/actions/shared-expenses";
import { UserPlus } from "lucide-react";

interface AddMemberDialogProps {
  groupId: string;
}

export function AddMemberDialog({ groupId }: AddMemberDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    const result = await addGroupMember(groupId, name, email || undefined);
    setLoading(false);

    if (result.success) {
      toast({ title: "Participant ajouté" });
      setName("");
      setEmail("");
      setOpen(false);
    } else {
      toast({ title: "Erreur", description: result.error, variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <UserPlus className="h-4 w-4 mr-1" />
          Ajouter
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ajouter un participant</DialogTitle>
          <DialogDescription>
            Ajoutez une personne au groupe de dépenses.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="memberName">Nom</Label>
            <Input
              id="memberName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Prénom ou surnom"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="memberEmail">Email (optionnel)</Label>
            <Input
              id="memberEmail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@exemple.com"
            />
          </div>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Ajout..." : "Ajouter"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { sendReferralInvite } from "@/lib/actions/referral";
import { referralSchema, type ReferralFormData } from "@/lib/validators/sharing";
import { Send } from "lucide-react";

export function ReferralInviteForm() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<ReferralFormData>({
    resolver: zodResolver(referralSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (data: ReferralFormData) => {
    setLoading(true);
    const result = await sendReferralInvite(data);
    setLoading(false);

    if (result.success) {
      toast({
        title: "Invitation envoyée",
        description: `Un email de parrainage a été envoyé à ${data.email}`,
      });
      form.reset();
    } else {
      toast({ title: "Erreur", description: result.error, variant: "destructive" });
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="referralEmail">Adresse email du filleul</Label>
        <Input
          id="referralEmail"
          type="email"
          placeholder="ami@email.com"
          {...form.register("email")}
        />
        {form.formState.errors.email && (
          <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
        )}
      </div>
      <Button type="submit" disabled={loading} className="w-full">
        <Send className="h-4 w-4 mr-2" />
        {loading ? "Envoi en cours..." : "Envoyer l'invitation"}
      </Button>
    </form>
  );
}

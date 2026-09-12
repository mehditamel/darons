"use client";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function NewsletterPreferenceForm({ token, action }: { token: string; action: "confirm" | "unsubscribe" }) {
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const valid = /^[a-f0-9]{64}$/.test(token);
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError("");
    try {
      const response = await fetch("/api/newsletter/manage", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token, action }) });
      const result = await response.json();
      if (!response.ok) { setError(result.error || "Réessaie dans un instant."); return; }
      setDone(true);
    } catch { setError("La connexion a échoué. Réessaie dans un instant."); }
    finally { setPending(false); }
  }
  return (
    <div className="mx-auto max-w-lg space-y-6 rounded-xl border bg-card p-6 sm:p-8">
      <h1 className="text-2xl font-bold">{action === "confirm" ? "Confirmer ton inscription" : "Gérer ton abonnement"}</h1>
      {done ? <p role="status">{action === "confirm" ? "Ton inscription est confirmée. À bientôt dans ta boîte email !" : "Tu es désinscrit·e. Tu ne recevras plus la newsletter Darons."}</p>
        : !valid ? <p role="alert">Ce lien est incomplet ou invalide. Retrouve le lien dans ton email, ou demande-en un nouveau depuis le blog.</p>
        : <form onSubmit={submit} className="space-y-4" aria-busy={pending}>
          <p className="text-muted-foreground">{action === "confirm" ? "Confirme que tu souhaites recevoir les conseils Darons par email. Tu pourras te désinscrire à tout moment." : "Confirme que tu souhaites arrêter de recevoir la newsletter. Ton compte Darons reste accessible."}</p>
          {error && <p role="alert" className="text-destructive">{error}</p>}
          <Button type="submit" disabled={pending} className="w-full">{pending ? "Un instant…" : action === "confirm" ? "Confirmer mon inscription" : "Me désinscrire"}</Button>
        </form>}
      <Link href="/blog" className="inline-block text-primary underline underline-offset-4">Revenir aux articles</Link>
    </div>
  );
}

"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { AlertCard } from "./alert-card";
import { Button } from "@/components/ui/button";
import { dismissAlert } from "@/lib/actions/alerts";

interface DismissibleAlertCardProps {
  id: string;
  title: string;
  message: string;
  priority: "high" | "medium" | "low";
  category: string;
  dueDate?: string;
  actionUrl?: string | null;
}

export function DismissibleAlertCard({
  id,
  title,
  message,
  priority,
  category,
  dueDate,
  actionUrl,
}: DismissibleAlertCardProps) {
  const [dismissed, setDismissed] = useState(false);

  async function handleDismiss() {
    setDismissed(true);
    await dismissAlert(id);
  }

  if (dismissed) return null;

  return (
    <div className="relative group animate-fade-in-up" role="alert" aria-live="polite">
      <AlertCard
        title={title}
        message={message}
        priority={priority}
        category={category}
        dueDate={dueDate}
        actionUrl={actionUrl}
      />
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-1 top-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity rounded-full"
        onClick={handleDismiss}
      >
        <X className="h-3 w-3" />
        <span className="sr-only">Fermer l&apos;alerte</span>
      </Button>
    </div>
  );
}

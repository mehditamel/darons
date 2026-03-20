"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export function BackButton() {
  const router = useRouter();

  return (
    <Button variant="ghost" onClick={() => router.back()}>
      <ArrowLeft className="mr-2 h-4 w-4" />
      Retour
    </Button>
  );
}

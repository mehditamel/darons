"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { PullToRefresh } from "@/components/shared/pull-to-refresh";
import { useIsCoarsePointer } from "@/hooks/use-media-query";
import { trackEvent } from "@/lib/analytics";

interface RefreshablePageProps {
  children: React.ReactNode;
  page: "budget" | "sante" | "alertes" | "dashboard";
}

export function RefreshablePage({ children, page }: RefreshablePageProps) {
  const router = useRouter();
  const isCoarsePointer = useIsCoarsePointer();

  const handleRefresh = useCallback(async () => {
    trackEvent("pull_to_refresh_triggered", { page });
    router.refresh();
    await new Promise((resolve) => setTimeout(resolve, 500));
  }, [router, page]);

  if (!isCoarsePointer) {
    return <>{children}</>;
  }

  return <PullToRefresh onRefresh={handleRefresh}>{children}</PullToRefresh>;
}

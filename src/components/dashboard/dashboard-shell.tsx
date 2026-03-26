"use client";

import { useRouter } from "next/navigation";
import { PullToRefresh } from "@/components/shared/pull-to-refresh";

interface DashboardShellProps {
  children: React.ReactNode;
}

export function DashboardShell({ children }: DashboardShellProps) {
  const router = useRouter();

  async function handleRefresh() {
    router.refresh();
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      {children}
    </PullToRefresh>
  );
}

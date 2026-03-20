import { SkeletonPage } from "@/components/shared/skeleton-page";

export default function DashboardLoading() {
  return <SkeletonPage statCards={4} contentCards={2} />;
}

import { SkeletonPage } from "@/components/shared/skeleton-page";

export default function BudgetLoading() {
  return <SkeletonPage statCards={4} showTabs contentCards={2} />;
}

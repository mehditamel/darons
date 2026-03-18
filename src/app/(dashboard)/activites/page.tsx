import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { ActivityList } from "@/components/educatif/activity-list";
import { AiSuggestionsCard } from "@/components/educatif/ai-suggestions-card";
import { getFamilyMembers } from "@/lib/actions/family";
import { getActivities } from "@/lib/actions/educational";
import { PLAN_LIMITS } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";
import type { Activity } from "@/types/educational";

export const metadata: Metadata = {
  title: "Activités & loisirs",
};

export default async function ActivitesPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = user
    ? await supabase.from("profiles").select("subscription_plan").eq("id", user.id).single()
    : { data: null };
  const plan = (profile?.subscription_plan ?? "free") as keyof typeof PLAN_LIMITS;
  const hasAiSuggestions = PLAN_LIMITS[plan].hasAiCoach;

  const membersResult = await getFamilyMembers();
  const allMembers = membersResult.data ?? [];
  const children = allMembers.filter((m) => m.memberType === "child");

  const activitiesByMember: Record<string, Activity[]> = {};

  await Promise.all(
    children.map(async (child) => {
      const result = await getActivities(child.id);
      activitiesByMember[child.id] = result.data ?? [];
    })
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Activités & loisirs"
        description="Gérez les activités extra-scolaires et le planning hebdomadaire"
      />

      <ActivityList
        activitiesByMember={activitiesByMember}
      >
        {children}
      </ActivityList>

      {children.map((child) => (
        <AiSuggestionsCard
          key={child.id}
          childId={child.id}
          childName={child.firstName}
          hasAccess={hasAiSuggestions}
        />
      ))}
    </div>
  );
}

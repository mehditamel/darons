import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { SchoolingTimeline } from "@/components/educatif/schooling-timeline";
import { SchoolSearch } from "@/components/educatif/school-search";
import { getFamilyMembers } from "@/lib/actions/family";
import { getSchooling } from "@/lib/actions/educational";
import type { Schooling } from "@/types/educational";

export const metadata: Metadata = {
  title: "Scolarité",
  description: "Timeline scolaire, inscriptions et suivi des établissements de vos enfants",
};

export default async function ScolaritePage() {
  const membersResult = await getFamilyMembers();
  const allMembers = membersResult.data ?? [];
  const children = allMembers.filter((m) => m.memberType === "child");

  const schoolingByMember: Record<string, Schooling[]> = {};

  await Promise.all(
    children.map(async (child) => {
      const result = await getSchooling(child.id);
      schoolingByMember[child.id] = result.data ?? [];
    })
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Scolarité"
        description="Timeline prévisionnelle et suivi de la scolarité de vos enfants"
      />

      <SchoolingTimeline
        schoolingByMember={schoolingByMember}
      >
        {children}
      </SchoolingTimeline>

      <SchoolSearch />
    </div>
  );
}

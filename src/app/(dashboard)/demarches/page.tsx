import type { Metadata } from "next";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/shared/page-header";
import { DemarchesTimeline } from "@/components/demarches/demarches-timeline";
import { DemarchesTaskForm } from "@/components/demarches/demarches-task-form";
import { SocialRightsSimulator } from "@/components/demarches/social-rights-simulator";
import {
  getAdministrativeTasks,
  generateTasksFromTemplates,
} from "@/lib/actions/demarches";
import { getFamilyMembers } from "@/lib/actions/family";

export const metadata: Metadata = {
  title: "Démarches & droits",
  description:
    "Checklist des démarches administratives et simulation de vos droits sociaux",
};

export default async function DemarchesPage() {
  const [tasksResult, membersResult] = await Promise.all([
    getAdministrativeTasks(),
    getFamilyMembers(),
  ]);

  const members = membersResult.success ? (membersResult.data ?? []) : [];
  const children = members.filter((m) => m.memberType === "child");

  // Auto-generate tasks from templates for each child if none exist
  for (const child of children) {
    await generateTasksFromTemplates(child.id, child.birthDate);
  }

  // Re-fetch after potential generation
  const finalTasksResult = await getAdministrativeTasks();
  const tasks = finalTasksResult.success
    ? (finalTasksResult.data ?? [])
    : tasksResult.success
      ? (tasksResult.data ?? [])
      : [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Démarches & droits"
        description="Checklist des démarches administratives et simulation de vos droits sociaux"
      />

      <Tabs defaultValue="checklist" className="space-y-4">
        <TabsList>
          <TabsTrigger value="checklist">Checklist</TabsTrigger>
          <TabsTrigger value="simulateur">Simulateur droits</TabsTrigger>
          <TabsTrigger value="ajouter">Ajouter</TabsTrigger>
        </TabsList>

        <TabsContent value="checklist">
          <DemarchesTimeline initialTasks={tasks} members={members} />
        </TabsContent>

        <TabsContent value="simulateur">
          <SocialRightsSimulator />
        </TabsContent>

        <TabsContent value="ajouter">
          <DemarchesTaskForm members={members} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

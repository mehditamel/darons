import type { Metadata } from "next";
import {
  ClipboardList,
  ClipboardCheck,
  AlertTriangle,
  Clock,
  CheckCircle,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { AlertCard } from "@/components/shared/alert-card";
import { DemarchesTimeline } from "@/components/demarches/demarches-timeline";
import { DemarchesTaskForm } from "@/components/demarches/demarches-task-form";
import { SocialRightsSimulator } from "@/components/demarches/social-rights-simulator";
import { AgeRightsGuide } from "@/components/demarches/age-rights-guide";
import { LetterTemplatesButton } from "@/components/demarches/letter-templates-button";
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

  // Compute stats
  const now = new Date();
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.completed).length;
  const overdueTasks = tasks.filter(
    (t) => !t.completed && t.dueDate && new Date(t.dueDate) < now,
  );
  const urgentTasks = tasks.filter(
    (t) => !t.completed && (t.priority === "urgent" || t.priority === "high"),
  );
  const completionPct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="space-y-6 page-enter">
      <PageHeader
        title="Démarches & droits"
        description="Tes papiers administratifs sous contrôle"
        icon={<ClipboardList className="h-5 w-5" />}
      />

      {/* Stat cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total démarches"
          value={String(totalTasks)}
          icon={<ClipboardList className="h-5 w-5" aria-hidden="true" />}
          color="bg-warm-blue/10 text-warm-blue"
          gradientClass="card-gradient-blue"
        />
        <StatCard
          label="Complétées"
          value={String(completedTasks)}
          icon={<CheckCircle className="h-5 w-5" aria-hidden="true" />}
          color="bg-warm-green/10 text-warm-green"
          gradientClass="card-gradient-green"
          trend={`${completionPct}%`}
          trendUp={completionPct >= 50}
        />
        <StatCard
          label="En retard"
          value={String(overdueTasks.length)}
          icon={<Clock className="h-5 w-5" aria-hidden="true" />}
          color={overdueTasks.length > 0 ? "bg-warm-red/10 text-warm-red" : "bg-warm-green/10 text-warm-green"}
          gradientClass={overdueTasks.length > 0 ? "card-gradient-red" : "card-gradient-green"}
        />
        <StatCard
          label="Urgentes"
          value={String(urgentTasks.length)}
          icon={<AlertTriangle className="h-5 w-5" aria-hidden="true" />}
          color={urgentTasks.length > 0 ? "bg-warm-orange/10 text-warm-orange" : "bg-warm-green/10 text-warm-green"}
          gradientClass={urgentTasks.length > 0 ? "card-gradient-orange" : "card-gradient-green"}
        />
      </div>

      {/* Overdue tasks alert */}
      {overdueTasks.length > 0 && (
        <AlertCard
          title={`${overdueTasks.length} démarche${overdueTasks.length > 1 ? "s" : ""} en retard`}
          message={`Il te reste des démarches à faire : ${overdueTasks.slice(0, 3).map((t) => t.title).join(", ")}${overdueTasks.length > 3 ? "…" : ""}`}
          priority="high"
          category="Démarches"
        />
      )}

      <Tabs defaultValue="checklist" className="space-y-4">
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="checklist">Checklist</TabsTrigger>
          <TabsTrigger value="simulateur">Simulateur droits</TabsTrigger>
          <TabsTrigger value="droits">Droits par âge</TabsTrigger>
          <TabsTrigger value="courriers">Courriers</TabsTrigger>
          <TabsTrigger value="ajouter">Ajouter</TabsTrigger>
        </TabsList>

        <TabsContent value="checklist">
          <DemarchesTimeline initialTasks={tasks} members={members} />
        </TabsContent>

        <TabsContent value="simulateur">
          <SocialRightsSimulator />
        </TabsContent>

        <TabsContent value="droits">
          <AgeRightsGuide />
        </TabsContent>

        <TabsContent value="courriers">
          <LetterTemplatesButton />
        </TabsContent>

        <TabsContent value="ajouter">
          <DemarchesTaskForm members={members} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

import { callClaude, parseJsonResponse } from "@/lib/ai/anthropic";
import { CAPSULE_RECAP_PROMPT } from "@/lib/ai/prompts";
import type { AggregatedData } from "./aggregator";
import type { CapsuleContent } from "@/types/capsule";

function buildUserMessage(data: AggregatedData): string {
  const ageStartYears = Math.floor(data.ageMonthsAtStart / 12);
  const ageStartMonths = data.ageMonthsAtStart % 12;
  const ageEndYears = Math.floor(data.ageMonthsAtEnd / 12);
  const ageEndMonths = data.ageMonthsAtEnd % 12;

  const lines: string[] = [];
  lines.push(`ENFANT : ${data.child.firstName}`);
  lines.push(`PÉRIODE : ${data.periodLabel} (${data.periodStart} → ${data.periodEnd})`);
  lines.push(
    `ÂGE : début ${ageStartYears}a ${ageStartMonths}m → fin ${ageEndYears}a ${ageEndMonths}m`
  );
  lines.push("");

  if (data.milestones.length > 0) {
    lines.push("JALONS DE DÉVELOPPEMENT FRANCHIS :");
    data.milestones.forEach((m) => {
      lines.push(`- [${m.category}] ${m.name} (le ${m.achievedDate ?? "?"})`);
    });
    lines.push("");
  }

  if (data.journalEntries.length > 0) {
    lines.push("JOURNAL PARENTAL (entrées du parent) :");
    data.journalEntries.slice(0, 30).forEach((j) => {
      const mood = j.mood ? ` [humeur:${j.mood}]` : "";
      lines.push(`- ${j.date}${mood} : ${j.content.slice(0, 280)}`);
    });
    lines.push("");
  }

  if (data.vaccinations.length > 0) {
    lines.push("VACCINS REÇUS :");
    data.vaccinations.forEach((v) => {
      lines.push(`- ${v.name} (${v.date})`);
    });
    lines.push("");
  }

  if (data.growthMeasurements.length > 0) {
    lines.push("MESURES DE CROISSANCE :");
    data.growthMeasurements.forEach((g) => {
      const parts: string[] = [];
      if (g.weightKg) parts.push(`${g.weightKg}kg`);
      if (g.heightCm) parts.push(`${g.heightCm}cm`);
      lines.push(`- ${g.date} : ${parts.join(", ")}`);
    });
    lines.push("");
  }

  if (data.appointments.length > 0) {
    lines.push("RDV MÉDICAUX EFFECTUÉS :");
    data.appointments.forEach((a) => {
      lines.push(`- ${a.date.slice(0, 10)} : ${a.type}${a.practitioner ? ` (${a.practitioner})` : ""}`);
    });
    lines.push("");
  }

  if (data.memories.length > 0) {
    lines.push(`SOUVENIRS UPLOADÉS (${data.memoryCount} au total) :`);
    data.memories.slice(0, 20).forEach((m) => {
      lines.push(`- ${m.date} [${m.type}] : ${m.caption ?? "(sans légende)"}`);
    });
    lines.push("");
  }

  if (lines.length === 3) {
    lines.push("(aucune donnée significative sur la période — fais un récap très court et honnête)");
  }

  return lines.join("\n");
}

export async function generateRecapContent(
  data: AggregatedData
): Promise<CapsuleContent> {
  const userMessage = buildUserMessage(data);
  const response = await callClaude(CAPSULE_RECAP_PROMPT, userMessage, 2000);
  return parseJsonResponse<CapsuleContent>(response);
}

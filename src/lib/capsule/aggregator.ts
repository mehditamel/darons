import type { SupabaseClient } from "@supabase/supabase-js";

export interface AggregatedData {
  child: { firstName: string; birthDate: string };
  periodLabel: string;
  periodStart: string;
  periodEnd: string;
  ageMonthsAtStart: number;
  ageMonthsAtEnd: number;
  milestones: Array<{ category: string; name: string; achievedDate: string | null }>;
  journalEntries: Array<{ date: string; content: string; mood: string | null }>;
  vaccinations: Array<{ name: string; date: string }>;
  growthMeasurements: Array<{ date: string; weightKg: number | null; heightCm: number | null }>;
  appointments: Array<{ type: string; date: string; practitioner: string | null }>;
  memories: Array<{ date: string; caption: string | null; type: string }>;
  memoryCount: number;
}

function monthsBetween(from: string, to: string): number {
  const fromDate = new Date(from);
  const toDate = new Date(to);
  return (
    (toDate.getFullYear() - fromDate.getFullYear()) * 12 +
    (toDate.getMonth() - fromDate.getMonth())
  );
}

export async function aggregatePeriodData(
  supabase: SupabaseClient,
  memberId: string,
  periodStart: string,
  periodEnd: string,
  periodLabelText: string
): Promise<AggregatedData | null> {
  const { data: member } = await supabase
    .from("family_members")
    .select("first_name, birth_date")
    .eq("id", memberId)
    .single();
  if (!member) return null;

  const [
    milestonesRes,
    journalRes,
    vaccinationsRes,
    growthRes,
    appointmentsRes,
    memoriesRes,
  ] = await Promise.all([
    supabase
      .from("development_milestones")
      .select("category, milestone_name, achieved_date")
      .eq("member_id", memberId)
      .gte("achieved_date", periodStart)
      .lte("achieved_date", periodEnd)
      .order("achieved_date", { ascending: true }),
    supabase
      .from("parent_journal")
      .select("entry_date, content, mood")
      .eq("member_id", memberId)
      .gte("entry_date", periodStart)
      .lte("entry_date", periodEnd)
      .order("entry_date", { ascending: true }),
    supabase
      .from("vaccinations")
      .select("vaccine_name, administered_date")
      .eq("member_id", memberId)
      .not("administered_date", "is", null)
      .gte("administered_date", periodStart)
      .lte("administered_date", periodEnd)
      .order("administered_date", { ascending: true }),
    supabase
      .from("growth_measurements")
      .select("measurement_date, weight_kg, height_cm")
      .eq("member_id", memberId)
      .gte("measurement_date", periodStart)
      .lte("measurement_date", periodEnd)
      .order("measurement_date", { ascending: true }),
    supabase
      .from("medical_appointments")
      .select("appointment_type, appointment_date, practitioner")
      .eq("member_id", memberId)
      .eq("completed", true)
      .gte("appointment_date", periodStart)
      .lte("appointment_date", `${periodEnd}T23:59:59`),
    supabase
      .from("memories")
      .select("memory_date, caption, memory_type")
      .eq("member_id", memberId)
      .gte("memory_date", periodStart)
      .lte("memory_date", periodEnd)
      .order("memory_date", { ascending: true }),
  ]);

  return {
    child: { firstName: member.first_name, birthDate: member.birth_date },
    periodLabel: periodLabelText,
    periodStart,
    periodEnd,
    ageMonthsAtStart: monthsBetween(member.birth_date, periodStart),
    ageMonthsAtEnd: monthsBetween(member.birth_date, periodEnd),
    milestones: (milestonesRes.data ?? []).map((m) => ({
      category: m.category,
      name: m.milestone_name,
      achievedDate: m.achieved_date,
    })),
    journalEntries: (journalRes.data ?? []).map((j) => ({
      date: j.entry_date,
      content: j.content,
      mood: j.mood,
    })),
    vaccinations: (vaccinationsRes.data ?? []).map((v) => ({
      name: v.vaccine_name,
      date: v.administered_date,
    })),
    growthMeasurements: (growthRes.data ?? []).map((g) => ({
      date: g.measurement_date,
      weightKg: g.weight_kg,
      heightCm: g.height_cm,
    })),
    appointments: (appointmentsRes.data ?? []).map((a) => ({
      type: a.appointment_type,
      date: a.appointment_date,
      practitioner: a.practitioner,
    })),
    memories: (memoriesRes.data ?? []).map((m) => ({
      date: m.memory_date,
      caption: m.caption,
      type: m.memory_type,
    })),
    memoryCount: (memoriesRes.data ?? []).length,
  };
}

export function quarterBoundsForDate(date: Date): { start: string; end: string } {
  const year = date.getFullYear();
  const month = date.getMonth();
  const quarterStartMonth = Math.floor(month / 3) * 3;
  const start = new Date(year, quarterStartMonth, 1);
  const end = new Date(year, quarterStartMonth + 3, 0);
  return {
    start: start.toISOString().slice(0, 10),
    end: end.toISOString().slice(0, 10),
  };
}

export function yearBoundsForDate(date: Date): { start: string; end: string } {
  const year = date.getFullYear();
  return {
    start: `${year}-01-01`,
    end: `${year}-12-31`,
  };
}

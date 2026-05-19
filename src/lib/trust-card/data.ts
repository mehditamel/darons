import type { SupabaseClient } from "@supabase/supabase-js";
import type { TrustCardPayload, TrustCardSection } from "@/types/trust-card";

const DEFAULT_EMERGENCY_CONTACTS = [
  { label: "SAMU", phone: "15" },
  { label: "Urgences européennes", phone: "112" },
  { label: "Urgences pour sourds/malentendants", phone: "114" },
  { label: "Centre antipoison", phone: "01 40 05 48 48" },
  { label: "SOS Médecins", phone: "3624" },
];

interface LoadOptions {
  memberId: string;
  sections: TrustCardSection[];
  notes: string | null;
  expiresAt: string;
}

export async function loadTrustCardPayload(
  supabase: SupabaseClient,
  opts: LoadOptions
): Promise<TrustCardPayload | null> {
  const { data: member } = await supabase
    .from("family_members")
    .select("first_name, last_name, birth_date, photo_url")
    .eq("id", opts.memberId)
    .single();

  if (!member) return null;

  const payload: TrustCardPayload = {
    childFirstName: member.first_name,
    childBirthDate: member.birth_date,
    childPhotoUrl: member.photo_url,
    sections: opts.sections,
    notes: opts.notes,
    expiresAt: opts.expiresAt,
    generatedAt: new Date().toISOString(),
  };

  if (opts.sections.includes("allergies")) {
    const { data } = await supabase
      .from("allergies")
      .select("allergen, severity, reaction")
      .eq("member_id", opts.memberId)
      .eq("active", true)
      .order("severity", { ascending: false });
    payload.allergies = (data ?? []).map((a) => ({
      allergen: a.allergen,
      severity: a.severity,
      reaction: a.reaction,
    }));
  }

  if (opts.sections.includes("vaccinations")) {
    const { data } = await supabase
      .from("vaccinations")
      .select("vaccine_name, administered_date, next_due_date, status")
      .eq("member_id", opts.memberId)
      .order("administered_date", { ascending: false, nullsFirst: false });
    payload.vaccinations = (data ?? []).map((v) => ({
      vaccineName: v.vaccine_name,
      administeredDate: v.administered_date,
      nextDueDate: v.next_due_date,
      status: v.status,
    }));
  }

  if (opts.sections.includes("practitioners")) {
    const { data } = await supabase
      .from("medical_appointments")
      .select("appointment_type, practitioner, location")
      .eq("member_id", opts.memberId)
      .not("practitioner", "is", null);
    const seen = new Set<string>();
    payload.practitioners = [];
    for (const row of data ?? []) {
      const key = `${row.practitioner}-${row.appointment_type}`;
      if (seen.has(key) || !row.practitioner) continue;
      seen.add(key);
      payload.practitioners.push({
        name: row.practitioner,
        type: row.appointment_type,
        phone: row.location ?? null,
      });
    }
  }

  if (opts.sections.includes("emergency")) {
    payload.emergencyContacts = DEFAULT_EMERGENCY_CONTACTS;
  }

  if (opts.sections.includes("identite")) {
    payload.identite = {
      firstName: member.first_name,
      lastName: member.last_name,
      birthDate: member.birth_date,
      bloodType: null,
    };
  }

  return payload;
}

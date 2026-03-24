import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendEmail, sendInAppNotification } from "@/lib/integrations/notifications";
import { VACCINATION_SCHEDULE } from "@/lib/constants";
import { differenceInMonths, differenceInDays, format, addDays } from "date-fns";
import { fr } from "date-fns/locale";

// CRON-friendly route — can be called by Vercel Cron daily
// Checks for vaccines due in the next 14 days and sends reminders

export async function GET(request: Request) {
  // Verify cron secret for security (Vercel Cron sends this header)
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Non autorise" }, { status: 401 });
  }

  const supabase = createClient();

  // Get all households with children
  const { data: households } = await supabase
    .from("households")
    .select("id, owner_id, profiles!inner(email)");

  if (!households || households.length === 0) {
    return NextResponse.json({ processed: 0 });
  }

  let totalReminders = 0;

  for (const household of households) {
    const householdId = household.id;
    const ownerEmail = (household as Record<string, unknown>).profiles
      ? ((household as Record<string, unknown>).profiles as Record<string, unknown>).email as string
      : null;

    if (!ownerEmail) continue;

    // Get children
    const { data: children } = await supabase
      .from("family_members")
      .select("id, first_name, birth_date")
      .eq("household_id", householdId)
      .eq("member_type", "child");

    if (!children || children.length === 0) continue;

    // Get all vaccinations for children
    const childIds = children.map((c) => c.id);
    const { data: vaccinations } = await supabase
      .from("vaccinations")
      .select("member_id, vaccine_code, dose_number, status")
      .in("member_id", childIds)
      .eq("status", "done");

    const doneVaccines = vaccinations ?? [];

    // Check recent notifications to avoid duplicates
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data: recentNotifs } = await supabase
      .from("notification_log")
      .select("subject")
      .eq("household_id", householdId)
      .eq("notification_type", "vaccine_reminder")
      .gte("sent_at", sevenDaysAgo.toISOString());

    const recentSubjects = new Set((recentNotifs ?? []).map((n) => n.subject));

    const now = new Date();
    const reminders: Array<{ childName: string; vaccineName: string; doseNumber: number; expectedAge: string }> = [];

    for (const child of children) {
      const childAgeMonths = differenceInMonths(now, new Date(child.birth_date));

      for (const vaccine of VACCINATION_SCHEDULE) {
        for (const dose of vaccine.doses) {
          // Check vaccines due within next 2 months that are not done
          if (dose.ageMonths >= childAgeMonths && dose.ageMonths <= childAgeMonths + 2) {
            const isDone = doneVaccines.find(
              (v) => v.member_id === child.id && v.vaccine_code === vaccine.code && v.dose_number === dose.doseNumber
            );
            if (!isDone) {
              const subject = `Vaccin ${vaccine.name} (dose ${dose.doseNumber}) — ${child.first_name}`;
              if (!recentSubjects.has(subject)) {
                reminders.push({
                  childName: child.first_name,
                  vaccineName: vaccine.name,
                  doseNumber: dose.doseNumber,
                  expectedAge: dose.label,
                });
              }
            }
          }
        }
      }
    }

    if (reminders.length === 0) continue;

    // Build email
    const reminderListHtml = reminders
      .map(
        (r) =>
          `<li style="margin-bottom: 8px;"><strong>${r.vaccineName}</strong> (dose ${r.doseNumber}) pour ${r.childName} — prevu a ${r.expectedAge}</li>`
      )
      .join("");

    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #E8734A; font-size: 24px; margin: 0;">Darons</h1>
          <p style="color: #666; font-size: 14px; margin: 4px 0 0;">Rappel vaccins</p>
        </div>
        <h2 style="color: #333; font-size: 18px;">Vaccins a prevoir</h2>
        <p style="color: #555; font-size: 14px;">Hey ! Voici les vaccins a planifier prochainement :</p>
        <ul style="color: #555; font-size: 14px; line-height: 1.6;">
          ${reminderListHtml}
        </ul>
        <p style="color: #555; font-size: 14px;">Pense a prendre RDV chez le pediatre.</p>
        <div style="text-align: center; margin-top: 24px;">
          <a href="https://darons.app/sante" style="display: inline-block; background: #E8734A; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">Voir dans Darons</a>
        </div>
        <p style="color: #999; font-size: 12px; text-align: center; margin-top: 32px;">
          Tu recois cet email car tu utilises Darons. Gere tes preferences dans Parametres.
        </p>
      </div>
    `;

    const subject = reminders.length === 1
      ? `Vaccin a prevoir : ${reminders[0].vaccineName} pour ${reminders[0].childName}`
      : `${reminders.length} vaccins a prevoir pour ta famille`;

    const emailResult = await sendEmail(ownerEmail, subject, html);

    if (emailResult.success) {
      // Log notification
      await sendInAppNotification(householdId, "vaccine_reminder", subject, {
        reminderCount: reminders.length,
      });
      totalReminders += reminders.length;
    }
  }

  return NextResponse.json({ processed: totalReminders });
}

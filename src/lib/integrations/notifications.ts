import { Resend } from "resend";
import { createClient } from "@/lib/supabase/server";
import { PLAN_LIMITS, type PlanName } from "@/lib/constants";

// ── Email via Resend ──

let resendClient: Resend | null = null;

function getResend(): Resend {
  if (!resendClient) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error("RESEND_API_KEY non configurée");
    }
    resendClient = new Resend(apiKey);
  }
  return resendClient;
}

export async function sendEmail(
  to: string,
  subject: string,
  html: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const resend = getResend();
    await resend.emails.send({
      from: "Cockpit Parental <noreply@cockpitparental.fr>",
      to,
      subject,
      html,
    });
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur envoi email";
    return { success: false, error: message };
  }
}

// ── SMS via Twilio (placeholder — activated when env vars present) ──

export async function sendSms(
  to: string,
  message: string
): Promise<{ success: boolean; error?: string }> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_PHONE_NUMBER;

  if (!accountSid || !authToken || !fromNumber) {
    return { success: false, error: "Configuration Twilio manquante" };
  }

  try {
    const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: "Basic " + Buffer.from(`${accountSid}:${authToken}`).toString("base64"),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        To: to,
        From: fromNumber,
        Body: message,
      }),
    });

    if (!response.ok) {
      return { success: false, error: `Twilio error: ${response.status}` };
    }

    return { success: true };
  } catch (err) {
    const errMessage = err instanceof Error ? err.message : "Erreur envoi SMS";
    return { success: false, error: errMessage };
  }
}

// ── In-app notification (via notification_log table) ──

export async function sendInAppNotification(
  householdId: string,
  notificationType: string,
  subject: string,
  metadata?: Record<string, unknown>
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();

  const { error } = await supabase.from("notification_log").insert({
    household_id: householdId,
    channel: "in_app",
    notification_type: notificationType,
    subject,
    delivered: true,
    metadata: metadata ?? {},
  });

  if (error) {
    return { success: false, error: "Erreur enregistrement notification" };
  }

  return { success: true };
}

// ── Dispatch: send via all allowed channels for the user's plan ──

interface NotificationPayload {
  type: string;
  subject: string;
  htmlBody: string;
  smsBody?: string;
  metadata?: Record<string, unknown>;
}

export async function dispatchNotification(
  householdId: string,
  userEmail: string,
  plan: PlanName,
  payload: NotificationPayload
): Promise<{ channels: string[]; errors: string[] }> {
  const allowedChannels = PLAN_LIMITS[plan].alertChannels;
  const channels: string[] = [];
  const errors: string[] = [];

  // Always send in-app
  const inAppResult = await sendInAppNotification(
    householdId,
    payload.type,
    payload.subject,
    payload.metadata
  );
  if (inAppResult.success) channels.push("in_app");
  else if (inAppResult.error) errors.push(inAppResult.error);

  // Email
  if (allowedChannels.includes("email")) {
    const emailResult = await sendEmail(userEmail, payload.subject, payload.htmlBody);
    if (emailResult.success) channels.push("email");
    else if (emailResult.error) errors.push(emailResult.error);

    // Log email
    const supabase = createClient();
    await supabase.from("notification_log").insert({
      household_id: householdId,
      channel: "email",
      notification_type: payload.type,
      subject: payload.subject,
      delivered: emailResult.success,
      metadata: payload.metadata ?? {},
    });
  }

  // SMS (only for sms-enabled plans and critical notifications)
  if (
    allowedChannels.includes("sms" as never) &&
    payload.smsBody
  ) {
    // SMS requires a phone number — would need to be stored in profile
    // Placeholder for now
    channels.push("sms_skipped");
  }

  return { channels, errors };
}

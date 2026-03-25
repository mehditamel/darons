import { NextResponse } from "next/server";

interface ServiceStatus {
  status: "ok" | "error" | "not_configured";
  message?: string;
}

interface HealthReport {
  status: "healthy" | "degraded" | "unhealthy";
  timestamp: string;
  services: Record<string, ServiceStatus>;
}

async function checkSupabase(): Promise<ServiceStatus> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return { status: "not_configured", message: "NEXT_PUBLIC_SUPABASE_URL ou ANON_KEY manquant" };
  }

  try {
    const response = await fetch(`${url}/rest/v1/`, {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
      },
      signal: AbortSignal.timeout(5000),
    });
    if (response.ok || response.status === 200) {
      return { status: "ok" };
    }
    return { status: "error", message: `HTTP ${response.status}` };
  } catch (err) {
    return { status: "error", message: err instanceof Error ? err.message : "Connection failed" };
  }
}

function checkAnthropic(): ServiceStatus {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return { status: "not_configured" };
  if (key.startsWith("sk-ant-")) return { status: "ok" };
  return { status: "error", message: "Invalid key format" };
}

function checkStripe(): ServiceStatus {
  const key = process.env.STRIPE_SECRET_KEY;
  const webhook = process.env.STRIPE_WEBHOOK_SECRET;
  const premiumId = process.env.STRIPE_PREMIUM_PRICE_ID;

  if (!key) return { status: "not_configured" };

  const issues: string[] = [];
  if (!webhook) issues.push("STRIPE_WEBHOOK_SECRET manquant");
  if (!premiumId) issues.push("STRIPE_PREMIUM_PRICE_ID manquant");

  if (issues.length > 0) {
    return { status: "ok", message: `Partiel: ${issues.join(", ")}` };
  }
  return { status: "ok" };
}

function checkResend(): ServiceStatus {
  const key = process.env.RESEND_API_KEY;
  if (!key) return { status: "not_configured" };
  if (key.startsWith("re_")) return { status: "ok" };
  return { status: "error", message: "Invalid key format" };
}

function checkBridge(): ServiceStatus {
  const clientId = process.env.BRIDGE_CLIENT_ID;
  const clientSecret = process.env.BRIDGE_CLIENT_SECRET;
  if (!clientId || !clientSecret) return { status: "not_configured" };
  return { status: "ok" };
}

function checkTwilio(): ServiceStatus {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const phone = process.env.TWILIO_PHONE_NUMBER;
  if (!sid || !token || !phone) return { status: "not_configured" };
  return { status: "ok" };
}

function checkGoogleCalendar(): ServiceStatus {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) return { status: "not_configured" };
  return { status: "ok" };
}

function checkVapid(): ServiceStatus {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  if (!publicKey || !privateKey) return { status: "not_configured" };
  return { status: "ok" };
}

function checkSentry(): ServiceStatus {
  const dsn = process.env.SENTRY_DSN;
  if (!dsn) return { status: "not_configured" };
  return { status: "ok" };
}

function checkUpstash(): ServiceStatus {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return { status: "not_configured" };
  return { status: "ok" };
}

export async function GET() {
  const services: Record<string, ServiceStatus> = {
    supabase: await checkSupabase(),
    anthropic: checkAnthropic(),
    stripe: checkStripe(),
    resend: checkResend(),
    bridge_api: checkBridge(),
    twilio: checkTwilio(),
    google_calendar: checkGoogleCalendar(),
    web_push: checkVapid(),
    sentry: checkSentry(),
    upstash_redis: checkUpstash(),
  };

  // Critical services that must be OK for the app to work
  const criticalServices = ["supabase"];
  const importantServices = ["anthropic", "resend"];

  const criticalOk = criticalServices.every(
    (s) => services[s]?.status === "ok"
  );
  const importantOk = importantServices.every(
    (s) => services[s]?.status === "ok"
  );

  let overallStatus: HealthReport["status"];
  if (!criticalOk) {
    overallStatus = "unhealthy";
  } else if (!importantOk) {
    overallStatus = "degraded";
  } else {
    overallStatus = "healthy";
  }

  const report: HealthReport = {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    services,
  };

  const httpStatus = overallStatus === "unhealthy" ? 503 : 200;

  return NextResponse.json(report, { status: httpStatus });
}

"use server";
import { type ActionResult, getAuthenticatedUser, type SupabaseClient } from "@/lib/actions/safe-action";

import { revalidatePath } from "next/cache";
import type { AdminMetricsDaily } from "@/types/sharing";
import type { AdminUser } from "@/components/admin/user-management-table";
import type { RevenueData } from "@/components/admin/revenue-charts";
import type { CohortData } from "@/components/admin/cohort-heatmap";
import type { SystemHealthData } from "@/components/admin/system-status";


async function isAdmin(
  supabase: SupabaseClient,
  userId: string
): Promise<boolean> {
  const { data } = await supabase
    .from("profiles")
    .select("email")
    .eq("id", userId)
    .single();
  // Admin is identified by email (simple approach for MVP)
  return data?.email === "mehdi@tamel.fr";
}

export async function getAdminMetrics(
  days: number = 30
): Promise<ActionResult<AdminMetricsDaily[]>> {
  const { user, supabase } = await getAuthenticatedUser();
  if (!user) return { success: false, error: "Non authentifié" };

  if (!(await isAdmin(supabase, user.id)))
    return { success: false, error: "Accès refusé" };

  const sinceDate = new Date();
  sinceDate.setDate(sinceDate.getDate() - days);

  const { data, error } = await supabase
    .from("admin_metrics_daily")
    .select("*")
    .gte("metric_date", sinceDate.toISOString().split("T")[0])
    .order("metric_date", { ascending: true });

  if (error)
    return { success: false, error: "Erreur lors de la récupération" };

  return {
    success: true,
    data: (data ?? []).map((row) => ({
      id: row.id,
      metricDate: row.metric_date,
      totalUsers: row.total_users,
      newUsers: row.new_users,
      activeUsers: row.active_users,
      freeUsers: row.free_users,
      premiumUsers: row.premium_users,
      familyProUsers: row.family_pro_users,
      mrrCents: row.mrr_cents,
      churnCount: row.churn_count,
      createdAt: row.created_at,
    })),
  };
}

export async function computeDailyMetrics(): Promise<ActionResult> {
  const { user, supabase } = await getAuthenticatedUser();
  if (!user) return { success: false, error: "Non authentifié" };

  if (!(await isAdmin(supabase, user.id)))
    return { success: false, error: "Accès refusé" };

  const today = new Date().toISOString().split("T")[0];

  // Count users by plan
  const { count: totalUsers } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true });

  const { count: freeUsers } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("subscription_plan", "free");

  const { count: premiumUsers } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("subscription_plan", "premium");

  const { count: familyProUsers } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("subscription_plan", "family_pro");

  // New users today
  const todayStart = `${today}T00:00:00Z`;
  const todayEnd = `${today}T23:59:59Z`;

  const { count: newUsers } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .gte("created_at", todayStart)
    .lte("created_at", todayEnd);

  // MRR calculation
  const premiumCount = premiumUsers ?? 0;
  const proCount = familyProUsers ?? 0;
  const mrrCents = premiumCount * 990 + proCount * 1990;

  const { error } = await supabase.from("admin_metrics_daily").upsert(
    {
      metric_date: today,
      total_users: totalUsers ?? 0,
      new_users: newUsers ?? 0,
      active_users: 0, // Would need session tracking
      free_users: freeUsers ?? 0,
      premium_users: premiumCount,
      family_pro_users: proCount,
      mrr_cents: mrrCents,
      churn_count: 0, // Would need Stripe webhook data
    },
    { onConflict: "metric_date" }
  );

  if (error) return { success: false, error: "Erreur lors du calcul" };

  return { success: true };
}

export async function getAdminEngagementMetrics(): Promise<
  ActionResult<{
    dau: number;
    mau: number;
    dauMauRatio: number;
    activationRate: number;
  }>
> {
  const { user, supabase } = await getAuthenticatedUser();
  if (!user) return { success: false, error: "Non authentifié" };
  if (!(await isAdmin(supabase, user.id)))
    return { success: false, error: "Accès refusé" };

  const today = new Date().toISOString().split("T")[0];
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // DAU — distinct users active today
  const { count: dau } = await supabase
    .from("user_sessions")
    .select("*", { count: "exact", head: true })
    .eq("session_date", today);

  // MAU — distinct users active in last 30 days
  const { count: mau } = await supabase
    .from("user_sessions")
    .select("user_id", { count: "exact", head: true })
    .gte("session_date", thirtyDaysAgo.toISOString().split("T")[0]);

  // Activation rate — users who completed onboarding (have at least 1 family member)
  const { count: totalUsers } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true });

  const { count: activatedUsers } = await supabase
    .from("households")
    .select("*", { count: "exact", head: true });

  const total = totalUsers ?? 0;
  const dauVal = dau ?? 0;
  const mauVal = mau ?? 0;
  const activated = activatedUsers ?? 0;

  return {
    success: true,
    data: {
      dau: dauVal,
      mau: mauVal,
      dauMauRatio: mauVal > 0 ? Math.round((dauVal / mauVal) * 100) : 0,
      activationRate: total > 0 ? Math.round((activated / total) * 100) : 0,
    },
  };
}

export async function getAdminDashboardSummary(): Promise<
  ActionResult<{
    totalUsers: number;
    premiumUsers: number;
    familyProUsers: number;
    mrr: number;
    conversionRate: number;
    referralCount: number;
  }>
> {
  const { user, supabase } = await getAuthenticatedUser();
  if (!user) return { success: false, error: "Non authentifié" };

  if (!(await isAdmin(supabase, user.id)))
    return { success: false, error: "Accès refusé" };

  const { count: totalUsers } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true });

  const { count: premiumUsers } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("subscription_plan", "premium");

  const { count: familyProUsers } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("subscription_plan", "family_pro");

  const { count: referralCount } = await supabase
    .from("referrals")
    .select("*", { count: "exact", head: true });

  const total = totalUsers ?? 0;
  const premium = premiumUsers ?? 0;
  const pro = familyProUsers ?? 0;
  const mrr = premium * 9.9 + pro * 19.9;
  const conversionRate = total > 0 ? ((premium + pro) / total) * 100 : 0;

  return {
    success: true,
    data: {
      totalUsers: total,
      premiumUsers: premium,
      familyProUsers: pro,
      mrr: Math.round(mrr * 100) / 100,
      conversionRate: Math.round(conversionRate * 10) / 10,
      referralCount: referralCount ?? 0,
    },
  };
}

// ── User Management ──

export async function getAdminUserList(): Promise<ActionResult<AdminUser[]>> {
  const { user, supabase } = await getAuthenticatedUser();
  if (!user) return { success: false, error: "Non authentifié" };
  if (!(await isAdmin(supabase, user.id)))
    return { success: false, error: "Accès refusé" };

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, email, first_name, last_name, subscription_plan, created_at")
    .order("created_at", { ascending: false })
    .limit(500);

  if (!profiles) return { success: true, data: [] };

  const { data: households } = await supabase
    .from("households")
    .select("id, name, owner_id");

  const { data: members } = await supabase
    .from("family_members")
    .select("household_id");

  const householdMap = new Map(
    (households ?? []).map((h) => [h.owner_id, h])
  );
  const memberCounts = new Map<string, number>();
  for (const m of members ?? []) {
    memberCounts.set(m.household_id, (memberCounts.get(m.household_id) ?? 0) + 1);
  }

  const users: AdminUser[] = profiles.map((p) => {
    const household = householdMap.get(p.id);
    return {
      id: p.id,
      email: p.email,
      firstName: p.first_name,
      lastName: p.last_name,
      plan: p.subscription_plan ?? "free",
      createdAt: p.created_at,
      householdName: household?.name ?? null,
      memberCount: household ? (memberCounts.get(household.id) ?? 0) : 0,
    };
  });

  return { success: true, data: users };
}

export async function updateUserPlan(
  userId: string,
  plan: string
): Promise<ActionResult> {
  const { user, supabase } = await getAuthenticatedUser();
  if (!user) return { success: false, error: "Non authentifié" };
  if (!(await isAdmin(supabase, user.id)))
    return { success: false, error: "Accès refusé" };

  const validPlans = ["free", "premium", "family_pro"];
  if (!validPlans.includes(plan))
    return { success: false, error: "Plan invalide" };

  const { error } = await supabase
    .from("profiles")
    .update({ subscription_plan: plan })
    .eq("id", userId);

  if (error) return { success: false, error: "Erreur lors de la mise à jour" };

  revalidatePath("/admin/users");
  return { success: true };
}

// ── Revenue Metrics ──

export async function getRevenueMetrics(): Promise<ActionResult<RevenueData>> {
  const { user, supabase } = await getAuthenticatedUser();
  if (!user) return { success: false, error: "Non authentifié" };
  if (!(await isAdmin(supabase, user.id)))
    return { success: false, error: "Accès refusé" };

  const { count: freeUsers } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("subscription_plan", "free");

  const { count: premiumUsers } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("subscription_plan", "premium");

  const { count: familyProUsers } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("subscription_plan", "family_pro");

  const premium = premiumUsers ?? 0;
  const pro = familyProUsers ?? 0;
  const totalPaying = premium + pro;
  const mrr = premium * 9.9 + pro * 19.9;
  const arr = mrr * 12;
  const arpu = totalPaying > 0 ? mrr / totalPaying : 0;

  // MRR history from admin_metrics_daily
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { data: metrics } = await supabase
    .from("admin_metrics_daily")
    .select("metric_date, mrr_cents, premium_users, family_pro_users")
    .gte("metric_date", thirtyDaysAgo.toISOString().split("T")[0])
    .order("metric_date", { ascending: true });

  const mrrHistory = (metrics ?? []).map((m) => ({
    date: m.metric_date,
    mrr: Math.round((m.mrr_cents ?? 0) / 100),
    users: (m.premium_users ?? 0) + (m.family_pro_users ?? 0),
  }));

  return {
    success: true,
    data: {
      mrr: Math.round(mrr * 100) / 100,
      arr: Math.round(arr * 100) / 100,
      arpu: Math.round(arpu * 100) / 100,
      totalPaying,
      freeUsers: freeUsers ?? 0,
      premiumUsers: premium,
      familyProUsers: pro,
      mrrHistory,
    },
  };
}

// ── Cohort Analysis ──

export async function getCohortAnalysis(): Promise<ActionResult<CohortData[]>> {
  const { user, supabase } = await getAuthenticatedUser();
  if (!user) return { success: false, error: "Non authentifié" };
  if (!(await isAdmin(supabase, user.id)))
    return { success: false, error: "Accès refusé" };

  // Get users grouped by signup week
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, created_at")
    .order("created_at", { ascending: true });

  if (!profiles || profiles.length === 0) return { success: true, data: [] };

  const { data: sessions } = await supabase
    .from("user_sessions")
    .select("user_id, session_date");

  const sessionMap = new Map<string, Set<string>>();
  for (const s of sessions ?? []) {
    if (!sessionMap.has(s.user_id)) sessionMap.set(s.user_id, new Set());
    sessionMap.get(s.user_id)!.add(s.session_date);
  }

  // Group by week
  const weeks = new Map<string, Array<{ id: string; createdAt: Date }>>();
  for (const p of profiles) {
    const d = new Date(p.created_at);
    const weekStart = new Date(d);
    weekStart.setDate(d.getDate() - d.getDay());
    const key = weekStart.toISOString().split("T")[0];
    if (!weeks.has(key)) weeks.set(key, []);
    weeks.get(key)!.push({ id: p.id, createdAt: d });
  }

  const cohorts: CohortData[] = [];
  const now = new Date();
  const weekKeys = Array.from(weeks.keys());

  for (const weekKey of weekKeys) {
    const users = weeks.get(weekKey)!;
    const totalUsers = users.length;
    let retJ1 = 0, retJ7 = 0, retJ30 = 0, retJ90 = 0;

    for (const u of users) {
      const dates = sessionMap.get(u.id);
      if (!dates) continue;

      const signup = u.createdAt;
      const dateArray = Array.from(dates);
      for (const dateStr of dateArray) {
        const sessionDate = new Date(dateStr);
        const daysDiff = Math.floor((sessionDate.getTime() - signup.getTime()) / 86400000);
        if (daysDiff >= 1) retJ1++;
        if (daysDiff >= 7) retJ7++;
        if (daysDiff >= 30) retJ30++;
        if (daysDiff >= 90) retJ90++;
      }
    }

    const daysSinceWeek = Math.floor((now.getTime() - new Date(weekKey).getTime()) / 86400000);

    cohorts.push({
      cohortDate: weekKey,
      totalUsers,
      retentionJ1: totalUsers > 0 ? Math.round((retJ1 / totalUsers) * 100) : 0,
      retentionJ7: daysSinceWeek >= 7 && totalUsers > 0 ? Math.round((retJ7 / totalUsers) * 100) : 0,
      retentionJ30: daysSinceWeek >= 30 && totalUsers > 0 ? Math.round((retJ30 / totalUsers) * 100) : 0,
      retentionJ90: daysSinceWeek >= 90 && totalUsers > 0 ? Math.round((retJ90 / totalUsers) * 100) : 0,
    });
  }

  return { success: true, data: cohorts.slice(-12) };
}

// ── System Health ──

export async function getSystemHealth(): Promise<ActionResult<SystemHealthData>> {
  const { user, supabase } = await getAuthenticatedUser();
  if (!user) return { success: false, error: "Non authentifié" };
  if (!(await isAdmin(supabase, user.id)))
    return { success: false, error: "Accès refusé" };

  const now = new Date().toISOString();
  const services = [];

  // Check Supabase
  const supabaseStart = Date.now();
  try {
    await supabase.from("profiles").select("id", { count: "exact", head: true });
    services.push({
      name: "Supabase (base de données)",
      status: "healthy" as const,
      latencyMs: Date.now() - supabaseStart,
      lastChecked: now,
    });
  } catch {
    services.push({
      name: "Supabase (base de données)",
      status: "down" as const,
      latencyMs: null,
      lastChecked: now,
    });
  }

  // Check external APIs (non-blocking)
  const apiChecks = [
    { name: "Bridge API (Open Banking)", url: process.env.BRIDGE_API_URL },
    { name: "Resend (email)", url: "https://api.resend.com" },
    { name: "API Géo (gouv.fr)", url: "https://geo.api.gouv.fr/communes?limit=1" },
  ];

  for (const check of apiChecks) {
    if (!check.url) {
      services.push({
        name: check.name,
        status: "unknown" as const,
        latencyMs: null,
        lastChecked: now,
      });
      continue;
    }

    const start = Date.now();
    try {
      const res = await fetch(check.url, {
        method: "HEAD",
        signal: AbortSignal.timeout(5000),
      });
      services.push({
        name: check.name,
        status: res.ok ? ("healthy" as const) : ("degraded" as const),
        latencyMs: Date.now() - start,
        lastChecked: now,
      });
    } catch {
      services.push({
        name: check.name,
        status: "down" as const,
        latencyMs: Date.now() - start,
        lastChecked: now,
      });
    }
  }

  // Anthropic check
  services.push({
    name: "Anthropic (IA Claude)",
    status: process.env.ANTHROPIC_API_KEY ? ("healthy" as const) : ("unknown" as const),
    latencyMs: null,
    lastChecked: now,
  });

  return {
    success: true,
    data: {
      services,
      lastErrors: [],
    },
  };
}

"use server";

import { createClient } from "@/lib/supabase/server";
import type { AdminMetricsDaily } from "@/types/sharing";

type ActionResult<T = void> = {
  success: boolean;
  data?: T;
  error?: string;
};

async function getAuthenticatedUser() {
  const supabase = createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) return { user: null, supabase };
  return { user, supabase };
}

async function isAdmin(
  supabase: ReturnType<typeof createClient>,
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

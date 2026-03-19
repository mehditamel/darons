import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { BottomNavigation } from "@/components/layout/bottom-navigation";
import { ServiceWorkerRegister } from "@/components/pwa/service-worker-register";
import { InstallPrompt } from "@/components/pwa/install-prompt";
import { OfflineBanner } from "@/components/pwa/offline-fallback";
import { SessionTracker } from "@/components/analytics/session-tracker";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let userEmail = "";
  let userInitials = "?";
  let alertCount = 0;

  if (user) {
    userEmail = user.email ?? "";

    const { data: profile } = await supabase
      .from("profiles")
      .select("first_name, last_name")
      .eq("id", user.id)
      .single();

    if (profile) {
      const first = profile.first_name?.[0] ?? "";
      const last = profile.last_name?.[0] ?? "";
      userInitials = (first + last).toUpperCase() || "?";
    }

    const { data: household } = await supabase
      .from("households")
      .select("id")
      .eq("owner_id", user.id)
      .single();

    if (household) {
      const { count } = await supabase
        .from("proactive_alerts")
        .select("id", { count: "exact", head: true })
        .eq("household_id", household.id)
        .eq("dismissed", false);

      alertCount = count ?? 0;
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <ServiceWorkerRegister />
      <SessionTracker />
      <Sidebar />
      <div className="lg:pl-64">
        <Topbar
          userEmail={userEmail}
          userInitials={userInitials}
          alertCount={alertCount}
        />
        <main className="p-4 pb-20 lg:p-6 lg:pb-6">
          <OfflineBanner />
          <InstallPrompt />
          {children}
        </main>
      </div>
      <BottomNavigation />
    </div>
  );
}

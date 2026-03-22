import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { BottomNavigation } from "@/components/layout/bottom-navigation";
import { CommandPalette } from "@/components/layout/command-palette";
import { ServiceWorkerRegister } from "@/components/pwa/service-worker-register";
import { InstallPrompt } from "@/components/pwa/install-prompt";
import { OfflineBanner } from "@/components/pwa/offline-fallback";
import { SessionTracker } from "@/components/analytics/session-tracker";
import { CookieBanner } from "@/components/shared/cookie-banner";
import { ScrollToTop } from "@/components/shared/scroll-to-top";
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
  const sidebarBadges: Record<string, number> = {};

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
      // Fetch family member IDs first to avoid nested await inside Promise.all
      const { data: members } = await supabase
        .from("family_members")
        .select("id")
        .eq("household_id", household.id);
      const memberIds = members?.map((m: { id: string }) => m.id) ?? [];

      const [alertsRes, expiringRes] = await Promise.all([
        supabase
          .from("proactive_alerts")
          .select("id, category", { count: "exact" })
          .eq("household_id", household.id)
          .eq("dismissed", false),
        memberIds.length > 0
          ? supabase
              .from("identity_documents")
              .select("id", { count: "exact", head: true })
              .in("member_id", memberIds)
              .or("status.eq.expired,status.eq.expiring_soon")
          : Promise.resolve({ count: 0, data: null }),
      ]);

      alertCount = alertsRes.count ?? 0;

      // Count alerts by category for sidebar badges
      const alerts = alertsRes.data ?? [];
      for (const alert of alerts) {
        const cat = alert.category as string;
        if (cat === "sante") sidebarBadges["/sante"] = (sidebarBadges["/sante"] ?? 0) + 1;
        else if (cat === "fiscal") sidebarBadges["/fiscal"] = (sidebarBadges["/fiscal"] ?? 0) + 1;
        else if (cat === "identite") sidebarBadges["/identite"] = (sidebarBadges["/identite"] ?? 0) + 1;
        else if (cat === "caf" || cat === "scolarite") sidebarBadges["/demarches"] = (sidebarBadges["/demarches"] ?? 0) + 1;
      }

      // Add expiring docs badge
      const expiringCount = expiringRes.count ?? 0;
      if (expiringCount > 0) {
        sidebarBadges["/identite"] = (sidebarBadges["/identite"] ?? 0) + expiringCount;
      }
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <ServiceWorkerRegister />
      <SessionTracker />
      {/* Skip to content link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground focus:shadow-lg"
      >
        Aller au contenu principal
      </a>
      <Sidebar badges={sidebarBadges} userInitials={userInitials} userEmail={userEmail} />
      <div className="lg:pl-64">
        <Topbar
          userEmail={userEmail}
          userInitials={userInitials}
          alertCount={alertCount}
        />
        <main id="main-content" className="p-4 pb-20 lg:p-6 lg:pb-6" role="main">
          <OfflineBanner />
          <InstallPrompt />
          {children}
        </main>
      </div>
      <BottomNavigation />
      <CommandPalette />
      <CookieBanner />
      <ScrollToTop />
    </div>
  );
}

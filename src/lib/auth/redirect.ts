const DESTINATIONS = [
  "/dashboard", "/onboarding", "/identite", "/sante", "/documents", "/scolarite",
  "/activites", "/developpement", "/fiscal", "/budget", "/garde", "/demarches",
  "/parametres", "/partage", "/depenses-partagees", "/parrainage", "/admin",
  "/confiance", "/capsule", "/alertes", "/sante-enrichie", "/update-password",
];

export function safeAuthRedirect(value?: unknown): string {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//") || /[\\\u0000-\u001f]/.test(value)) return "/dashboard";
  const url = new URL(value, "https://darons.app");
  if (url.origin !== "https://darons.app" || !DESTINATIONS.some((path) => url.pathname === path || url.pathname.startsWith(`${path}/`))) {
    return "/dashboard";
  }
  return `${url.pathname}${url.search}${url.hash}`;
}

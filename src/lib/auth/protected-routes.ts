const PROTECTED_PREFIXES = [
  "/dashboard", "/identite", "/sante", "/documents", "/scolarite",
  "/activites", "/developpement", "/fiscal", "/budget", "/garde",
  "/demarches", "/sante-enrichie", "/parametres", "/partage",
  "/depenses-partagees", "/parrainage", "/admin", "/onboarding",
  "/confiance", "/capsule", "/alertes",
];

export function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PREFIXES.some((prefix) =>
    pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  HeartPulse,
  IdCard,
  FolderLock,
  GraduationCap,
  Calculator,
  Wallet,
  Baby,
  ClipboardList,
  Stethoscope,
  Settings,
  Search,
  FileText,
  Palette,
  TrendingUp,
} from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";

interface CommandItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  keywords?: string[];
}

const NAVIGATION_ITEMS: CommandItem[] = [
  { label: "Tableau de bord", href: "/dashboard", icon: LayoutDashboard, keywords: ["accueil", "home"] },
  { label: "Identité & documents", href: "/identite", icon: IdCard, keywords: ["cni", "passeport", "papiers"] },
  { label: "Santé & vaccinations", href: "/sante", icon: HeartPulse, keywords: ["vaccin", "pédiatre", "croissance"] },
  { label: "Coffre-fort numérique", href: "/documents", icon: FolderLock, keywords: ["upload", "fichier", "scan"] },
  { label: "Scolarité", href: "/scolarite", icon: GraduationCap, keywords: ["école", "inscription", "notes"] },
  { label: "Activités", href: "/activites", icon: Palette, keywords: ["sport", "loisirs", "musique"] },
  { label: "Développement", href: "/developpement", icon: TrendingUp, keywords: ["jalons", "motricité", "langage"] },
  { label: "Foyer fiscal", href: "/fiscal", icon: Calculator, keywords: ["impôts", "ir", "tmi", "simulation"] },
  { label: "Budget familial", href: "/budget", icon: Wallet, keywords: ["dépenses", "allocations", "caf"] },
  { label: "Recherche de garde", href: "/garde", icon: Baby, keywords: ["crèche", "nounou", "assistante maternelle"] },
  { label: "Santé enrichie", href: "/sante-enrichie", icon: Stethoscope, keywords: ["examens", "allergies", "ordonnances"] },
  { label: "Démarches & droits", href: "/demarches", icon: ClipboardList, keywords: ["administratif", "courrier", "caf"] },
  { label: "Paramètres", href: "/parametres", icon: Settings, keywords: ["compte", "profil", "abonnement"] },
];

const ACTION_ITEMS: CommandItem[] = [
  { label: "Enregistrer un vaccin", href: "/sante", icon: HeartPulse, keywords: ["ajouter vaccin"] },
  { label: "Importer un document", href: "/documents", icon: FileText, keywords: ["upload scan"] },
  { label: "Lancer la simulation IR", href: "/fiscal", icon: Calculator, keywords: ["simuler impôts"] },
  { label: "Ajouter une dépense", href: "/budget", icon: Wallet, keywords: ["dépense budget"] },
  { label: "Rechercher une crèche", href: "/garde", icon: Search, keywords: ["chercher garde"] },
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      // "?" opens palette when no input/textarea is focused
      if (
        e.key === "?" &&
        !open &&
        !(e.target instanceof HTMLInputElement) &&
        !(e.target instanceof HTMLTextAreaElement) &&
        !((e.target as HTMLElement).isContentEditable)
      ) {
        e.preventDefault();
        setOpen(true);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const handleSelect = useCallback(
    (href: string) => {
      setOpen(false);
      router.push(href);
    },
    [router]
  );

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Rechercher une page ou une action..." />
      <CommandList>
        <CommandEmpty>Aucun résultat.</CommandEmpty>
        <CommandGroup heading="Navigation">
          {NAVIGATION_ITEMS.map((item) => (
            <CommandItem
              key={item.href}
              value={`${item.label} ${item.keywords?.join(" ") ?? ""}`}
              onSelect={() => handleSelect(item.href)}
            >
              <item.icon className="mr-2 h-4 w-4" />
              {item.label}
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Actions rapides">
          {ACTION_ITEMS.map((item) => (
            <CommandItem
              key={`action-${item.href}`}
              value={`${item.label} ${item.keywords?.join(" ") ?? ""}`}
              onSelect={() => handleSelect(item.href)}
            >
              <item.icon className="mr-2 h-4 w-4" />
              {item.label}
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Raccourcis clavier">
          <CommandItem value="raccourci recherche cmd k" disabled>
            <kbd className="mr-2 rounded border bg-muted px-1.5 py-0.5 text-xs font-mono">
              ⌘K
            </kbd>
            Recherche rapide
          </CommandItem>
          <CommandItem value="raccourci aide interrogation" disabled>
            <kbd className="mr-2 rounded border bg-muted px-1.5 py-0.5 text-xs font-mono">
              ?
            </kbd>
            Ouvrir cette aide
          </CommandItem>
          <CommandItem value="raccourci fermer echap escape" disabled>
            <kbd className="mr-2 rounded border bg-muted px-1.5 py-0.5 text-xs font-mono">
              Esc
            </kbd>
            Fermer
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}

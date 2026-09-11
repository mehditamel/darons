"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Calculator, Baby, Syringe, Wallet, Scale, PiggyBank, Home,
  Phone, Monitor, Stethoscope, ClipboardCheck, TrendingUp,
  CalendarRange, Ruler, Search,
  type LucideIcon,
} from "lucide-react";
import { SECTIONS, TOTAL_TOOLS, type ToolCard } from "@/lib/tools-catalog";
import { filterTools } from "@/lib/tool-search";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const ICON_MAP: Record<string, LucideIcon> = {
  Calculator, Baby, Syringe, Wallet, Scale, PiggyBank, Home,
  Phone, Monitor, Stethoscope, ClipboardCheck, TrendingUp,
  CalendarRange, Ruler,
};

export function ToolsGrid() {
  const [query, setQuery] = useState("");

  const [category, setCategory] = useState("Tous");
  const filteredTools = filterTools(query, category);
  const filtering = query.trim() !== "" || category !== "Tous";

  function resetFilters() {
    setQuery("");
    setCategory("Tous");
  }

  return (
    <>
      <div className="space-y-4">
        <div className="relative max-w-md mx-auto">
          <Search aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <label htmlFor="tool-search" className="sr-only">Rechercher un outil</label>
          <Input id="tool-search" type="search" placeholder="Impôts, garde, santé…"
            value={query} onChange={(e) => setQuery(e.target.value)} className="pl-10"
            aria-controls="tool-results" />
        </div>
        <div className="flex flex-wrap justify-center gap-2" role="group" aria-label="Catégories d'outils">
          {["Tous", ...SECTIONS.map((section) => section.title)].map((label) => (
            <Button key={label} type="button" variant={category === label ? "default" : "outline"}
              size="sm" aria-pressed={category === label} onClick={() => setCategory(label)}>
              {label}
            </Button>
          ))}
        </div>
        <p role="status" className="text-sm text-muted-foreground text-center">
          {filtering ? `${filteredTools.length} résultat${filteredTools.length > 1 ? "s" : ""} sur ${TOTAL_TOOLS} outils` : `${TOTAL_TOOLS} outils à découvrir`}
        </p>
      </div>
      <div id="tool-results" className="space-y-10">
      {filtering ? (
        <div className="space-y-6">
          {filteredTools.length === 0 && (
            <div className="rounded-2xl border border-dashed p-8 text-center space-y-3">
              <h2 className="text-lg font-semibold">Aucun outil trouvé</h2>
              <p className="text-sm text-muted-foreground">Essaie un terme plus simple, comme « garde » ou « budget », ou affiche tous les outils.</p>
              <Button type="button" variant="outline" onClick={resetFilters}>Afficher tous les outils</Button>
            </div>
          )}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredTools.map((tool) => (
              <ToolCardComponent key={tool.href} tool={tool} />
            ))}
          </div>
        </div>
      ) : (
        SECTIONS.map((section) => (
          <div key={section.title} className="space-y-6">
            <h2 className="text-xl font-serif font-bold border-b pb-2">
              {section.title}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {section.tools.map((tool) => (
                <ToolCardComponent key={tool.href} tool={tool} />
              ))}
            </div>
          </div>
        ))
      )}
      </div>
    </>
  );
}

function ToolCardComponent({ tool }: { tool: ToolCard }) {
  const Icon = ICON_MAP[tool.iconName] ?? Calculator;

  return (
    <Link href={tool.href} className="rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4">
      <Card className="h-full card-playful cursor-pointer relative">
        {tool.isNew && (
          <Badge className="absolute top-3 right-3 bg-primary text-primary-foreground text-[10px] px-2 py-0.5">
            Nouveau
          </Badge>
        )}
        <CardHeader className="pb-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center ${tool.color} mb-2`}
          >
            <Icon className="w-5 h-5" />
          </div>
          <CardTitle className="text-base">{tool.title}</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-sm text-muted-foreground">
            {tool.description}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}

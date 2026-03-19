"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, Phone, Mail, GraduationCap } from "lucide-react";

interface School {
  id: string;
  name: string;
  type: string;
  address: string;
  postalCode: string;
  city: string;
  phone: string | null;
  email: string | null;
  website: string | null;
  status: string;
}

const SCHOOL_TYPES = [
  { value: "", label: "Tous types" },
  { value: "maternelle", label: "Maternelle" },
  { value: "elementaire", label: "Élémentaire" },
  { value: "college", label: "Collège" },
  { value: "lycee", label: "Lycée" },
] as const;

export function SchoolSearch() {
  const [commune, setCommune] = useState("");
  const [type, setType] = useState("");
  const [results, setResults] = useState<School[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  async function handleSearch() {
    if (!commune.trim()) return;
    setLoading(true);
    setSearched(true);

    try {
      const params = new URLSearchParams({ commune: commune.trim() });
      if (type) params.set("type", type);

      const response = await fetch(`/api/gov/schools?${params.toString()}`);
      const data = await response.json();
      setResults(data.schools ?? []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GraduationCap className="h-5 w-5 text-warm-blue" />
          Établissements à proximité
        </CardTitle>
        <CardDescription>
          Recherchez les écoles et collèges de votre commune
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Commune (ex: Marseille)"
            value={commune}
            onChange={(e) => setCommune(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="flex-1"
          />
          <Select value={type} onValueChange={setType}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              {SCHOOL_TYPES.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={handleSearch} disabled={loading}>
            <Search className="h-4 w-4" />
          </Button>
        </div>

        {loading && (
          <div className="py-8 text-center text-sm text-muted-foreground">
            Recherche en cours...
          </div>
        )}

        {searched && !loading && results.length === 0 && (
          <div className="rounded-lg border border-dashed p-6 text-center">
            <GraduationCap className="mx-auto h-8 w-8 text-muted-foreground/50" />
            <p className="mt-2 text-sm text-muted-foreground">
              Aucun établissement trouvé. Vérifiez le nom de la commune.
            </p>
          </div>
        )}

        {results.length > 0 && (
          <div className="space-y-2">
            {results.map((school) => (
              <div
                key={school.id}
                className="flex items-start justify-between rounded-lg border p-3"
              >
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium truncate">{school.name}</p>
                    <Badge variant="outline" className="shrink-0 text-xs">
                      {school.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-warm-blue">{school.type}</p>
                  <p className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3 shrink-0" />
                    {school.address}, {school.postalCode} {school.city}
                  </p>
                  <div className="flex gap-3">
                    {school.phone && (
                      <p className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Phone className="h-3 w-3" />
                        {school.phone}
                      </p>
                    )}
                    {school.email && (
                      <p className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Mail className="h-3 w-3" />
                        {school.email}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

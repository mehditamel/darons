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
import { Search, MapPin, Phone, Stethoscope } from "lucide-react";

interface Practitioner {
  id: string;
  firstName: string;
  lastName: string;
  specialty: string;
  address?: string;
  phone?: string;
  distance?: number;
  active?: boolean;
}

const SPECIALTIES = [
  { value: "SM54", label: "Pédiatre" },
  { value: "SM05", label: "Dentiste" },
  { value: "SM28", label: "Ophtalmologue" },
  { value: "SM15", label: "Dermatologue" },
  { value: "SM42", label: "ORL" },
  { value: "SM01", label: "Médecin généraliste" },
] as const;

export function PractitionerSearch() {
  const [city, setCity] = useState("");
  const [specialty, setSpecialty] = useState("SM54");
  const [results, setResults] = useState<Practitioner[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  async function handleSearch() {
    if (!city.trim()) return;
    setLoading(true);
    setSearched(true);

    try {
      const params = new URLSearchParams({
        specialty,
        city: city.trim(),
      });
      const response = await fetch(`/api/gov/practitioners?${params.toString()}`);
      const data = await response.json();
      setResults(data.practitioners ?? []);
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
          <Stethoscope className="h-5 w-5 text-warm-teal" />
          Trouver un praticien
        </CardTitle>
        <CardDescription>
          Recherchez un professionnel de santé près de chez vous
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Ville (ex: Marseille)"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="flex-1"
          />
          <Select value={specialty} onValueChange={setSpecialty}>
            <SelectTrigger className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SPECIALTIES.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
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
            <Stethoscope className="mx-auto h-8 w-8 text-muted-foreground/50" />
            <p className="mt-2 text-sm text-muted-foreground">
              Aucun praticien trouvé. Essayez une autre ville ou spécialité.
            </p>
          </div>
        )}

        {results.length > 0 && (
          <div className="space-y-2">
            {results.map((prac) => (
              <div
                key={prac.id}
                className="flex items-start justify-between rounded-lg border p-3"
              >
                <div className="space-y-1">
                  <p className="text-sm font-medium">
                    Dr {prac.firstName} {prac.lastName}
                  </p>
                  <p className="text-xs text-muted-foreground">{prac.specialty}</p>
                  {prac.address && (
                    <p className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {prac.address}
                    </p>
                  )}
                  {prac.phone && (
                    <p className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Phone className="h-3 w-3" />
                      {prac.phone}
                    </p>
                  )}
                </div>
                {prac.distance && (
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {prac.distance} km
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

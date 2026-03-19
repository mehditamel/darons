"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Ruler, ArrowRight, Plus, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

interface Measurement {
  id: string;
  date: string;
  weightKg: number;
  heightCm: number;
  headCm: number;
}

function getStoredMeasurements(): Measurement[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem("darons_growth_measurements");
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function getAgeMonthsAtDate(birthDate: string, measureDate: string): number {
  const birth = new Date(birthDate);
  const measure = new Date(measureDate);
  return (measure.getFullYear() - birth.getFullYear()) * 12 + (measure.getMonth() - birth.getMonth());
}

export default function CourbeCroissancePage() {
  const [birthDate, setBirthDate] = useState("");
  const [gender, setGender] = useState<"M" | "F">("M");
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [newMeasure, setNewMeasure] = useState({ date: "", weightKg: "", heightCm: "", headCm: "" });

  useEffect(() => {
    setMeasurements(getStoredMeasurements());
  }, []);

  function addMeasurement() {
    if (!newMeasure.date || !newMeasure.weightKg) return;
    const measurement: Measurement = {
      id: Date.now().toString(),
      date: newMeasure.date,
      weightKg: parseFloat(newMeasure.weightKg) || 0,
      heightCm: parseFloat(newMeasure.heightCm) || 0,
      headCm: parseFloat(newMeasure.headCm) || 0,
    };
    const updated = [...measurements, measurement].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    setMeasurements(updated);
    localStorage.setItem("darons_growth_measurements", JSON.stringify(updated));
    setNewMeasure({ date: "", weightKg: "", heightCm: "", headCm: "" });
  }

  function removeMeasurement(id: string) {
    const updated = measurements.filter((m) => m.id !== id);
    setMeasurements(updated);
    localStorage.setItem("darons_growth_measurements", JSON.stringify(updated));
  }

  const latest = measurements[measurements.length - 1];

  return (
    <div className="space-y-8">
      <div className="text-center space-y-3">
        <div className="w-14 h-14 rounded-2xl bg-warm-teal/10 text-warm-teal flex items-center justify-center mx-auto">
          <Ruler className="w-7 h-7" />
        </div>
        <h1 className="text-3xl font-serif font-bold">
          Ton bébé grandit bien ?
        </h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Suis la croissance de ton enfant avec les courbes OMS officielles.
          Ajoute les mesures au fur et à mesure — elles restent sur ton appareil.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Informations de l&apos;enfant</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="birthDate">Date de naissance</Label>
                <Input
                  id="birthDate"
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                />
              </div>
              <div>
                <Label>Sexe</Label>
                <div className="flex gap-3 mt-2">
                  <button
                    onClick={() => setGender("M")}
                    className={`flex-1 rounded-xl border-2 p-3 text-center transition-all ${
                      gender === "M" ? "border-warm-blue bg-warm-blue/5 font-semibold" : "border-border"
                    }`}
                  >
                    Garçon
                  </button>
                  <button
                    onClick={() => setGender("F")}
                    className={`flex-1 rounded-xl border-2 p-3 text-center transition-all ${
                      gender === "F" ? "border-warm-purple bg-warm-purple/5 font-semibold" : "border-border"
                    }`}
                  >
                    Fille
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ajouter une mesure</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label htmlFor="measureDate">Date de la mesure</Label>
                <Input
                  id="measureDate"
                  type="date"
                  value={newMeasure.date}
                  onChange={(e) => setNewMeasure({ ...newMeasure, date: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label htmlFor="weight">Poids (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.01"
                    placeholder="4.5"
                    value={newMeasure.weightKg}
                    onChange={(e) => setNewMeasure({ ...newMeasure, weightKg: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="height">Taille (cm)</Label>
                  <Input
                    id="height"
                    type="number"
                    step="0.1"
                    placeholder="55"
                    value={newMeasure.heightCm}
                    onChange={(e) => setNewMeasure({ ...newMeasure, heightCm: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="head">PC (cm)</Label>
                  <Input
                    id="head"
                    type="number"
                    step="0.1"
                    placeholder="35"
                    value={newMeasure.headCm}
                    onChange={(e) => setNewMeasure({ ...newMeasure, headCm: e.target.value })}
                  />
                </div>
              </div>
              <Button onClick={addMeasurement} className="w-full">
                <Plus className="w-4 h-4 mr-2" /> Ajouter
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          {latest && birthDate && (
            <div className="grid grid-cols-3 gap-3">
              <Card className="card-playful">
                <CardContent className="pt-5 text-center">
                  <p className="text-2xl font-bold text-warm-teal">{latest.weightKg} kg</p>
                  <p className="text-xs text-muted-foreground">Dernier poids</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    à {getAgeMonthsAtDate(birthDate, latest.date)} mois
                  </p>
                </CardContent>
              </Card>
              <Card className="card-playful">
                <CardContent className="pt-5 text-center">
                  <p className="text-2xl font-bold text-warm-blue">{latest.heightCm} cm</p>
                  <p className="text-xs text-muted-foreground">Dernière taille</p>
                </CardContent>
              </Card>
              <Card className="card-playful">
                <CardContent className="pt-5 text-center">
                  <p className="text-2xl font-bold text-warm-purple">{latest.headCm} cm</p>
                  <p className="text-xs text-muted-foreground">Dernier PC</p>
                </CardContent>
              </Card>
            </div>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Historique des mesures
                <Badge variant="outline">{measurements.length} mesure{measurements.length > 1 ? "s" : ""}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {measurements.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground py-8">
                  Ajoute ta première mesure pour commencer le suivi
                </p>
              ) : (
                <div className="space-y-2">
                  {measurements.map((m) => (
                    <div key={m.id} className="flex items-center justify-between py-2 border-b last:border-0">
                      <div>
                        <p className="text-sm font-medium">
                          {new Date(m.date).toLocaleDateString("fr-FR")}
                          {birthDate && (
                            <span className="text-muted-foreground ml-1">
                              ({getAgeMonthsAtDate(birthDate, m.date)} mois)
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {m.weightKg} kg • {m.heightCm} cm • PC {m.headCm} cm
                        </p>
                      </div>
                      <button
                        onClick={() => removeMeasurement(m.id)}
                        className="text-muted-foreground hover:text-warm-red transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-warm-teal/5 border-warm-teal/20">
            <CardContent className="pt-6 text-center space-y-3">
              <p className="font-medium">
                Crée ton compte pour voir les courbes OMS complètes et les percentiles
              </p>
              <Link href="/register">
                <Button>
                  Créer mon compte gratuit <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

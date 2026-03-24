"use client";

import { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Search, SlidersHorizontal, LocateFixed, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import {
  childcareSearchSchema,
  type ChildcareSearchFormData,
} from "@/lib/validators/garde";
import { STRUCTURE_TYPE_LABELS } from "@/types/garde";
import type { ChildcareStructureType } from "@/types/garde";

interface ChildcareSearchFormProps {
  onSearch: (data: ChildcareSearchFormData) => void;
  onGeolocate?: (lat: number, lng: number) => void;
  isLoading?: boolean;
}

export function ChildcareSearchForm({
  onSearch,
  onGeolocate,
  isLoading,
}: ChildcareSearchFormProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ChildcareSearchFormData>({
    resolver: zodResolver(childcareSearchSchema),
    defaultValues: {
      query: "",
      rayonKm: 10,
    },
  });

  const currentStructureType = watch("structureType");
  const currentRayon = watch("rayonKm");

  const onSubmit = useCallback(
    (data: ChildcareSearchFormData) => {
      onSearch(data);
    },
    [onSearch]
  );

  const handleGeolocate = useCallback(() => {
    if (!navigator.geolocation) {
      setGeoError("La geolocalisation n'est pas supportee par votre navigateur.");
      return;
    }

    setGeoLoading(true);
    setGeoError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setGeoLoading(false);
        setValue("query", `${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`);
        onGeolocate?.(position.coords.latitude, position.coords.longitude);
      },
      (err) => {
        setGeoLoading(false);
        if (err.code === err.PERMISSION_DENIED) {
          setGeoError("Acces a la position refuse. Autorise la geolocalisation dans les parametres du navigateur.");
        } else {
          setGeoError("Impossible de recuperer ta position. Saisis une adresse manuellement.");
        }
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [setValue, onGeolocate]);

  return (
    <Card>
      <CardContent className="p-4">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="query" className="sr-only">
                Ville ou code postal
              </Label>
              <Input
                id="query"
                placeholder="Rechercher par ville, adresse ou code postal..."
                {...register("query")}
              />
              {errors.query && (
                <p className="mt-1 text-xs text-destructive">
                  {errors.query.message}
                </p>
              )}
            </div>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={handleGeolocate}
              disabled={geoLoading}
              title="Me localiser"
              aria-label="Utiliser ma position"
            >
              {geoLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <LocateFixed className="h-4 w-4" />
              )}
            </Button>
            <Button type="submit" disabled={isLoading}>
              <Search className="mr-2 h-4 w-4" />
              Rechercher
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => setShowFilters(!showFilters)}
              aria-label="Filtres"
            >
              <SlidersHorizontal className="h-4 w-4" />
            </Button>
          </div>

          {geoError && (
            <p className="text-xs text-destructive">{geoError}</p>
          )}

          {showFilters && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Type de structure</Label>
                <Select
                  value={currentStructureType ?? "all"}
                  onValueChange={(val) =>
                    setValue(
                      "structureType",
                      val === "all"
                        ? undefined
                        : (val as ChildcareStructureType),
                      { shouldValidate: true }
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Tous les types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les types</SelectItem>
                    {Object.entries(STRUCTURE_TYPE_LABELS).map(
                      ([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Rayon de recherche</Label>
                  <Badge variant="outline" className="text-xs">
                    {currentRayon} km
                  </Badge>
                </div>
                <Slider
                  value={[currentRayon]}
                  onValueChange={([val]) => setValue("rayonKm", val)}
                  min={1}
                  max={50}
                  step={1}
                  aria-label="Rayon de recherche en kilometres"
                />
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>1 km</span>
                  <span>50 km</span>
                </div>
              </div>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}

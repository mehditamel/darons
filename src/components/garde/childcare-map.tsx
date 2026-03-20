"use client";

import { useState, useMemo, useCallback } from "react";
import Map, { Marker, Popup, NavigationControl } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { MapPin, Star, Phone, Mail, Globe } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { ChildcareStructure } from "@/types/garde";
import { STRUCTURE_TYPE_LABELS } from "@/types/garde";

interface ChildcareMapProps {
  structures: ChildcareStructure[];
  favoriteIds: Set<string>;
  onToggleFavorite: (id: string) => void;
}

const STRUCTURE_COLORS: Record<string, string> = {
  creche: "#4A7BE8",
  micro_creche: "#7B5EA7",
  assistante_maternelle: "#2BA89E",
  mam: "#E8734A",
  accueil_loisirs: "#D4A843",
  relais_pe: "#4CAF50",
};

// Default: Marseille (seed data location)
const DEFAULT_CENTER = { latitude: 43.2965, longitude: 5.3698 };
const DEFAULT_ZOOM = 12;

// Free OSM tile server
const MAP_STYLE = "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json";

export function ChildcareMap({
  structures,
  favoriteIds,
  onToggleFavorite,
}: ChildcareMapProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const geoStructures = useMemo(
    () => structures.filter((s) => s.latitude != null && s.longitude != null),
    [structures]
  );

  const center = useMemo(() => {
    if (geoStructures.length === 0) return DEFAULT_CENTER;
    const sumLat = geoStructures.reduce((s, st) => s + (st.latitude ?? 0), 0);
    const sumLng = geoStructures.reduce((s, st) => s + (st.longitude ?? 0), 0);
    return {
      latitude: sumLat / geoStructures.length,
      longitude: sumLng / geoStructures.length,
    };
  }, [geoStructures]);

  const selected = useMemo(
    () => geoStructures.find((s) => s.id === selectedId) ?? null,
    [geoStructures, selectedId]
  );

  const handleMarkerClick = useCallback((id: string) => {
    setSelectedId((prev) => (prev === id ? null : id));
  }, []);

  if (geoStructures.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <MapPin className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">
            Aucune structure avec coordonnées GPS trouvée.
            Lance une recherche pour voir les résultats sur la carte.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="relative h-[400px] sm:h-[500px]">
        <Map
          initialViewState={{
            ...center,
            zoom: DEFAULT_ZOOM,
          }}
          style={{ width: "100%", height: "100%" }}
          mapStyle={MAP_STYLE}
        >
          <NavigationControl position="top-right" />

          {geoStructures.map((structure) => (
            <Marker
              key={structure.id}
              latitude={structure.latitude!}
              longitude={structure.longitude!}
              anchor="bottom"
              onClick={(e) => {
                e.originalEvent.stopPropagation();
                handleMarkerClick(structure.id);
              }}
            >
              <div
                className="cursor-pointer transition-transform hover:scale-110"
                title={structure.name}
              >
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white shadow-md"
                  style={{
                    backgroundColor:
                      STRUCTURE_COLORS[structure.structureType] ?? "#607D8B",
                  }}
                >
                  {favoriteIds.has(structure.id) ? (
                    <Star className="h-4 w-4 text-white fill-white" />
                  ) : (
                    <MapPin className="h-4 w-4 text-white" />
                  )}
                </div>
              </div>
            </Marker>
          ))}

          {selected && (
            <Popup
              latitude={selected.latitude!}
              longitude={selected.longitude!}
              anchor="bottom"
              offset={40}
              closeOnClick={false}
              onClose={() => setSelectedId(null)}
              maxWidth="280px"
            >
              <div className="space-y-2 p-1">
                <div>
                  <p className="font-semibold text-sm">{selected.name}</p>
                  <Badge variant="outline" className="text-[10px] mt-0.5">
                    {STRUCTURE_TYPE_LABELS[selected.structureType] ?? selected.structureType}
                  </Badge>
                </div>

                {selected.address && (
                  <p className="text-xs text-muted-foreground">{selected.address}</p>
                )}

                <div className="flex flex-wrap gap-2 text-xs">
                  {selected.phone && (
                    <a
                      href={`tel:${selected.phone}`}
                      className="inline-flex items-center gap-1 text-warm-blue hover:underline"
                    >
                      <Phone className="h-3 w-3" />
                      {selected.phone}
                    </a>
                  )}
                  {selected.email && (
                    <a
                      href={`mailto:${selected.email}`}
                      className="inline-flex items-center gap-1 text-warm-blue hover:underline"
                    >
                      <Mail className="h-3 w-3" />
                      Email
                    </a>
                  )}
                  {selected.website && (
                    <a
                      href={selected.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-warm-blue hover:underline"
                    >
                      <Globe className="h-3 w-3" />
                      Site web
                    </a>
                  )}
                </div>

                {selected.capacity && (
                  <p className="text-xs">Capacité : {selected.capacity} places</p>
                )}

                {selected.hourlyRate && (
                  <p className="text-xs">
                    Tarif : {selected.hourlyRate.toFixed(2)} €/h
                  </p>
                )}

                <Button
                  size="sm"
                  variant={favoriteIds.has(selected.id) ? "outline" : "default"}
                  className="w-full text-xs h-7"
                  onClick={() => onToggleFavorite(selected.id)}
                >
                  <Star
                    className={`mr-1 h-3 w-3 ${
                      favoriteIds.has(selected.id) ? "fill-current" : ""
                    }`}
                  />
                  {favoriteIds.has(selected.id)
                    ? "Retirer des favoris"
                    : "Ajouter aux favoris"}
                </Button>
              </div>
            </Popup>
          )}
        </Map>
      </div>

      {/* Legend */}
      <CardContent className="p-3">
        <div className="flex flex-wrap gap-3">
          {Object.entries(STRUCTURE_COLORS).map(([type, color]) => (
            <div key={type} className="flex items-center gap-1.5">
              <div
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: color }}
              />
              <span className="text-xs text-muted-foreground">
                {STRUCTURE_TYPE_LABELS[type as keyof typeof STRUCTURE_TYPE_LABELS] ?? type}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

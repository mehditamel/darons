"use client";

import { Heart, Phone, Mail, MapPin, Users, Clock, Euro } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ChildcareStructure } from "@/types/garde";
import {
  STRUCTURE_TYPE_LABELS,
  STRUCTURE_TYPE_COLORS,
} from "@/types/garde";

interface ChildcareStructureCardProps {
  structure: ChildcareStructure;
  isFavorite?: boolean;
  onToggleFavorite?: (structureId: string) => void;
}

export function ChildcareStructureCard({
  structure,
  isFavorite = false,
  onToggleFavorite,
}: ChildcareStructureCardProps) {
  return (
    <Card className="card-playful">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex items-center gap-2">
              <h3 className="truncate text-sm font-semibold">
                {structure.name}
              </h3>
              <Badge
                variant="outline"
                style={{
                  borderColor:
                    STRUCTURE_TYPE_COLORS[structure.structureType],
                  color: STRUCTURE_TYPE_COLORS[structure.structureType],
                }}
              >
                {STRUCTURE_TYPE_LABELS[structure.structureType]}
              </Badge>
            </div>

            <div className="space-y-1 text-xs text-muted-foreground">
              {structure.address && (
                <p className="flex items-center gap-1.5">
                  <MapPin className="h-3 w-3 flex-shrink-0" />
                  <span className="truncate">{structure.address}</span>
                </p>
              )}

              <div className="flex flex-wrap gap-x-4 gap-y-1">
                {structure.capacity && (
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {structure.capacity} places
                  </span>
                )}
                {structure.hourlyRate && (
                  <span className="flex items-center gap-1">
                    <Euro className="h-3 w-3" />
                    {structure.hourlyRate.toFixed(2)} €/h
                  </span>
                )}
                {structure.openingHours && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {Object.values(structure.openingHours)[0]}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap gap-x-4 gap-y-1">
                {structure.phone && (
                  <a
                    href={`tel:${structure.phone}`}
                    className="flex items-center gap-1 hover:text-foreground"
                  >
                    <Phone className="h-3 w-3" />
                    {structure.phone}
                  </a>
                )}
                {structure.email && (
                  <a
                    href={`mailto:${structure.email}`}
                    className="flex items-center gap-1 hover:text-foreground"
                  >
                    <Mail className="h-3 w-3" />
                    {structure.email}
                  </a>
                )}
              </div>

              {structure.activities.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-1">
                  {structure.activities.map((activity) => (
                    <Badge
                      key={activity}
                      variant="secondary"
                      className="text-[10px]"
                    >
                      {activity}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          {onToggleFavorite && (
            <Button
              variant="ghost"
              size="icon"
              className="transition-transform hover:scale-110"
              onClick={() => onToggleFavorite(structure.id)}
              aria-label={
                isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"
              }
            >
              <Heart
                className={`h-5 w-5 transition-all duration-200 ${
                  isFavorite
                    ? "fill-red-500 text-red-500 scale-110"
                    : "text-muted-foreground"
                }`}
              />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

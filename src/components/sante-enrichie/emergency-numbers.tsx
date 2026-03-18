"use client";

import { Phone } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EMERGENCY_NUMBERS } from "@/lib/constants";

export function EmergencyNumbers() {
  return (
    <Card className="border-red-200 bg-red-50/50">
      <CardContent className="py-3 px-4">
        <div className="flex items-center gap-2 mb-2">
          <Phone className="h-4 w-4 text-red-600" />
          <span className="text-sm font-semibold text-red-700">
            Num\u00e9ros d&apos;urgence
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {EMERGENCY_NUMBERS.map((item) => (
            <Button
              key={item.number}
              variant="outline"
              size="sm"
              className="h-auto py-1 px-3 text-xs border-red-200 hover:bg-red-100"
              asChild
            >
              <a href={`tel:${item.number.replace(/\s/g, "")}`} title={item.description}>
                <Phone className="mr-1 h-3 w-3" />
                {item.name} — {item.number}
              </a>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

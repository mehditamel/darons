"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { calculateAge } from "@/lib/utils";
import type { FamilyMember } from "@/types/family";

interface ChildSelectorProps {
  children: FamilyMember[];
  selectedId: string;
  onSelect: (id: string) => void;
}

export function ChildSelector({ children, selectedId, onSelect }: ChildSelectorProps) {
  if (children.length <= 1) return null;

  return (
    <Select value={selectedId} onValueChange={onSelect}>
      <SelectTrigger className="w-[240px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {children.map((child) => (
          <SelectItem key={child.id} value={child.id}>
            {child.firstName} ({calculateAge(child.birthDate).label})
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

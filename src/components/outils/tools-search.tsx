"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface ToolsSearchProps {
  onSearch: (query: string) => void;
}

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function ToolsSearch({ onSearch }: ToolsSearchProps) {
  const [query, setQuery] = useState("");

  function handleChange(value: string) {
    setQuery(value);
    onSearch(normalizeText(value.trim()));
  }

  return (
    <div className="relative max-w-md mx-auto">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        type="search"
        placeholder="Rechercher un outil..."
        value={query}
        onChange={(e) => handleChange(e.target.value)}
        className="pl-10"
      />
    </div>
  );
}

export { normalizeText };

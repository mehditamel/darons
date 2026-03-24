"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Search } from "lucide-react";

interface CategoryFilterProps {
  categories: { name: string; count: number; color: string }[];
  totalCount: number;
}

export function CategoryFilter({ categories, totalCount }: CategoryFilterProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const activeCategory = searchParams.get("category");
  const searchQuery = searchParams.get("q") || "";

  function updateParams(updates: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }

  function handleCategoryClick(category: string | null) {
    updateParams({ category });
  }

  function handleSearchChange(value: string) {
    updateParams({ q: value || null });
  }

  return (
    <div className="space-y-4">
      {/* Search input */}
      <div className="relative max-w-md mx-auto">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="search"
          placeholder="Rechercher un article..."
          value={searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="w-full rounded-full border bg-background pl-9 pr-4 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          aria-label="Rechercher dans le blog"
        />
      </div>

      {/* Category pills */}
      <div className="flex flex-wrap gap-2 justify-center">
        <button
          type="button"
          onClick={() => handleCategoryClick(null)}
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
            !activeCategory
              ? "bg-foreground text-background"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          }`}
        >
          Tous
          <span className="text-xs opacity-70">({totalCount})</span>
        </button>
        {categories.map((cat) => (
          <button
            key={cat.name}
            type="button"
            onClick={() => handleCategoryClick(cat.name)}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
              activeCategory === cat.name
                ? `${cat.color} ring-2 ring-offset-2 ring-current`
                : `${cat.color} opacity-70 hover:opacity-100`
            }`}
          >
            {cat.name}
            <span className="text-xs opacity-70">({cat.count})</span>
          </button>
        ))}
      </div>
    </div>
  );
}

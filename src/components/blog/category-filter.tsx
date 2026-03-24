"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";

interface CategoryFilterProps {
  categories: { name: string; count: number; color: string }[];
  totalCount: number;
}

export function CategoryFilter({ categories, totalCount }: CategoryFilterProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const activeCategory = searchParams.get("category");

  function handleCategoryClick(category: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (category) {
      params.set("category", category);
    } else {
      params.delete("category");
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }

  return (
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
  );
}

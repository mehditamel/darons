"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import type { BlogArticle } from "@/lib/blog-data";

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

interface BlogArticleGridProps {
  articles: BlogArticle[];
  categoryColors: Record<string, string>;
}

export function BlogArticleGrid({ articles, categoryColors }: BlogArticleGridProps) {
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get("category");
  const searchQuery = searchParams.get("q") || "";

  let filtered = activeCategory
    ? articles.filter((a) => a.category === activeCategory)
    : articles;

  if (searchQuery.trim()) {
    const normalizedQuery = normalizeText(searchQuery.trim());
    filtered = filtered.filter((a) =>
      normalizeText(a.title).includes(normalizedQuery) ||
      normalizeText(a.description).includes(normalizedQuery) ||
      normalizeText(a.category).includes(normalizedQuery)
    );
  }

  return (
    <>
      <p className="text-center text-sm text-muted-foreground -mt-2 mb-6">
        {filtered.length} article{filtered.length > 1 ? "s" : ""}
        {activeCategory ? ` dans "${activeCategory}"` : ""}
        {searchQuery ? ` pour "${searchQuery}"` : ""}
      </p>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((article) => (
          <Link key={article.slug} href={`/blog/${article.slug}`}>
            <Card className="h-full transition-shadow hover:shadow-lg cursor-pointer">
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <Badge
                    variant="secondary"
                    className={categoryColors[article.category] ?? ""}
                  >
                    {article.category}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {article.readingTime}
                  </span>
                </div>
                <CardTitle className="text-lg leading-tight">
                  {article.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {article.description}
                </p>
                <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground">
                  <Calendar className="w-3 h-3" />
                  {formatDate(article.date, "d MMMM yyyy")}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            {searchQuery
              ? `Aucun article ne correspond a "${searchQuery}". Essaie d'autres mots-cles.`
              : "Aucun article dans cette categorie pour le moment."
            }
          </div>
        )}
      </div>
    </>
  );
}

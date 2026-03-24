import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getAllArticles } from "@/lib/blog-data";
import { CategoryFilter } from "@/components/blog/category-filter";
import { BlogArticleGrid } from "@/components/blog/blog-article-grid";
import { NewsletterSignup } from "@/components/blog/newsletter-signup";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Blog — Conseils parents, fiscalité, santé enfant",
  description:
    "Guides pratiques pour les parents : vaccins obligatoires, crédit d'impôt garde enfant, comparatif modes de garde, allocations CAF. Conseils d'experts.",
  openGraph: {
    title: "Blog Darons — Guides pour les parents",
    description:
      "Guides pratiques pour les parents : vaccins, fiscal, budget, garde d'enfants.",
  },
};

const CATEGORY_COLORS: Record<string, string> = {
  "Santé": "bg-warm-teal/10 text-warm-teal",
  "Fiscal": "bg-warm-gold/10 text-warm-gold",
  "Garde": "bg-warm-orange/10 text-warm-orange",
  "Budget": "bg-warm-blue/10 text-warm-blue",
  "Démarches": "bg-warm-purple/10 text-warm-purple",
  "Identité": "bg-warm-green/10 text-warm-green",
  "Développement": "bg-warm-purple/10 text-warm-purple",
};

export const revalidate = 3600;

export default function BlogPage() {
  const articles = getAllArticles();

  const categoryCounts = articles.reduce<Record<string, number>>((acc, a) => {
    acc[a.category] = (acc[a.category] || 0) + 1;
    return acc;
  }, {});

  const categories = Object.entries(categoryCounts)
    .sort(([, a], [, b]) => b - a)
    .map(([name, count]) => ({
      name,
      count,
      color: CATEGORY_COLORS[name] ?? "bg-muted text-muted-foreground",
    }));

  return (
    <div className="space-y-8">
      <div className="text-center space-y-3">
        <h1 className="text-3xl font-serif font-bold">
          Le blog Darons
        </h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Guides pratiques, conseils d&apos;experts et astuces pour simplifier
          votre quotidien de parent.
        </p>
      </div>

      <Suspense fallback={null}>
        <CategoryFilter
          categories={categories}
          totalCount={articles.length}
        />
      </Suspense>

      <Suspense fallback={null}>
        <BlogArticleGrid
          articles={articles}
          categoryColors={CATEGORY_COLORS}
        />
      </Suspense>

      <NewsletterSignup />

      <div className="text-center pt-8 border-t">
        <p className="text-muted-foreground mb-4">
          Envie de passer à l&apos;action ?
        </p>
        <Link href="/outils">
          <Button variant="outline">
            Découvrir nos outils gratuits <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </div>
    </div>
  );
}

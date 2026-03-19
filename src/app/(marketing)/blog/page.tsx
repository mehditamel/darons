import type { Metadata } from "next";
import Link from "next/link";
import { Calendar, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getAllArticles } from "@/lib/blog-data";
import { formatDate } from "@/lib/utils";

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
};

export const revalidate = 3600; // ISR: revalidate every hour

export default function BlogPage() {
  const articles = getAllArticles();

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

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {articles.map((article) => (
          <Link key={article.slug} href={`/blog/${article.slug}`}>
            <Card className="h-full transition-shadow hover:shadow-lg cursor-pointer">
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <Badge
                    variant="secondary"
                    className={CATEGORY_COLORS[article.category] ?? ""}
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
      </div>

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

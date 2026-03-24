import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Calendar, ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getArticleBySlug, getAllArticles, getAdjacentArticles, getRelatedArticles } from "@/lib/blog-data";
import { JsonLd } from "@/components/seo/json-ld";
import { formatDate } from "@/lib/utils";

interface BlogPostPageProps {
  params: { slug: string };
}

export const revalidate = 3600; // ISR: revalidate every hour

export async function generateStaticParams() {
  return getAllArticles().map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const article = getArticleBySlug(params.slug);
  if (!article) return { title: "Article introuvable" };

  return {
    title: article.title,
    description: article.description,
    openGraph: {
      title: `${article.title} — Darons`,
      description: article.description,
      type: "article",
      publishedTime: article.date,
    },
  };
}

export default function BlogPostPage({ params }: BlogPostPageProps) {
  const article = getArticleBySlug(params.slug);
  if (!article) notFound();

  const { previous: prevArticle, next: nextArticle } = getAdjacentArticles(article.slug);
  const relatedArticles = getRelatedArticles(article.slug, 3);

  // Simple markdown-like rendering (paragraphs, headers, bold, lists, links, tables)
  const sections = article.content.split("\n\n").map((block, i) => {
    const trimmed = block.trim();

    if (trimmed.startsWith("### ")) {
      return (
        <h3 key={i} className="text-lg font-serif font-bold mt-6 mb-2">
          {trimmed.slice(4)}
        </h3>
      );
    }
    if (trimmed.startsWith("## ")) {
      return (
        <h2 key={i} className="text-xl font-serif font-bold mt-8 mb-3">
          {trimmed.slice(3)}
        </h2>
      );
    }
    if (trimmed.startsWith("| ")) {
      const rows = trimmed.split("\n").filter((r) => !r.match(/^\|[\s-|]+\|$/));
      return (
        <div key={i} className="overflow-x-auto my-4">
          <table className="w-full text-sm border-collapse">
            <tbody>
              {rows.map((row, ri) => {
                const cells = row.split("|").filter(Boolean).map((c) => c.trim());
                const Tag = ri === 0 ? "th" : "td";
                return (
                  <tr key={ri} className={ri === 0 ? "border-b-2 font-medium" : "border-b"}>
                    {cells.map((cell, ci) => (
                      <Tag key={ci} className="px-3 py-2 text-left">
                        {cell}
                      </Tag>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      );
    }
    if (trimmed.match(/^[0-9]+\.\s/)) {
      const items = trimmed.split("\n");
      return (
        <ol key={i} className="list-decimal pl-6 space-y-1 my-3">
          {items.map((item, li) => (
            <li key={li} className="text-muted-foreground">
              <span dangerouslySetInnerHTML={{ __html: formatInline(item.replace(/^\d+\.\s*/, "")) }} />
            </li>
          ))}
        </ol>
      );
    }
    if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      const items = trimmed.split("\n");
      return (
        <ul key={i} className="list-disc pl-6 space-y-1 my-3">
          {items.map((item, li) => (
            <li key={li} className="text-muted-foreground">
              <span dangerouslySetInnerHTML={{ __html: formatInline(item.replace(/^[-*]\s*/, "")) }} />
            </li>
          ))}
        </ul>
      );
    }

    return (
      <p key={i} className="text-muted-foreground leading-relaxed my-3">
        <span dangerouslySetInnerHTML={{ __html: formatInline(trimmed) }} />
      </p>
    );
  });

  return (
    <article className="max-w-2xl mx-auto">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: article.title,
          description: article.description,
          datePublished: article.date,
          author: {
            "@type": "Organization",
            name: "Darons",
            url: "https://darons.app",
          },
          publisher: {
            "@type": "Organization",
            name: "Darons",
            url: "https://darons.app",
          },
          mainEntityOfPage: {
            "@type": "WebPage",
            "@id": `https://darons.app/blog/${article.slug}`,
          },
        }}
      />
      <Link href="/blog" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="w-4 h-4" /> Retour au blog
      </Link>

      <header className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <Badge variant="secondary">{article.category}</Badge>
          <span className="text-xs text-muted-foreground">{article.readingTime}</span>
        </div>
        <h1 className="text-3xl font-serif font-bold leading-tight mb-4">
          {article.title}
        </h1>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="w-4 h-4" />
          {formatDate(article.date, "d MMMM yyyy")}
        </div>
      </header>

      <div className="prose-like">{sections}</div>

      <Card className="mt-12 bg-warm-orange/5 border-warm-orange/20">
        <CardContent className="pt-6 text-center space-y-3">
          <p className="font-medium">
            Gerez la sante, le budget et la fiscalite de votre famille
          </p>
          <div className="flex gap-3 justify-center">
            <Link href="/outils">
              <Button variant="outline">Outils gratuits</Button>
            </Link>
            <Link href="/register">
              <Button>
                Creer mon compte <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Related articles */}
      {relatedArticles.length > 0 && (
        <div className="mt-10">
          <h3 className="text-lg font-semibold mb-4">
            Articles dans la meme categorie
          </h3>
          <div className="grid gap-3">
            {relatedArticles.map((related) => (
              <Link
                key={related.slug}
                href={`/blog/${related.slug}`}
                className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{related.title}</p>
                  <p className="text-xs text-muted-foreground">{related.readingTime}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Prev/Next navigation */}
      <nav className="flex gap-4 mt-10 border-t pt-6" aria-label="Articles adjacents">
        {prevArticle ? (
          <Link href={`/blog/${prevArticle.slug}`} className="flex-1 group">
            <p className="text-xs text-muted-foreground mb-1">
              <ArrowLeft className="inline h-3 w-3 mr-1" />
              Precedent
            </p>
            <p className="text-sm font-medium group-hover:text-warm-orange transition-colors line-clamp-2">
              {prevArticle.title}
            </p>
          </Link>
        ) : (
          <div className="flex-1" />
        )}
        {nextArticle ? (
          <Link href={`/blog/${nextArticle.slug}`} className="flex-1 text-right group">
            <p className="text-xs text-muted-foreground mb-1">
              Suivant
              <ArrowRight className="inline h-3 w-3 ml-1" />
            </p>
            <p className="text-sm font-medium group-hover:text-warm-orange transition-colors line-clamp-2">
              {nextArticle.title}
            </p>
          </Link>
        ) : (
          <div className="flex-1" />
        )}
      </nav>
    </article>
  );
}

function formatInline(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="text-warm-orange underline">$1</a>')
    .replace(/`(.+?)`/g, '<code class="bg-muted px-1 py-0.5 rounded text-sm">$1</code>');
}

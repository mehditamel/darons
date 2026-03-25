import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Calendar, ArrowLeft, ArrowRight, List, PenLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getArticleBySlug, getAllArticles, getAdjacentArticles, getRelatedArticles } from "@/lib/blog-data";
import { JsonLd } from "@/components/seo/json-ld";
import { ShareButtons } from "@/components/blog/share-buttons";
import { ReadingProgress } from "@/components/blog/reading-progress";
import { CopyableHeading } from "@/components/blog/copyable-heading";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { NewsletterSignup } from "@/components/blog/newsletter-signup";
import { formatDate } from "@/lib/utils";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const CATEGORY_TOOL_MAP: Record<string, { href: string; label: string }> = {
  "Santé": { href: "/outils/calendrier-vaccinal", label: "Calendrier vaccinal interactif" },
  "Sante": { href: "/outils/calendrier-vaccinal", label: "Calendrier vaccinal interactif" },
  "Fiscal": { href: "/outils/simulateur-ir", label: "Simuler ton impot" },
  "Garde": { href: "/outils/simulateur-garde", label: "Calculer le cout de garde" },
  "Budget": { href: "/outils/simulateur-budget", label: "Ton budget familial" },
  "Démarches": { href: "/outils/checklist-naissance", label: "Checklist demarches naissance" },
  "Demarches": { href: "/outils/checklist-naissance", label: "Checklist demarches naissance" },
  "Identité": { href: "/outils/checklist-naissance", label: "Checklist documents" },
  "Développement": { href: "/outils/jalons-developpement", label: "Jalons de developpement" },
};

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

  const ogImageUrl = `https://darons.app/api/og?title=${encodeURIComponent(article.title)}&category=${encodeURIComponent(article.category)}`;

  return {
    title: article.title,
    description: article.description,
    openGraph: {
      title: `${article.title} — Darons`,
      description: article.description,
      type: "article",
      publishedTime: article.date,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: article.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${article.title} — Darons`,
      description: article.description,
      images: [ogImageUrl],
    },
    alternates: {
      canonical: `https://darons.app/blog/${params.slug}`,
    },
  };
}

export default function BlogPostPage({ params }: BlogPostPageProps) {
  const article = getArticleBySlug(params.slug);
  if (!article) notFound();

  const { previous: prevArticle, next: nextArticle } = getAdjacentArticles(article.slug);
  const relatedArticles = getRelatedArticles(article.slug, 3);

  // Collect headings for table of contents
  const headings: { level: number; text: string; id: string }[] = [];
  const blocks = article.content.split("\n\n");
  for (const block of blocks) {
    const trimmed = block.trim();
    if (trimmed.startsWith("### ")) {
      const text = trimmed.slice(4);
      headings.push({ level: 3, text, id: slugify(text) });
    } else if (trimmed.startsWith("## ")) {
      const text = trimmed.slice(3);
      headings.push({ level: 2, text, id: slugify(text) });
    }
  }

  // Simple markdown-like rendering (paragraphs, headers, bold, lists, links, tables)
  const sections = blocks.map((block, i) => {
    const trimmed = block.trim();

    if (trimmed.startsWith("### ")) {
      const text = trimmed.slice(4);
      return <CopyableHeading key={i} id={slugify(text)} level={3}>{text}</CopyableHeading>;
    }
    if (trimmed.startsWith("## ")) {
      const text = trimmed.slice(3);
      return <CopyableHeading key={i} id={slugify(text)} level={2}>{text}</CopyableHeading>;
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
      <ReadingProgress />
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
      <Breadcrumbs
        items={[
          { label: "Blog", href: "/blog" },
          { label: article.category, href: `/blog?category=${encodeURIComponent(article.category)}` },
          { label: article.title },
        ]}
      />

      <header className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <Badge variant="secondary">{article.category}</Badge>
          <span className="text-xs text-muted-foreground">{article.readingTime}</span>
        </div>
        <h1 className="text-3xl font-serif font-bold leading-tight mb-4">
          {article.title}
        </h1>
        <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            {formatDate(article.date, "d MMMM yyyy")}
          </div>
          <ShareButtons
            url={`https://darons.app/blog/${article.slug}`}
            title={article.title}
          />
        </div>
      </header>

      {/* Table of contents for articles with 3+ headings */}
      {headings.length >= 3 && (
        <nav className="mb-8 rounded-xl border bg-muted/30 p-4" aria-label="Sommaire de l'article">
          <div className="flex items-center gap-2 mb-3 text-sm font-semibold">
            <List className="w-4 h-4" />
            Sommaire
          </div>
          <ol className="space-y-1 text-sm">
            {headings.map((h) => (
              <li key={h.id} className={h.level === 3 ? "pl-4" : ""}>
                <a
                  href={`#${h.id}`}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {h.text}
                </a>
              </li>
            ))}
          </ol>
        </nav>
      )}

      <div className="prose-like">{sections}</div>

      {/* Contextual CTA based on article category */}
      {(() => {
        const tool = CATEGORY_TOOL_MAP[article.category];
        return (
          <Card className="mt-12 bg-warm-orange/5 border-warm-orange/20">
            <CardContent className="pt-6 text-center space-y-3">
              <p className="font-medium">
                {tool
                  ? `Cet article t'a ete utile ? Essaie notre outil gratuit`
                  : `Gerez la sante, le budget et la fiscalite de votre famille`
                }
              </p>
              <div className="flex gap-3 justify-center flex-wrap">
                <Link href={tool?.href ?? "/outils"}>
                  <Button variant="outline">
                    {tool?.label ?? "Outils gratuits"}
                  </Button>
                </Link>
                <Link href="/register">
                  <Button>
                    Creer mon compte <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        );
      })()}

      {/* Author card */}
      <div className="mt-10 flex items-start gap-4 rounded-xl border p-4 bg-muted/20">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-warm-orange/10 text-warm-orange">
          <PenLine className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-semibold">L'equipe Darons</p>
          <p className="text-xs text-muted-foreground mt-1">
            Des parents comme toi, qui construisent l'app qu'ils auraient voulu avoir.
            Sante, budget, impots, papiers — on simplifie tout.
          </p>
          <Link href="/blog" className="text-xs text-warm-orange hover:underline mt-1 inline-block">
            Voir tous nos articles
          </Link>
        </div>
      </div>

      {/* Newsletter CTA */}
      <div className="mt-10">
        <NewsletterSignup />
      </div>

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

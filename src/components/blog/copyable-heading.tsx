"use client";

import { useState } from "react";
import { Link2, Check } from "lucide-react";

interface CopyableHeadingProps {
  id: string;
  level: 2 | 3;
  children: string;
}

export function CopyableHeading({ id, level, children }: CopyableHeadingProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    const url = `${window.location.origin}${window.location.pathname}#${id}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard not available
    }
  }

  const Tag = level === 2 ? "h2" : "h3";
  const sizeClass = level === 2
    ? "text-xl font-serif font-bold mt-8 mb-3"
    : "text-lg font-serif font-bold mt-6 mb-2";

  return (
    <Tag id={id} className={`${sizeClass} scroll-mt-20 group relative`}>
      <a
        href={`#${id}`}
        className="absolute -left-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={(e) => {
          e.preventDefault();
          handleCopy();
          window.location.hash = id;
        }}
        aria-label={`Copier le lien vers "${children}"`}
      >
        {copied ? (
          <Check className="h-4 w-4 text-warm-green" />
        ) : (
          <Link2 className="h-4 w-4 text-muted-foreground hover:text-foreground" />
        )}
      </a>
      {children}
    </Tag>
  );
}

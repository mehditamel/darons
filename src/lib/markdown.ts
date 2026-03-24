/**
 * Simple markdown to HTML converter.
 * Handles: headings, paragraphs, bold, italic, links, lists, code blocks, horizontal rules.
 * No external dependency needed — our blog articles use basic markdown.
 */
export function markdownToHtml(markdown: string): string {
  let html = markdown;

  // Code blocks (``` ... ```)
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_match, _lang, code) => {
    return `<pre class="bg-muted rounded-lg p-4 overflow-x-auto text-sm"><code>${escapeHtml(code.trim())}</code></pre>`;
  });

  // Inline code (`code`)
  html = html.replace(/`([^`]+)`/g, '<code class="bg-muted px-1.5 py-0.5 rounded text-sm">$1</code>');

  // Headings
  html = html.replace(/^#### (.+)$/gm, '<h4 class="text-base font-semibold mt-6 mb-2">$1</h4>');
  html = html.replace(/^### (.+)$/gm, '<h3 class="text-lg font-semibold mt-8 mb-3">$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold mt-10 mb-4">$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold mt-10 mb-4">$1</h1>');

  // Horizontal rules
  html = html.replace(/^---$/gm, '<hr class="my-8 border-border" />');

  // Bold + italic
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>");
  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");

  // Links
  html = html.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" class="text-warm-orange hover:underline">$1</a>'
  );

  // Unordered lists
  html = html.replace(
    /^(?:- (.+)\n?)+/gm,
    (match) => {
      const items = match
        .trim()
        .split("\n")
        .map((line) => `<li class="ml-4">${line.replace(/^- /, "")}</li>`)
        .join("");
      return `<ul class="list-disc pl-4 space-y-1 my-4">${items}</ul>`;
    }
  );

  // Ordered lists
  html = html.replace(
    /^(?:\d+\. (.+)\n?)+/gm,
    (match) => {
      const items = match
        .trim()
        .split("\n")
        .map((line) => `<li class="ml-4">${line.replace(/^\d+\. /, "")}</li>`)
        .join("");
      return `<ol class="list-decimal pl-4 space-y-1 my-4">${items}</ol>`;
    }
  );

  // Tables (basic support: | col1 | col2 |)
  html = html.replace(
    /^(\|.+\|)\n(\|[\s-|]+\|)\n((?:\|.+\|\n?)+)/gm,
    (_match, headerRow: string, _separator: string, bodyRows: string) => {
      const headers = headerRow
        .split("|")
        .filter((c: string) => c.trim())
        .map((c: string) => `<th class="border px-3 py-2 text-left font-semibold bg-muted">${c.trim()}</th>`)
        .join("");
      const rows = bodyRows
        .trim()
        .split("\n")
        .map((row: string) => {
          const cells = row
            .split("|")
            .filter((c: string) => c.trim())
            .map((c: string) => `<td class="border px-3 py-2">${c.trim()}</td>`)
            .join("");
          return `<tr>${cells}</tr>`;
        })
        .join("");
      return `<div class="overflow-x-auto my-4"><table class="w-full border-collapse text-sm"><thead><tr>${headers}</tr></thead><tbody>${rows}</tbody></table></div>`;
    }
  );

  // Paragraphs — wrap remaining lines that aren't already HTML tags
  html = html
    .split("\n\n")
    .map((block) => {
      const trimmed = block.trim();
      if (!trimmed) return "";
      if (trimmed.startsWith("<")) return trimmed;
      return `<p class="text-muted-foreground leading-relaxed my-4">${trimmed.replace(/\n/g, "<br />")}</p>`;
    })
    .join("\n");

  return html;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

import { SECTIONS } from "@/lib/tools-catalog";

function normalize(text: string) {
  return text.toLocaleLowerCase("fr").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

export function filterTools(query: string, category = "Tous") {
  const terms = normalize(query).trim().split(/\s+/).filter(Boolean);
  return SECTIONS.filter((section) => category === "Tous" || section.title === category)
    .flatMap((section) => section.tools.filter((tool) => {
      const text = normalize(`${section.title} ${tool.title} ${tool.description}`);
      return terms.every((term) => text.includes(term));
    }));
}

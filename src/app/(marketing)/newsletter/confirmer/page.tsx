import type { Metadata } from "next";
import { NewsletterPreferenceForm } from "@/components/blog/newsletter-preference-form";
export const metadata: Metadata = { title: "Confirmer la newsletter", robots: { index: false, follow: false }, referrer: "no-referrer" };
export default async function Page({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  return <NewsletterPreferenceForm token={typeof token === "string" ? token : ""} action="confirm" />;
}

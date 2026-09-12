import "server-only";
import { createHash } from "node:crypto";

export function newsletterTokenHash(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function validNewsletterToken(token: unknown): token is string {
  return typeof token === "string" && /^[a-f0-9]{64}$/.test(token);
}

import { z } from "zod";

// ─── Server-side environment variables ───────────────────────────────
const serverSchema = z.object({
  // Supabase
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional().default(""),

  // Anthropic (Claude IA)
  ANTHROPIC_API_KEY: z.string().optional().default(""),

  // Open Banking — Bridge API
  BRIDGE_CLIENT_ID: z.string().optional().default(""),
  BRIDGE_CLIENT_SECRET: z.string().optional().default(""),
  BRIDGE_API_URL: z
    .string()
    .url()
    .optional()
    .default("https://api.bridgeapi.io"),
  BRIDGE_WEBHOOK_SECRET: z.string().optional().default(""),

  // Stripe
  STRIPE_SECRET_KEY: z.string().optional().default(""),
  STRIPE_WEBHOOK_SECRET: z.string().optional().default(""),
  STRIPE_PREMIUM_PRICE_ID: z.string().optional().default(""),
  STRIPE_FAMILY_PRO_PRICE_ID: z.string().optional().default(""),

  // Email (Resend)
  RESEND_API_KEY: z.string().optional().default(""),

  // SMS (Twilio)
  TWILIO_ACCOUNT_SID: z.string().optional().default(""),
  TWILIO_AUTH_TOKEN: z.string().optional().default(""),
  TWILIO_PHONE_NUMBER: z.string().optional().default(""),

  // Google Calendar
  GOOGLE_CLIENT_ID: z.string().optional().default(""),
  GOOGLE_CLIENT_SECRET: z.string().optional().default(""),

  // OCR
  GOOGLE_VISION_API_KEY: z.string().optional().default(""),

  // Mon Espace Santé (FHIR)
  MES_FHIR_BASE_URL: z.string().optional().default(""),
  MES_CLIENT_ID: z.string().optional().default(""),
  MES_CLIENT_SECRET: z.string().optional().default(""),
  MES_REDIRECT_URI: z.string().optional().default(""),
  PRO_SANTE_CONNECT_URL: z.string().optional().default(""),

  // Rate limiting (Upstash Redis)
  UPSTASH_REDIS_REST_URL: z.string().optional().default(""),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional().default(""),

  // Monitoring
  SENTRY_DSN: z.string().optional().default(""),

  // Node
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .optional()
    .default("development"),
});

// ─── Client-side environment variables (NEXT_PUBLIC_*) ───────────────
const clientSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional().default(""),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional().default(""),
  NEXT_PUBLIC_APP_URL: z
    .string()
    .url()
    .optional()
    .default("https://darons.app"),
  NEXT_PUBLIC_APP_NAME: z.string().optional().default("Darons"),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().optional().default(""),
  NEXT_PUBLIC_GOOGLE_CLIENT_ID: z.string().optional().default(""),
  NEXT_PUBLIC_VAPID_PUBLIC_KEY: z.string().optional().default(""),
});

// ─── Merged schema ───────────────────────────────────────────────────
const envSchema = serverSchema.merge(clientSchema);

export type Env = z.infer<typeof envSchema>;

// ─── Lazy singleton ──────────────────────────────────────────────────
// Validated on first access — won't crash build if vars are missing in CI
let _env: Env | null = null;

function getEnv(): Env {
  if (_env) return _env;

  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    const formatted = parsed.error.flatten().fieldErrors;
    const message = Object.entries(formatted)
      .map(([key, errors]) => `  ${key}: ${(errors ?? []).join(", ")}`)
      .join("\n");

    console.error(
      `\n❌ Invalid environment variables:\n${message}\n\nCheck your .env.local file.\n`
    );

    // In production, throw to prevent startup with bad config
    if (process.env.NODE_ENV === "production") {
      throw new Error("Invalid environment variables");
    }

    // In dev/test, return partial parse with defaults
    _env = envSchema.parse({});
    return _env;
  }

  _env = parsed.data;
  return _env;
}

/**
 * Validated environment variables.
 * Lazily parsed on first access with Zod schema validation.
 *
 * Usage:
 * ```ts
 * import { env } from "@/lib/env";
 * const key = env.ANTHROPIC_API_KEY;
 * ```
 */
export const env = new Proxy({} as Env, {
  get(_target, prop: string) {
    return getEnv()[prop as keyof Env];
  },
});

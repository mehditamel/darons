import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { rateLimit } from "@/lib/rate-limit";
import crypto from "crypto";

const BRIDGE_WEBHOOK_SECRET = process.env.BRIDGE_WEBHOOK_SECRET || "";

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

function verifySignature(payload: string, signature: string): boolean {
  if (!BRIDGE_WEBHOOK_SECRET) return false;
  const expected = crypto
    .createHmac("sha256", BRIDGE_WEBHOOK_SECRET)
    .update(payload)
    .digest("hex");
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expected)
  );
}

interface BridgeWebhookEvent {
  type: string;
  item_id?: number;
  account_id?: number;
  transactions?: Array<{
    id: number;
    account_id: number;
    amount: number;
    currency_code: string;
    description: string;
    clean_description: string;
    category_id: number | null;
    date: string;
    is_future: boolean;
  }>;
  status?: number;
}

export async function POST(request: NextRequest) {
  const limited = rateLimit("webhook-bridge", 30, 60_000);
  if (limited) {
    return NextResponse.json({ error: "Rate limited" }, { status: 429 });
  }

  try {
  const body = await request.text();
  const signature = request.headers.get("bridge-signature") || "";

  if (BRIDGE_WEBHOOK_SECRET && !verifySignature(body, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let event: BridgeWebhookEvent;
  try {
    event = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const supabaseAdmin = getSupabaseAdmin();

  switch (event.type) {
    case "item.refreshed": {
      if (event.item_id) {
        await supabaseAdmin
          .from("bank_connections")
          .update({
            status: "active",
            last_sync_at: new Date().toISOString(),
          })
          .eq("bridge_item_id", String(event.item_id));
      }
      break;
    }

    case "item.needs_action": {
      if (event.item_id) {
        await supabaseAdmin
          .from("bank_connections")
          .update({ status: "needs_refresh" })
          .eq("bridge_item_id", String(event.item_id));
      }
      break;
    }

    case "transactions.created": {
      if (event.transactions && event.transactions.length > 0) {
        const accountId = event.transactions[0].account_id;

        const { data: bankAccount } = await supabaseAdmin
          .from("bank_accounts")
          .select("id")
          .eq("bridge_account_id", String(accountId))
          .single();

        if (bankAccount) {
          const rows = event.transactions.map((tx) => ({
            account_id: bankAccount.id,
            bridge_transaction_id: String(tx.id),
            amount: tx.amount,
            currency: tx.currency_code || "EUR",
            description: tx.clean_description || tx.description,
            category_auto: tx.category_id ? String(tx.category_id) : null,
            transaction_date: tx.date,
            is_recurring: false,
          }));

          await supabaseAdmin
            .from("bank_transactions")
            .upsert(rows, { onConflict: "bridge_transaction_id" });
        }
      }
      break;
    }

    default:
      break;
  }

  return NextResponse.json({ received: true });
  } catch {
    return NextResponse.json(
      { error: "Une erreur inattendue est survenue" },
      { status: 500 }
    );
  }
}

/**
 * Bridge API client wrapper for Open Banking integration.
 *
 * Bridge (by Bankin') provides account aggregation, transaction categorization
 * and payment initiation via DSP2-compliant APIs.
 *
 * Abstracted behind an interface to allow swapping providers (Bridge → Powens).
 * Server-side only — never import this on the client.
 */

import { withRetry } from "@/lib/utils/retry";

const BRIDGE_API_URL = process.env.BRIDGE_API_URL || "https://api.bridgeapi.io";
const BRIDGE_CLIENT_ID = process.env.BRIDGE_CLIENT_ID || "";
const BRIDGE_CLIENT_SECRET = process.env.BRIDGE_CLIENT_SECRET || "";

// ── Types ──

export interface BridgeUser {
  uuid: string;
  email: string;
}

export interface BridgeItem {
  id: number;
  status: number;
  bank_id: number;
  bank_name: string;
  last_refresh_at: string | null;
}

export interface BridgeAccount {
  id: number;
  item_id: number;
  name: string;
  balance: number;
  currency_code: string;
  type: "checking" | "savings" | "card" | "loan" | "other";
  iban: string | null;
  updated_at: string;
}

export interface BridgeTransaction {
  id: number;
  account_id: number;
  amount: number;
  currency_code: string;
  description: string;
  clean_description: string;
  category_id: number | null;
  date: string;
  is_future: boolean;
  updated_at: string;
}

export interface BridgeCategory {
  id: number;
  name: string;
  parent_id: number | null;
}

export interface BridgeConnectUrl {
  redirect_url: string;
}

// ── Provider interface (abstraction for future swap) ──

export interface BankingProvider {
  createUser(email: string, password: string): Promise<BridgeUser>;
  authenticate(email: string, password: string): Promise<string>;
  getConnectUrl(accessToken: string, callbackUrl: string): Promise<string>;
  getItems(accessToken: string): Promise<BridgeItem[]>;
  getAccounts(accessToken: string): Promise<BridgeAccount[]>;
  getTransactions(
    accessToken: string,
    accountId: number,
    since?: string
  ): Promise<BridgeTransaction[]>;
  getCategories(accessToken: string): Promise<BridgeCategory[]>;
}

// ── Bridge API implementation ──

async function bridgeRequest<T>(
  path: string,
  options: {
    method?: string;
    body?: Record<string, unknown>;
    accessToken?: string;
  } = {}
): Promise<T> {
  const { method = "GET", body, accessToken } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "Bridge-Version": "2021-06-01",
    "Client-Id": BRIDGE_CLIENT_ID,
    "Client-Secret": BRIDGE_CLIENT_SECRET,
  };

  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  return withRetry(
    async () => {
      const response = await fetch(`${BRIDGE_API_URL}/v2${path}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(
          `Bridge API error ${response.status}: ${errorBody}`
        );
      }

      return response.json() as Promise<T>;
    },
    { maxRetries: 3, baseDelay: 1000, maxDelay: 10000 }
  );
}

export const bridgeClient: BankingProvider = {
  async createUser(email: string, password: string): Promise<BridgeUser> {
    return bridgeRequest<BridgeUser>("/users", {
      method: "POST",
      body: { email, password },
    });
  },

  async authenticate(email: string, password: string): Promise<string> {
    const result = await bridgeRequest<{ access_token: string }>(
      "/authenticate",
      {
        method: "POST",
        body: { email, password },
      }
    );
    return result.access_token;
  },

  async getConnectUrl(
    accessToken: string,
    callbackUrl: string
  ): Promise<string> {
    const result = await bridgeRequest<BridgeConnectUrl>("/connect/items/add", {
      method: "POST",
      accessToken,
      body: { redirect_url: callbackUrl },
    });
    return result.redirect_url;
  },

  async getItems(accessToken: string): Promise<BridgeItem[]> {
    const result = await bridgeRequest<{ resources: BridgeItem[] }>("/items", {
      accessToken,
    });
    return result.resources;
  },

  async getAccounts(accessToken: string): Promise<BridgeAccount[]> {
    const result = await bridgeRequest<{ resources: BridgeAccount[] }>(
      "/accounts",
      { accessToken }
    );
    return result.resources;
  },

  async getTransactions(
    accessToken: string,
    accountId: number,
    since?: string
  ): Promise<BridgeTransaction[]> {
    const params = new URLSearchParams();
    if (since) params.set("since", since);
    const query = params.toString() ? `?${params.toString()}` : "";
    const result = await bridgeRequest<{ resources: BridgeTransaction[] }>(
      `/accounts/${accountId}/transactions${query}`,
      { accessToken }
    );
    return result.resources;
  },

  async getCategories(accessToken: string): Promise<BridgeCategory[]> {
    const result = await bridgeRequest<{ resources: BridgeCategory[] }>(
      "/categories",
      { accessToken }
    );
    return result.resources;
  },
};

export function isBridgeConfigured(): boolean {
  return Boolean(BRIDGE_CLIENT_ID && BRIDGE_CLIENT_SECRET);
}

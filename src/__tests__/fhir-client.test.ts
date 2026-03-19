import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { MonEspaceSanteClient, FHIRError, FHIRAuthError } from "@/lib/integrations/mon-espace-sante";
import type { FHIRBundle, FHIRImmunization } from "@/types/fhir";

const CONFIG = {
  baseUrl: "https://fhir.test.esante.gouv.fr",
  clientId: "test-client-id",
  clientSecret: "test-client-secret",
  redirectUri: "https://app.test/callback",
  proSanteConnectUrl: "https://auth.test.esante.gouv.fr",
};

describe("MonEspaceSanteClient", () => {
  let client: MonEspaceSanteClient;
  let fetchSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    client = new MonEspaceSanteClient(CONFIG);
    fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("buildAuthorizationUrl", () => {
    it("builds correct OAuth URL with scopes and state", () => {
      const url = client.buildAuthorizationUrl("random-state", "member-123");

      expect(url).toContain("https://auth.test.esante.gouv.fr/authorize");
      expect(url).toContain("client_id=test-client-id");
      expect(url).toContain("redirect_uri=https%3A%2F%2Fapp.test%2Fcallback");
      expect(url).toContain("state=random-state%3Amember-123");
      expect(url).toContain("response_type=code");
      expect(url).toContain("scope=");
    });
  });

  describe("isTokenValid", () => {
    it("returns false when no token is set", () => {
      expect(client.isTokenValid()).toBe(false);
    });

    it("returns true when token is set and not expired", () => {
      client.setTokens("test-token", new Date(Date.now() + 3600_000));
      expect(client.isTokenValid()).toBe(true);
    });

    it("returns false when token is expired", () => {
      client.setTokens("test-token", new Date(Date.now() - 1000));
      expect(client.isTokenValid()).toBe(false);
    });

    it("returns false when token expires within 1 minute", () => {
      client.setTokens("test-token", new Date(Date.now() + 30_000));
      expect(client.isTokenValid()).toBe(false);
    });
  });

  describe("exchangeCode", () => {
    it("exchanges code for tokens successfully", async () => {
      fetchSpy.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          access_token: "new-access-token",
          refresh_token: "new-refresh-token",
          token_type: "Bearer",
          expires_in: 3600,
        }),
      });

      const result = await client.exchangeCode("auth-code-123");

      expect(result.access_token).toBe("new-access-token");
      expect(result.refresh_token).toBe("new-refresh-token");
      expect(fetchSpy).toHaveBeenCalledWith(
        "https://auth.test.esante.gouv.fr/token",
        expect.objectContaining({ method: "POST" })
      );
    });

    it("throws FHIRAuthError on failed exchange", async () => {
      fetchSpy.mockResolvedValueOnce({
        ok: false,
        text: async () => "invalid_grant",
      });

      await expect(client.exchangeCode("bad-code")).rejects.toThrow(FHIRAuthError);
    });
  });

  describe("authenticate", () => {
    it("authenticates with client credentials", async () => {
      fetchSpy.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          access_token: "client-token",
          token_type: "Bearer",
          expires_in: 3600,
        }),
      });

      await client.authenticate();
      expect(client.isTokenValid()).toBe(true);
    });

    it("throws on failed authentication", async () => {
      fetchSpy.mockResolvedValueOnce({ ok: false });

      await expect(client.authenticate()).rejects.toThrow(FHIRAuthError);
    });
  });

  describe("searchImmunizations", () => {
    it("fetches immunizations with pagination", async () => {
      // Set up a valid token
      client.setTokens("test-token", new Date(Date.now() + 3600_000));

      const page1: FHIRBundle<FHIRImmunization> = {
        resourceType: "Bundle",
        type: "searchset",
        total: 3,
        link: [
          { relation: "self", url: "https://fhir.test/Immunization?page=1" },
          { relation: "next", url: "https://fhir.test/Immunization?page=2" },
        ],
        entry: [
          {
            resource: {
              resourceType: "Immunization",
              id: "imm-1",
              status: "completed",
              vaccineCode: { text: "DTPCa" },
              patient: { reference: "Patient/pat-001" },
            },
          },
          {
            resource: {
              resourceType: "Immunization",
              id: "imm-2",
              status: "completed",
              vaccineCode: { text: "Hib" },
              patient: { reference: "Patient/pat-001" },
            },
          },
        ],
      };

      const page2: FHIRBundle<FHIRImmunization> = {
        resourceType: "Bundle",
        type: "searchset",
        total: 3,
        entry: [
          {
            resource: {
              resourceType: "Immunization",
              id: "imm-3",
              status: "completed",
              vaccineCode: { text: "ROR" },
              patient: { reference: "Patient/pat-001" },
            },
          },
        ],
      };

      fetchSpy
        .mockResolvedValueOnce({ ok: true, json: async () => page1 })
        .mockResolvedValueOnce({ ok: true, json: async () => page2 });

      const results = await client.searchImmunizations("pat-001");

      expect(results).toHaveLength(3);
      expect(results[0].id).toBe("imm-1");
      expect(results[2].id).toBe("imm-3");
      expect(fetchSpy).toHaveBeenCalledTimes(2);
    });

    it("throws FHIRAuthError on 401 response", async () => {
      client.setTokens("expired-token", new Date(Date.now() + 3600_000));

      fetchSpy.mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => ({}),
      });

      // 401 is immediately thrown by withRetry (no retries for auth errors)
      await expect(client.searchImmunizations("pat-001")).rejects.toThrow(FHIRAuthError);
    }, 15000);

    it("throws FHIRError on 500 response with OperationOutcome", async () => {
      client.setTokens("test-token", new Date(Date.now() + 3600_000));

      fetchSpy.mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => ({
          resourceType: "OperationOutcome",
          issue: [{ severity: "error", code: "exception", diagnostics: "Internal server error" }],
        }),
      });

      // withRetry will retry 3 times with backoff before throwing
      await expect(client.searchImmunizations("pat-001")).rejects.toThrow(FHIRError);
    }, 30000);
  });

  describe("refreshToken", () => {
    it("refreshes token successfully", async () => {
      fetchSpy.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          access_token: "refreshed-token",
          refresh_token: "new-refresh",
          token_type: "Bearer",
          expires_in: 3600,
        }),
      });

      const result = await client.refreshToken("old-refresh-token");
      expect(result.access_token).toBe("refreshed-token");
      expect(client.isTokenValid()).toBe(true);
    });

    it("throws FHIRAuthError when refresh fails", async () => {
      fetchSpy.mockResolvedValueOnce({ ok: false });

      await expect(client.refreshToken("bad-token")).rejects.toThrow(FHIRAuthError);
    });
  });
});

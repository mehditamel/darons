import { describe, it, expect, vi, beforeEach } from "vitest";
import { syncMemberHealth, getSyncHistory } from "@/lib/integrations/fhir-sync";
import { MonEspaceSanteClient } from "@/lib/integrations/mon-espace-sante";
import type { FHIRImmunization, FHIRObservation, FHIRAllergyIntolerance, FHIRDocumentReference } from "@/types/fhir";

// Mock Supabase client
function createMockSupabase() {
  const mockData: Record<string, unknown[]> = {};

  const createQuery = (table: string) => {
    let filterMemberId: string | null = null;
    let filterFhirId: string | null = null;

    return {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockImplementation(function(this: ReturnType<typeof createQuery>, col: string, val: string) {
        if (col === "member_id") filterMemberId = val;
        if (col === "fhir_resource_id") filterFhirId = val;
        return this;
      }),
      maybeSingle: vi.fn().mockImplementation(() => {
        const entries = (mockData[table] ?? []) as Array<Record<string, unknown>>;
        const data = entries.find((row) => {
          const matchMember = !filterMemberId || row.member_id === filterMemberId;
          const matchFhir = !filterFhirId || row.fhir_resource_id === filterFhirId;
          return matchMember && matchFhir;
        });
        return { data: data ?? null, error: null };
      }),
      single: vi.fn().mockImplementation(() => ({
        data: (mockData[table] ?? [])[0] ?? null,
        error: null,
      })),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockImplementation(() => ({
        data: mockData[table] ?? [],
        error: null,
      })),
      insert: vi.fn().mockImplementation((row: unknown) => {
        if (!mockData[table]) mockData[table] = [];
        mockData[table].push(row as Record<string, unknown>);
        return { error: null };
      }),
      update: vi.fn().mockReturnThis(),
    };
  };

  return {
    from: vi.fn().mockImplementation((table: string) => createQuery(table)),
    _mockData: mockData,
  };
}

// Mock MES client
function createMockMESClient(overrides: {
  immunizations?: FHIRImmunization[];
  observations?: FHIRObservation[];
  allergies?: FHIRAllergyIntolerance[];
  documents?: FHIRDocumentReference[];
} = {}): MonEspaceSanteClient {
  const client = new MonEspaceSanteClient({
    baseUrl: "https://test.fhir.fr",
    clientId: "test",
    clientSecret: "test",
    redirectUri: "https://app/callback",
    proSanteConnectUrl: "https://auth.test",
  });

  client.searchImmunizations = vi.fn().mockResolvedValue(overrides.immunizations ?? []);
  client.searchObservations = vi.fn().mockResolvedValue(overrides.observations ?? []);
  client.searchAllergyIntolerances = vi.fn().mockResolvedValue(overrides.allergies ?? []);
  client.searchDocumentReferences = vi.fn().mockResolvedValue(overrides.documents ?? []);

  return client;
}

const MEMBER_ID = "member-123";
const HOUSEHOLD_ID = "household-456";
const PATIENT_ID = "patient-789";

describe("FHIR Sync Service", () => {
  describe("syncMemberHealth", () => {
    it("syncs vaccinations from FHIR and creates new records", async () => {
      const supabase = createMockSupabase();
      const client = createMockMESClient({
        immunizations: [
          {
            resourceType: "Immunization",
            id: "imm-new-001",
            meta: { lastUpdated: "2025-06-15T10:00:00Z" },
            status: "completed",
            vaccineCode: { text: "DTPCa" },
            patient: { reference: `Patient/${PATIENT_ID}` },
            occurrenceDateTime: "2025-06-15",
          },
        ],
      });

      const result = await syncMemberHealth(
        supabase as unknown as Parameters<typeof syncMemberHealth>[0],
        client,
        MEMBER_ID,
        HOUSEHOLD_ID,
        PATIENT_ID
      );

      expect(result.success).toBe(true);
      expect(result.totalSynced).toBeGreaterThanOrEqual(1);

      const vaccResult = result.results.find((r) => r.resourceType === "Immunization");
      expect(vaccResult?.created).toBe(1);
      expect(vaccResult?.errors).toHaveLength(0);
    });

    it("returns success with zero synced when no FHIR data exists", async () => {
      const supabase = createMockSupabase();
      const client = createMockMESClient();

      const result = await syncMemberHealth(
        supabase as unknown as Parameters<typeof syncMemberHealth>[0],
        client,
        MEMBER_ID,
        HOUSEHOLD_ID,
        PATIENT_ID
      );

      expect(result.success).toBe(true);
      expect(result.totalSynced).toBe(0);
      expect(result.results).toHaveLength(4); // 4 resource types
    });

    it("handles FHIR API errors gracefully", async () => {
      const supabase = createMockSupabase();
      const client = createMockMESClient();
      (client.searchImmunizations as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error("Serveur FHIR indisponible")
      );

      const result = await syncMemberHealth(
        supabase as unknown as Parameters<typeof syncMemberHealth>[0],
        client,
        MEMBER_ID,
        HOUSEHOLD_ID,
        PATIENT_ID
      );

      expect(result.success).toBe(true); // Partial success
      const vaccResult = result.results.find((r) => r.resourceType === "Immunization");
      expect(vaccResult?.errors.length).toBeGreaterThan(0);
    });

    it("skips immunizations without an id", async () => {
      const supabase = createMockSupabase();
      const client = createMockMESClient({
        immunizations: [
          {
            resourceType: "Immunization",
            status: "completed",
            vaccineCode: { text: "DTPCa" },
            patient: { reference: `Patient/${PATIENT_ID}` },
          },
        ],
      });

      const result = await syncMemberHealth(
        supabase as unknown as Parameters<typeof syncMemberHealth>[0],
        client,
        MEMBER_ID,
        HOUSEHOLD_ID,
        PATIENT_ID
      );

      const vaccResult = result.results.find((r) => r.resourceType === "Immunization");
      expect(vaccResult?.skipped).toBe(1);
      expect(vaccResult?.created).toBe(0);
    });

    it("marks connection as syncing during sync", async () => {
      const supabase = createMockSupabase();
      const client = createMockMESClient();

      await syncMemberHealth(
        supabase as unknown as Parameters<typeof syncMemberHealth>[0],
        client,
        MEMBER_ID,
        HOUSEHOLD_ID,
        PATIENT_ID
      );

      // Check that mes_connections was updated
      const fromCalls = (supabase.from as ReturnType<typeof vi.fn>).mock.calls;
      const mesConnectionCalls = fromCalls.filter(
        (call: string[]) => call[0] === "mes_connections"
      );
      expect(mesConnectionCalls.length).toBeGreaterThanOrEqual(2); // syncing + final status
    });
  });

  describe("getSyncHistory", () => {
    it("returns formatted sync log entries", async () => {
      const supabase = createMockSupabase();
      supabase._mockData["fhir_sync_log"] = [
        {
          resource_type: "Immunization",
          status: "success",
          records_synced: 5,
          completed_at: "2025-11-01T12:00:00Z",
        },
      ];

      const history = await getSyncHistory(
        supabase as unknown as Parameters<typeof getSyncHistory>[0],
        MEMBER_ID
      );

      expect(history).toHaveLength(1);
      expect(history[0].resourceType).toBe("Immunization");
      expect(history[0].recordsSynced).toBe(5);
    });
  });
});

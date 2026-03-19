/**
 * Mon Espace Santé — FHIR R4 Client
 *
 * Client for interacting with the Mon Espace Santé FHIR API.
 * Handles OAuth2 authentication, token management, FHIR resource
 * fetching with automatic pagination and retry logic.
 *
 * Prerequisites for production:
 * 1. ANS referencing (conformity dossier)
 * 2. HDS certification (Health Data Hosting)
 * 3. CI-SIS compliance
 * 4. Pro Santé Connect authentication
 *
 * @see https://esante.gouv.fr/produits-services/mon-espace-sante
 */

import { withRetry } from "@/lib/utils/retry";
import type {
  FHIRBundle,
  FHIRResource,
  FHIRPatient,
  FHIRImmunization,
  FHIRObservation,
  FHIRAllergyIntolerance,
  FHIRDocumentReference,
  FHIROperationOutcome,
} from "@/types/fhir";

// --- Configuration ---

export interface MESClientConfig {
  baseUrl: string;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  proSanteConnectUrl: string;
}

interface TokenResponse {
  access_token: string;
  refresh_token?: string;
  token_type: string;
  expires_in: number;
  scope?: string;
}

// --- Errors ---

export class FHIRError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public operationOutcome?: FHIROperationOutcome
  ) {
    super(message);
    this.name = "FHIRError";
  }
}

export class FHIRAuthError extends FHIRError {
  constructor(message: string) {
    super(message, 401);
    this.name = "FHIRAuthError";
  }
}

// --- Client ---

export class MonEspaceSanteClient {
  private config: MESClientConfig;
  private accessToken: string | null = null;
  private tokenExpiry: Date | null = null;

  constructor(config: MESClientConfig) {
    this.config = config;
  }

  /**
   * Set tokens from stored values (e.g., from database)
   */
  setTokens(accessToken: string, expiryDate: Date): void {
    this.accessToken = accessToken;
    this.tokenExpiry = expiryDate;
  }

  /**
   * Check if current token is valid
   */
  isTokenValid(): boolean {
    if (!this.accessToken || !this.tokenExpiry) return false;
    return this.tokenExpiry.getTime() > Date.now() + 60_000; // 1min buffer
  }

  /**
   * Build the OAuth2 authorization URL for user consent
   */
  buildAuthorizationUrl(state: string, memberId: string): string {
    const url = new URL(`${this.config.proSanteConnectUrl}/authorize`);
    url.searchParams.set("response_type", "code");
    url.searchParams.set("client_id", this.config.clientId);
    url.searchParams.set("redirect_uri", this.config.redirectUri);
    url.searchParams.set("scope", "openid system/Patient.read system/Immunization.read system/Observation.read system/AllergyIntolerance.read system/DocumentReference.read");
    url.searchParams.set("state", `${state}:${memberId}`);
    return url.toString();
  }

  /**
   * Exchange authorization code for tokens
   */
  async exchangeCode(code: string): Promise<TokenResponse> {
    const response = await fetch(`${this.config.proSanteConnectUrl}/token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: this.config.redirectUri,
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new FHIRAuthError(`Échec de l'échange de code OAuth : ${errorText}`);
    }

    const tokenData: TokenResponse = await response.json();
    this.accessToken = tokenData.access_token;
    this.tokenExpiry = new Date(Date.now() + tokenData.expires_in * 1000);

    return tokenData;
  }

  /**
   * Refresh an expired access token
   */
  async refreshToken(refreshToken: string): Promise<TokenResponse> {
    const response = await fetch(`${this.config.proSanteConnectUrl}/token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
      }),
    });

    if (!response.ok) {
      throw new FHIRAuthError("Échec du rafraîchissement du token. Reconnexion nécessaire.");
    }

    const tokenData: TokenResponse = await response.json();
    this.accessToken = tokenData.access_token;
    this.tokenExpiry = new Date(Date.now() + tokenData.expires_in * 1000);

    return tokenData;
  }

  /**
   * Authenticate using client credentials (server-to-server)
   */
  async authenticate(): Promise<void> {
    const response = await fetch(`${this.config.proSanteConnectUrl}/token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        scope: "system/Patient.read system/Immunization.read system/Observation.read system/AllergyIntolerance.read system/DocumentReference.read",
      }),
    });

    if (!response.ok) {
      throw new FHIRAuthError("Échec de l'authentification client credentials.");
    }

    const tokenData: TokenResponse = await response.json();
    this.accessToken = tokenData.access_token;
    this.tokenExpiry = new Date(Date.now() + tokenData.expires_in * 1000);
  }

  /**
   * Generic FHIR request with auth headers and error handling
   */
  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    if (!this.accessToken) {
      throw new FHIRAuthError("Pas de token d'accès. Authentification requise.");
    }

    const url = path.startsWith("http") ? path : `${this.config.baseUrl}${path}`;

    const response = await withRetry(
      async () => {
        const res = await fetch(url, {
          ...options,
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            Accept: "application/fhir+json",
            ...options.headers,
          },
        });

        if (res.status === 401) {
          throw new FHIRAuthError("Token expiré ou invalide.");
        }

        if (!res.ok) {
          let outcome: FHIROperationOutcome | undefined;
          try {
            const body = await res.json();
            if (body.resourceType === "OperationOutcome") {
              outcome = body as FHIROperationOutcome;
            }
          } catch {
            // ignore parse errors
          }
          throw new FHIRError(
            outcome?.issue?.[0]?.diagnostics ?? `Erreur FHIR HTTP ${res.status}`,
            res.status,
            outcome
          );
        }

        return res.json() as Promise<T>;
      },
      { maxRetries: 3, baseDelay: 1000, maxDelay: 10000 }
    );

    return response;
  }

  /**
   * Fetch all pages of a FHIR Bundle search result
   */
  private async fetchAllPages<T extends FHIRResource>(
    initialPath: string
  ): Promise<T[]> {
    const resources: T[] = [];
    let nextUrl: string | null = initialPath;

    while (nextUrl) {
      const bundle: FHIRBundle<T> = await this.request<FHIRBundle<T>>(nextUrl);

      if (bundle.entry) {
        for (const entry of bundle.entry) {
          if (entry.resource) {
            resources.push(entry.resource);
          }
        }
      }

      // Follow next page link
      const nextLink = bundle.link?.find((l) => l.relation === "next");
      nextUrl = nextLink?.url ?? null;

      // Safety: stop if we've fetched too many pages
      if (resources.length > 5000) break;
    }

    return resources;
  }

  // --- Resource-specific methods ---

  async getPatient(patientId: string): Promise<FHIRPatient> {
    return this.request<FHIRPatient>(`/Patient/${patientId}`);
  }

  async searchImmunizations(patientId: string): Promise<FHIRImmunization[]> {
    return this.fetchAllPages<FHIRImmunization>(
      `/Immunization?patient=Patient/${patientId}&_sort=-date&_count=100`
    );
  }

  async searchObservations(
    patientId: string,
    loincCode?: string
  ): Promise<FHIRObservation[]> {
    const params = new URLSearchParams({
      patient: `Patient/${patientId}`,
      _sort: "-date",
      _count: "100",
      category: "vital-signs",
    });
    if (loincCode) {
      params.set("code", `http://loinc.org|${loincCode}`);
    }
    return this.fetchAllPages<FHIRObservation>(`/Observation?${params}`);
  }

  async searchAllergyIntolerances(
    patientId: string
  ): Promise<FHIRAllergyIntolerance[]> {
    return this.fetchAllPages<FHIRAllergyIntolerance>(
      `/AllergyIntolerance?patient=Patient/${patientId}&_count=100`
    );
  }

  async searchDocumentReferences(
    patientId: string
  ): Promise<FHIRDocumentReference[]> {
    return this.fetchAllPages<FHIRDocumentReference>(
      `/DocumentReference?subject=Patient/${patientId}&_sort=-date&_count=50`
    );
  }
}

// --- Factory ---

export function createMESClient(): MonEspaceSanteClient {
  const baseUrl = process.env.MES_FHIR_BASE_URL;
  const clientId = process.env.MES_CLIENT_ID;
  const clientSecret = process.env.MES_CLIENT_SECRET;
  const redirectUri = process.env.MES_REDIRECT_URI;
  const proSanteConnectUrl = process.env.PRO_SANTE_CONNECT_URL;

  if (!baseUrl || !clientId || !clientSecret || !redirectUri || !proSanteConnectUrl) {
    throw new Error(
      "Configuration Mon Espace Santé incomplète. " +
      "Vérifiez les variables MES_FHIR_BASE_URL, MES_CLIENT_ID, MES_CLIENT_SECRET, " +
      "MES_REDIRECT_URI et PRO_SANTE_CONNECT_URL."
    );
  }

  return new MonEspaceSanteClient({
    baseUrl,
    clientId,
    clientSecret,
    redirectUri,
    proSanteConnectUrl,
  });
}

/**
 * Check if Mon Espace Santé integration is configured
 */
export function isMESConfigured(): boolean {
  return !!(
    process.env.MES_FHIR_BASE_URL &&
    process.env.MES_CLIENT_ID &&
    process.env.MES_CLIENT_SECRET
  );
}
